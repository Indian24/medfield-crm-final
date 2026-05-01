from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Keys
    GROQ_API_KEY: str = ""

    # Database
    DATABASE_URL: str = "sqlite:///./medfield_crm.db"

    # Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # AI Model
    PRIMARY_MODEL: str = "gemma2-9b-it"
    FALLBACK_MODEL: str = "llama-3.3-70b-versatile"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
