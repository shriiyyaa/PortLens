from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    app_name: str = "PortLens"
    debug: bool = True
    
    # Database - Using SQLite for local development (no Docker needed)
    database_url: str = "sqlite+aiosqlite:///./portlens.db"
    
    # JWT
    jwt_secret_key: str = "super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # AI APIs
    openai_api_key: str = ""
    google_ai_api_key: str = ""  # Gemini API key
    
    # Redis (optional for local dev)
    redis_url: str = "redis://localhost:6379/0"
    
    # Storage
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 50
    
    # CORS
    frontend_url: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
