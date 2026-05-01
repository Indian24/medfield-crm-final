"""
CRUD router for HCP interactions.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.interaction import (
    InteractionCreate,
    InteractionUpdate,
    InteractionResponse,
)
from app.services.interaction_service import InteractionService

router = APIRouter(prefix="/interactions", tags=["Interactions"])


@router.get("", response_model=List[InteractionResponse])
def list_interactions(db: Session = Depends(get_db)):
    """Get all interactions, ordered by most recent."""
    interactions = InteractionService.get_all(db)
    return [InteractionResponse(**i.to_dict()) for i in interactions]


@router.get("/{interaction_id}", response_model=InteractionResponse)
def get_interaction(interaction_id: str, db: Session = Depends(get_db)):
    """Get a single interaction by ID."""
    interaction = InteractionService.get_by_id(db, interaction_id)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return InteractionResponse(**interaction.to_dict())


@router.post("", response_model=InteractionResponse, status_code=201)
def create_interaction(data: InteractionCreate, db: Session = Depends(get_db)):
    """Create a new HCP interaction."""
    interaction = InteractionService.create(db, data)
    return InteractionResponse(**interaction.to_dict())


@router.put("/{interaction_id}", response_model=InteractionResponse)
def update_interaction(
    interaction_id: str, data: InteractionUpdate, db: Session = Depends(get_db)
):
    """Update an existing interaction."""
    interaction = InteractionService.update(db, interaction_id, data)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return InteractionResponse(**interaction.to_dict())


@router.delete("/{interaction_id}")
def delete_interaction(interaction_id: str, db: Session = Depends(get_db)):
    """Delete an interaction."""
    success = InteractionService.delete(db, interaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return {"detail": "Interaction deleted"}
