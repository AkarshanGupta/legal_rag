from fastapi import Header, HTTPException
from config import ADMIN_API_KEY


def verify_admin(x_admin_token: str = Header(default=None, alias="X-Admin-Token")):
    if x_admin_token != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Admin authentication failed.")
    return True
