from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db
from app.api.router import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    await init_db()
    
    # Reset any stuck portfolios
    from app.services.ai_service import reset_stuck_portfolios
    # Run stuck portfolio cleanup in background to ensure fast startup
    try:
        asyncio.create_task(reset_stuck_portfolios())
    except Exception as e:
        print(f"Failed to trigger startup cleanup: {e}")
    
    yield
    # Shutdown
    pass


# Create FastAPI application
app = FastAPI(
    title="PortLens API",
    description="AI-powered Design Intelligence Platform for evaluating creative portfolios",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS - include all possible frontend origins
allowed_origins = [
    settings.frontend_url,
    "https://port-lens.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
print(f"CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "PortLens API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "version": "v_final_verified"}
