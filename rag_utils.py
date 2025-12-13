import os
import hashlib
import uuid
from io import BytesIO
from typing import List, Optional

from fastapi import UploadFile, HTTPException
from PyPDF2 import PdfReader

import google.generativeai as genai

from rate_limiter import api_rate_limiter
from embedding_cache import get_cached_embedding, cache_embedding
from config import collection, groq_client, GROQ_MODEL_NAME, EMBED_MODEL_NAME

# Optional local embedding support (sentence-transformers)
USE_LOCAL_EMBEDDINGS = os.getenv("USE_LOCAL_EMBEDDINGS", "false").lower() in ("1", "true", "yes")
LOCAL_EMBED_MODEL_NAME = os.getenv("LOCAL_EMBED_MODEL_NAME", "all-MiniLM-L6-v2")
_local_encoder = None
_local_embed_dim = None

if USE_LOCAL_EMBEDDINGS:
    try:
        from sentence_transformers import SentenceTransformer
        _local_encoder = SentenceTransformer(LOCAL_EMBED_MODEL_NAME)
        # Get the embedding dimension from the model
        _local_embed_dim = _local_encoder.get_sentence_embedding_dimension()
        print(f"✓ Local embedding enabled using '{LOCAL_EMBED_MODEL_NAME}' (dim={_local_embed_dim})")
    except Exception as e:
        print(f"✗ Failed to load local sentence-transformers model: {e}")
        _local_encoder = None
        _local_embed_dim = None


# ------------- basic text helpers -------------

def normalize_text(t: str) -> str:
    return " ".join(t.split())


def compute_doc_hash(text: str) -> str:
    normalized = normalize_text(text)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    text = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        text.append(page_text)
    return "\n".join(text)


def extract_text_from_upload(file: UploadFile) -> str:
    raw = file.file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(raw)

    try:
        return raw.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    text = normalize_text(text)
    chunks = []
    start = 0
    n = len(text)

    while start < n:
        end = min(start + chunk_size, n)
        chunk = text[start:end]
        chunks.append(chunk)
        if end == n:
            break
        start = end - overlap

    return chunks


# ------------- local embedding helper -------------

def _local_embed_batch(texts: List[str]) -> List[List[float]]:
    if not _local_encoder:
        raise RuntimeError("Local encoder not available")
    # SentenceTransformer.encode() returns a numpy array of shape (n_texts, embedding_dim)
    # Always returns 2D array even for single text: (1, dim) or (n, dim)
    embs = _local_encoder.encode(texts, convert_to_numpy=True)
    # Convert numpy array to list of lists - iterate over first dimension (rows)
    return [emb.tolist() for emb in embs]


# ------------- embeddings -------------

def embed_texts(texts: List[str], task_type: str = "retrieval_document") -> List[List[float]]:
    """Embed a list of texts. Uses cache, local encoder (if enabled) or Gemini otherwise.

    Behavior changes made to reduce Gemini API usage:
    - Check local cache first per text (no API call)
    - If USE_LOCAL_EMBEDDINGS=True and a local model is available, use it for all uncached texts
    - Otherwise fall back to genai.embed_content for each uncached text (rate-limited)
    """
    embeddings: List[List[float]] = []
    uncached_texts = []
    uncached_indices = []

    # Determine embedding dimension - use local if available, otherwise Gemini default (3072 for embedding-001)
    using_local = USE_LOCAL_EMBEDDINGS and _local_encoder
    embed_dim = _local_embed_dim if using_local else 3072
    
    # First pass: fill from cache where possible (only if dimension matches)
    for i, t in enumerate(texts):
        if not t.strip():
            embeddings.append([0.0] * embed_dim)
            continue

        cached = get_cached_embedding(t)
        # Only use cached embedding if dimension matches current embedding model
        if cached and len(cached) == embed_dim:
            print(f"✓ Using cached embedding (no API call) for chunk {i}")
            embeddings.append(cached)
        else:
            # placeholder to be filled later
            embeddings.append(None)
            uncached_texts.append(t)
            uncached_indices.append(i)

    # If no uncached texts, return
    if not uncached_texts:
        return embeddings

    # If local embeddings are enabled, do a single batch local encode
    if using_local:
        try:
            local_embs = _local_embed_batch(uncached_texts)
            for idx, emb in zip(uncached_indices, local_embs):
                embeddings[idx] = emb
                cache_embedding(texts[idx], emb)
            return embeddings
        except Exception as e:
            print(f"⚠️ Local embedding failed, falling back to Gemini: {e}")
            # If local fails, switch to Gemini dimension (3072 for embedding-001)
            embed_dim = 3072

    # Otherwise fallback to genai per-text (rate-limited). We do one API call per uncached text.
    for i, t in zip(uncached_indices, uncached_texts):
        api_rate_limiter.sync_wait_if_needed()
        try:
            resp = genai.embed_content(
                model=EMBED_MODEL_NAME,
                content=t,
                task_type=task_type,
            )
            emb = resp["embedding"] if isinstance(resp, dict) else resp.embedding
            embeddings[i] = emb
            cache_embedding(texts[i], emb)
            print(f"✓ Fetched embedding from Gemini for chunk {i}")
        except Exception as e:
            print(f"✗ Failed to embed with Gemini for chunk {i}: {e}")
            # Use Gemini dimension (3072 for embedding-001) for error case
            embeddings[i] = [0.0] * 3072

    return embeddings


# ------------- dedupe & ingest -------------

def ensure_not_duplicate(doc_hash: str) -> bool:
    """
    Returns True if we can insert (no existing doc with this hash).
    Returns False if duplicate exists.
    """
    try:
        existing = collection.get(where={"doc_hash": doc_hash}, limit=1)
        ids = existing.get("ids") or []
        return len(ids) == 0
    except Exception:
        # If filter fails, allow insertion (safer for demo)
        return True


def ingest_document(
    full_text: str,
    uploader_type: str,
    uploader_id: Optional[str] = None,
    extra_metadata: Optional[dict] = None,
) -> dict:
    """
    Chunk + embed + store in Chroma Cloud.
    Uses doc_hash metadata so duplicates are not re-ingested.
    """
    if not full_text or not full_text.strip():
        raise ValueError("Document text is empty")

    doc_hash = compute_doc_hash(full_text)
    is_new = ensure_not_duplicate(doc_hash)

    doc_id = str(uuid.uuid4())

    if not is_new:
        # Return existing document_id if known
        try:
            existing = collection.get(where={"doc_hash": doc_hash}, limit=1)
            if existing.get("metadatas"):
                doc_id = existing["metadatas"][0].get("document_id", doc_id)
        except Exception:
            pass

        return {
            "document_id": doc_id,
            "is_new": False,
            "message": "Duplicate document detected; not ingested again.",
        }

    chunks = chunk_text(full_text)
    embeddings = embed_texts(chunks, task_type="retrieval_document")

    metadatas = []
    for i in range(len(chunks)):
        meta = {
            "document_id": doc_id,
            "doc_hash": doc_hash,
            "chunk_index": i,
            "uploader_type": uploader_type,
        }
        if uploader_id:
            meta["uploader_id"] = uploader_id
        if extra_metadata:
            meta.update(extra_metadata)
        metadatas.append(meta)

    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]

    collection.add(
        ids=ids,
        documents=chunks,
        metadatas=metadatas,
        embeddings=embeddings,
    )

    return {
        "document_id": doc_id,
        "is_new": True,
        "message": "Document ingested successfully.",
    }


# ------------- retrieval & prompts -------------

def retrieve_context(document_ids: List[str], question: str, k: int = 12) -> List[str]:
    """
    Retrieve top-k chunks from given document_ids.
    """
    if not document_ids:
        return []

    # Embed the question (uses local encoder if enabled)
    query_embedding = embed_texts([question], task_type="retrieval_query")[0]

    where_filter = {"document_id": {"$in": document_ids}}

    result = collection.query(
        query_embeddings=[query_embedding],
        n_results=k,
        where=where_filter,
    )

    docs = result.get("documents", [[]])[0]
    return docs


def build_legal_prompt(
    mode: str,
    question: str,
    context_chunks: List[str],
    output_language: str = "English",
) -> str:
    context_text = "\n\n---\n\n".join(context_chunks)

    system = f"""
You are LegalEase, an AI-powered legal document assistant.
Task: {mode}.
Explain using clear, non-technical language.
Output language: {output_language}.
If something is missing from the context, say you are unsure instead of inventing facts.
"""

    prompt = f"""{system}

Context from documents and legal knowledge:
{context_text}

User request:
{question}

Answer in {output_language}:
"""
    return prompt


def call_llm(prompt: str) -> str:
    """
    Call Groq LLM to generate response. No rate limiting applied.
    """
    response = groq_client.chat.completions.create(
        model=GROQ_MODEL_NAME,
        messages=[
            {"role": "user", "content": prompt}
        ],
    )
    return response.choices[0].message.content
