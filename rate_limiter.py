import time
import asyncio
from typing import Callable, Any
from functools import wraps

class RateLimiter:
    """Rate limiter to prevent exceeding API quotas"""
    
    def __init__(self, calls_per_minute: int = 1):
        """
        calls_per_minute: How many API calls allowed per minute
        For Gemini free tier: 1 request per minute is SAFE (60 second wait)
        """
        self.calls_per_minute = calls_per_minute
        self.min_interval = 60.0 / calls_per_minute  # seconds between calls
        self.last_call_time = 0
    
    def sync_wait_if_needed(self):
        """Wait BEFORE making the next API call"""
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        
        if time_since_last_call < self.min_interval:
            wait_time = self.min_interval - time_since_last_call
            print(f"⏳ Rate limit: waiting {wait_time:.1f}s before next API call...")
            time.sleep(wait_time)
        
        self.last_call_time = time.time()

# Global rate limiter instance - 1 call per minute for free tier
api_rate_limiter = RateLimiter(calls_per_minute=1)
