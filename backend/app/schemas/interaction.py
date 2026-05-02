from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class InteractionBase(BaseModel):
    """Base schema for interaction data."""
    hcp_name: str = Field(..., min_length=1, max_length=255, description="Healthcare Professional name")
    interaction_type: str = Field(default="Meeting", description="Type: Meeting, Call, Visit, Other")
    interaction_date: str = Field(..., description="Date of interaction (YYYY-MM-DD)")
    interaction_time: Optional[str] = Field(default="", description="Time of interaction (HH:MM)")
    attendees: Optional[str] = Field(default="", description="Comma-separated attendee names")
    topics_discussed: Optional[str] = Field(default="", description="Topics and products discussed")
    materials_shared: Optional[str] = Field(default="", description="Materials shared with HCP")
    samples_distributed: Optional[str] = Field(default="", description="Samples given to HCP")
    sentiment: str = Field(default="Neutral", description="HCP sentiment: Positive, Neutral, Negative")
    outcomes: Optional[str] = Field(default="", description="Meeting outcomes")
    follow_up_actions: Optional[str] = Field(default="", description="Follow-up actions needed")


class InteractionCreate(InteractionBase):
    """Schema for creating a new interaction."""
    raw_chat_text: Optional[str] = Field(default="", description="Original chat text if AI-generated")


class InteractionUpdate(BaseModel):
    """Schema for updating an interaction (all fields optional)."""
    hcp_name: Optional[str] = None
    interaction_type: Optional[str] = None
    interaction_date: Optional[str] = None
    interaction_time: Optional[str] = None
    attendees: Optional[str] = None
    topics_discussed: Optional[str] = None
    materials_shared: Optional[str] = None
    samples_distributed: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None
    ai_summary: Optional[str] = None


class InteractionResponse(InteractionBase):
    """Schema for interaction response."""
    id: str
    ai_summary: str = ""
    raw_chat_text: str = ""
    created_at: str = ""
    updated_at: str = ""

    class Config:
        from_attributes = True


class AiChatRequest(BaseModel):
    """Schema for AI chat requests."""
    message: str = Field(..., min_length=1, max_length=5000)
    tool: Optional[str] = None
    interaction_id: Optional[str] = None


class AiChatResponse(BaseModel):
    """Schema for AI chat responses."""
    reply: str
    tool_used: str
    structured_data: Optional[dict] = None
