import json
import os
import hashlib
from typing import List, Dict

CACHE_FILE = "embedding_cache.json"

def get_cache():
    """Load embedding cache from file"""
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            return json.load(f)
    return {}

def save_cache(cache: Dict):
    """Save embedding cache to file"""
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f)

def get_text_hash(text: str) -> str:
    """Get hash of text"""
    return hashlib.sha256(text.encode()).hexdigest()

def get_cached_embedding(text: str):
    """Get embedding from cache if exists"""
    cache = get_cache()
    text_hash = get_text_hash(text)
    return cache.get(text_hash)

def cache_embedding(text: str, embedding: List[float]):
    """Cache an embedding"""
    cache = get_cache()
    text_hash = get_text_hash(text)
    cache[text_hash] = embedding
    save_cache(cache)
