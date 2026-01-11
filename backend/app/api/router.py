from fastapi import APIRouter

from app.api.v1 import auth, portfolios, analysis

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(portfolios.router)
router.include_router(analysis.router)
