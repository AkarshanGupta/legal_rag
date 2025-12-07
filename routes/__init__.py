from fastapi import APIRouter
from .admin_routes import router as admin_router
from .user_routes import router as user_router
from .task_routes import router as task_router

api_router = APIRouter()
api_router.include_router(admin_router)
api_router.include_router(user_router)
api_router.include_router(task_router)