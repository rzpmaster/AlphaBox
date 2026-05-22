from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.leader import Leader
from app.models.user import User, UserRole
from app.schemas.leader import LeaderCreateRequest, LeaderRead, LeaderUpdateRequest

router = APIRouter()


@router.get("", response_model=list[LeaderRead])
def list_leaders(db: Session = Depends(get_db)) -> list[Leader]:
    return list(db.scalars(select(Leader).where(Leader.is_published.is_(True)).order_by(Leader.created_at.desc())))


@router.post("/me", response_model=LeaderRead, status_code=status.HTTP_201_CREATED)
def create_my_leader_profile(
    payload: LeaderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Leader:
    if current_user.leader_profile:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Leader profile already exists")
    if db.scalar(select(Leader).where(Leader.handle == payload.handle)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Handle already taken")

    leader = Leader(user_id=current_user.id, **payload.model_dump())
    if current_user.role != UserRole.ADMIN.value:
        current_user.role = UserRole.LEADER.value
    db.add(leader)
    db.commit()
    db.refresh(leader)
    return leader


@router.get("/me/profile", response_model=LeaderRead)
def get_my_leader_profile(current_user: User = Depends(get_current_user)) -> Leader:
    if not current_user.leader_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leader profile not found")
    return current_user.leader_profile


@router.patch("/me/profile", response_model=LeaderRead)
def update_my_leader_profile(
    payload: LeaderUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Leader:
    leader = current_user.leader_profile
    if not leader:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leader profile not found")

    existing = db.scalar(select(Leader).where(Leader.handle == payload.handle, Leader.id != leader.id))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Handle already taken")

    for field, value in payload.model_dump().items():
        setattr(leader, field, value)
    db.commit()
    db.refresh(leader)
    return leader


@router.get("/{leader_id}", response_model=LeaderRead)
def get_leader(leader_id: int, db: Session = Depends(get_db)) -> Leader:
    leader = db.get(Leader, leader_id)
    if not leader or not leader.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leader not found")
    return leader
