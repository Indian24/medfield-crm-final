import uuid
from datetime import datetime, date, time
from sqlalchemy import Column, String, Date, Time, Text, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class Interaction(Base):
    """SQLAlchemy model for HCP interactions."""

    __tablename__ = "interactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    hcp_name = Column(String(255), nullable=False, index=True)
    interaction_type = Column(String(50), nullable=False, default="Meeting")
    interaction_date = Column(String(20), nullable=False)
    interaction_time = Column(String(10), nullable=True)
    attendees = Column(Text, nullable=True, default="")
    topics_discussed = Column(Text, nullable=True, default="")
    materials_shared = Column(Text, nullable=True, default="")
    samples_distributed = Column(Text, nullable=True, default="")
    sentiment = Column(String(20), nullable=False, default="Neutral")
    outcomes = Column(Text, nullable=True, default="")
    follow_up_actions = Column(Text, nullable=True, default="")
    ai_summary = Column(Text, nullable=True, default="")
    raw_chat_text = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "hcp_name": self.hcp_name,
            "interaction_type": self.interaction_type,
            "interaction_date": self.interaction_date,
            "interaction_time": self.interaction_time,
            "attendees": self.attendees or "",
            "topics_discussed": self.topics_discussed or "",
            "materials_shared": self.materials_shared or "",
            "samples_distributed": self.samples_distributed or "",
            "sentiment": self.sentiment,
            "outcomes": self.outcomes or "",
            "follow_up_actions": self.follow_up_actions or "",
            "ai_summary": self.ai_summary or "",
            "raw_chat_text": self.raw_chat_text or "",
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "updated_at": self.updated_at.isoformat() if self.updated_at else "",
        }
