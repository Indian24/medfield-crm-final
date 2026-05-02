from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # =========================
    # 🔐 API Keys
    # =========================
    GROQ_API_KEY: str

    # =========================
    # 🗄️ Database
    # =========================
    DATABASE_URL: str = "sqlite:///./medfield_crm.db"

    # =========================
    # 🚀 Server Config
    # =========================
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # =========================
    # 🤖 AI Models (Groq)
    # =========================
    PRIMARY_MODEL: str = "llama-3.3-70b-versatile"
    FALLBACK_MODEL: str = "llama-3.1-8b-instant"

    # =========================
    # 🌐 CORS
    # =========================
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:8080",
    ]

    # =========================
    # ⚙️ Pydantic Config
    # =========================
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()