"""
AI router — exposes LangGraph agent endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.interaction import AiChatRequest, AiChatResponse
from app.agents.hcp_agent import run_agent

router = APIRouter(prefix="/ai", tags=["AI Agent"])


@router.post("/chat", response_model=AiChatResponse)
def ai_chat(request: AiChatRequest):
    """General AI chat endpoint — routes to appropriate tool automatically."""
    result = run_agent(request.message, tool_hint=request.tool)
    return AiChatResponse(**result)


@router.post("/log", response_model=AiChatResponse)
def ai_log(request: AiChatRequest):
    """Log an interaction using the AI agent (forces log_interaction tool)."""
    result = run_agent(request.message, tool_hint="log_interaction")
    return AiChatResponse(**result)


@router.post("/edit", response_model=AiChatResponse)
def ai_edit(request: AiChatRequest):
    """Edit an interaction using the AI agent (forces edit_interaction tool)."""
    result = run_agent(request.message, tool_hint="edit_interaction")
    return AiChatResponse(**result)


@router.post("/summarize", response_model=AiChatResponse)
def ai_summarize(request: AiChatRequest):
    """Summarize an interaction using the AI agent."""
    result = run_agent(request.message, tool_hint="summarize_interaction")
    return AiChatResponse(**result)


@router.post("/followup", response_model=AiChatResponse)
def ai_followup(request: AiChatRequest):
    """Suggest follow-up actions using the AI agent."""
    result = run_agent(request.message, tool_hint="suggest_followup")
    return AiChatResponse(**result)


@router.post("/extract", response_model=AiChatResponse)
def ai_extract(request: AiChatRequest):
    """Extract entities using the AI agent."""
    result = run_agent(request.message, tool_hint="extract_entities")
    return AiChatResponse(**result)


@router.post("/sentiment", response_model=AiChatResponse)
def ai_sentiment(request: AiChatRequest):
    """Analyze sentiment using the AI agent."""
    result = run_agent(request.message, tool_hint="analyze_sentiment")
    return AiChatResponse(**result)
