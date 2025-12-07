import time
import asyncio
from typing import Callable, Any
from functools import wraps

class RateLimiter:
    """Rate limiter to prevent exceeding API quotas"""
    
    def __init__(self, calls_per_minute: int = 3):
        """
        calls_per_minute: How many API calls allowed per minute
        For OpenAI free tier: ~3-4 requests per minute is safe
        """
        self.calls_per_minute = calls_per_minute
        self.min_interval = 60.0 / calls_per_minute  # seconds between calls
        self.last_call_time = 0
        self.queue = asyncio.Queue()
    
    async def wait_if_needed(self):
        """Wait before making the next API call"""
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        
        if time_since_last_call < self.min_interval:
            wait_time = self.min_interval - time_since_last_call
            print(f"⏳ Rate limit: waiting {wait_time:.1f}s before next API call...")
            await asyncio.sleep(wait_time)
        
        self.last_call_time = time.time()
    
    def sync_wait_if_needed(self):
        """Synchronous version for non-async functions"""
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        
        if time_since_last_call < self.min_interval:
            wait_time = self.min_interval - time_since_last_call
            print(f"⏳ Rate limit: waiting {wait_time:.1f}s before next API call...")
            time.sleep(wait_time)
        
        self.last_call_time = time.time()

# Global rate limiter instance
api_rate_limiter = RateLimiter(calls_per_minute=3)
