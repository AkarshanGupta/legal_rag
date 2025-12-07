import os
from dotenv import load_dotenv

import chromadb
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing in environment/.env")

CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE")
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

# ---------- Gemini setup ----------
genai.configure(api_key=GEMINI_API_KEY)

LLM_MODEL_NAME = "gemini-2.0-flash"
EMBED_MODEL_NAME = "models/gemini-embedding-001"

llm_model = genai.GenerativeModel(LLM_MODEL_NAME)

# ---------- Chroma Cloud client (v2 API) ----------
print(f"Connecting to ChromaDB Cloud (v2 API)...")
print(f"Tenant: {CHROMA_TENANT}")
print(f"Database: {CHROMA_DATABASE}")

try:
    # The newer chromadb version uses a simpler API
    client = chromadb.CloudClient(
        tenant=CHROMA_TENANT,
        database=CHROMA_DATABASE,
        api_key=CHROMA_API_KEY
    )
    
    print("✓ Successfully connected to ChromaDB Cloud")
    
    collection = client.get_or_create_collection(CHROMA_COLLECTION)
    print(f"✓ Collection '{CHROMA_COLLECTION}' ready")
    
except Exception as e:
    print(f"✗ Failed to connect to ChromaDB Cloud: {e}")
    print("\nTroubleshooting steps:")
    print("1. Make sure chromadb is updated: pip install --upgrade chromadb")
    print("2. Verify your API key is correct in the .env file")
    print("3. Ensure your tenant and database IDs are correct")
    print("4. Visit https://app.trychroma.com/ to verify your credentials")
    raise