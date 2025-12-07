import hashlib
import uuid
from io import BytesIO
from typing import List, Optional

from fastapi import UploadFile, HTTPException
from PyPDF2 import PdfReader

import google.generativeai as genai
from rate_limiter import api_rate_limiter

from config import collection, llm_model, EMBED_MODEL_NAME


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


# ------------- embeddings -------------

def embed_texts(texts: List[str], task_type: str = "retrieval_document") -> List[List[float]]:
    embeddings = []
    for t in texts:
        if not t.strip():
            embeddings.append([0.0] * 1536)
            continue

        api_rate_limiter.sync_wait_if_needed()
        
        from config import llm_client, EMBED_MODEL_NAME
        resp = llm_client.embeddings.create(
            model=EMBED_MODEL_NAME,
            input=t
        )
        emb = resp.data[0].embedding
        embeddings.append(emb)
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


def call_gemini(prompt: str) -> str:
    api_rate_limiter.sync_wait_if_needed()
    
    from config import llm_client, LLM_MODEL_NAME
    resp = llm_client.chat.completions.create(
        model=LLM_MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are LegalEase, an AI-powered legal document assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000
    )
    return resp.choices[0].message.content
