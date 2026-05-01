from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.interaction import Interaction
from app.schemas.interaction import InteractionCreate, InteractionUpdate


class InteractionService:
    """Service layer for interaction CRUD operations."""

    @staticmethod
    def get_all(db: Session) -> List[Interaction]:
        return db.query(Interaction).order_by(Interaction.created_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, interaction_id: str) -> Optional[Interaction]:
        return db.query(Interaction).filter(Interaction.id == interaction_id).first()

    @staticmethod
    def get_by_hcp_name(db: Session, hcp_name: str) -> List[Interaction]:
        return db.query(Interaction).filter(
            Interaction.hcp_name.ilike(f"%{hcp_name}%")
        ).all()

    @staticmethod
    def create(db: Session, data: InteractionCreate) -> Interaction:
        interaction = Interaction(**data.model_dump())
        db.add(interaction)
        db.commit()
        db.refresh(interaction)
        return interaction

    @staticmethod
    def update(db: Session, interaction_id: str, data: InteractionUpdate) -> Optional[Interaction]:
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(interaction, field, value)
        db.commit()
        db.refresh(interaction)
        return interaction

    @staticmethod
    def delete(db: Session, interaction_id: str) -> bool:
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return False
        db.delete(interaction)
        db.commit()
        return True
