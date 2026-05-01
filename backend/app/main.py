"""
MedField CRM — FastAPI Backend Entry Point

Provides REST API for HCP interaction CRUD and AI-powered processing
using LangGraph agent with Groq's gemma2-9b-it model.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.session import create_tables
from app.routers import interactions, ai

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="MedField CRM API",
    description="AI-powered CRM backend for HCP interaction management in life sciences",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(interactions.router)
app.include_router(ai.router)


@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    create_tables()


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "MedField CRM API",
        "ai_model": settings.PRIMARY_MODEL,
        "version": "1.0.0",
    }
