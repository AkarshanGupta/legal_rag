import os
from dotenv import load_dotenv

import google.generativeai as genai
from groq import Groq

load_dotenv()

# GEMINI_API_KEY is optional - only needed for embedding fallback if local embeddings fail
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE", "").strip()  # Remove spaces
CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "legalease_docs")

if not (CHROMA_API_KEY and CHROMA_TENANT and CHROMA_DATABASE):
    raise RuntimeError("Chroma Cloud env vars missing (CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE)")

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")
if not ADMIN_API_KEY:
    raise RuntimeError("ADMIN_API_KEY is missing in environment/.env")

# ---------- CORS / Origin policy ----------
_ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", "*")

if _ALLOWED_ORIGINS_ENV.strip() == "*" or not _ALLOWED_ORIGINS_ENV.strip():
    ALLOWED_ORIGINS = ["*"]
else:
    ALLOWED_ORIGINS = [
        origin.strip()
        for origin in _ALLOWED_ORIGINS_ENV.split(",")
        if origin.strip()
    ]

# ---------- Gemini setup (for embedding fallback only) ----------
# Only configure if API key is provided (needed for embedding fallback)
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

EMBED_MODEL_NAME = "models/gemini-embedding-001"

# ---------- Groq LLM setup ----------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing in environment/.env")

groq_client = Groq(api_key=GROQ_API_KEY)
GROQ_MODEL_NAME = "llama-3.3-70b-versatile"

# ---------- Chroma Cloud client (v2 API) - Lazy Loading ----------
# Global variables for lazy loading
client = None
collection = None

def get_chroma_client():
    """Lazy load ChromaDB client - only connects when first called"""
    global client, collection
    
    if client is not None:
        return client, collection
    
    import chromadb
    
    print(f"Connecting to ChromaDB Cloud...")
    print(f"Tenant: {CHROMA_TENANT}")
    print(f"Database: '{CHROMA_DATABASE}'")
    
    try:
        client = chromadb.CloudClient(
            tenant=CHROMA_TENANT,
            database=CHROMA_DATABASE,
            api_key=CHROMA_API_KEY
        )
        print("✓ Successfully connected to ChromaDB Cloud")
        
        collection = client.get_or_create_collection(CHROMA_COLLECTION)
        print(f"✓ Collection '{CHROMA_COLLECTION}' ready")
        
    except Exception as e:
        print(f"✗ ChromaDB connection error: {e}")
        # Try 'default' fallback
        try:
            client = chromadb.CloudClient(
                tenant=CHROMA_TENANT,
                database='default',
                api_key=CHROMA_API_KEY
            )
            print("✓ Connected with 'default' database")
            collection = client.get_or_create_collection(CHROMA_COLLECTION)
        except Exception as e2:
            print(f"✗ Failed: {e2}")
            raise
    
    return client, collection