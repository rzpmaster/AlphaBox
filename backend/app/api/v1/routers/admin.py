from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.v1.deps import require_admin
from app.db.session import get_db
from app.models.invitation import InvitationCode
from app.models.leader import Leader
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.invitation import InvitationCreateRequest, InvitationRead, InvitationWithStatus
from app.schemas.user import AdminUserRead, UserRead
from app.services.invitations import create_invitation_codes

router = APIRouter()


@router.post("/invitation-codes", response_model=list[InvitationRead])
def create_codes(
    payload: InvitationCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[InvitationRead]:
    return create_invitation_codes(db, current_user.id, payload.count)


@router.get("/invitation-codes", response_model=list[InvitationWithStatus])
def list_codes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[InvitationWithStatus]:
    invitations = db.scalars(select(InvitationCode).order_by(InvitationCode.created_at.desc())).all()
    return [
        InvitationWithStatus(
            id=invitation.id,
            code=invitation.code,
            created_by_id=invitation.created_by_id,
            used_by_id=invitation.used_by_id,
            used_at=invitation.used_at,
            created_at=invitation.created_at,
            is_used=invitation.used_by_id is not None,
        )
        for invitation in invitations
    ]


@router.delete("/invitation-codes/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unused_code(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> None:
    invitation = db.get(InvitationCode, invitation_id)
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation code not found")
    if invitation.used_by_id is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Used invitation codes cannot be deleted")
    db.delete(invitation)
    db.commit()


@router.get("/users", response_model=list[AdminUserRead])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[AdminUserRead]:
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    leader_ids_by_user_id = {
        user_id: leader_id for user_id, leader_id in db.execute(select(Leader.user_id, Leader.id)).all()
    }
    following_counts = dict(
        db.execute(select(Subscription.user_id, func.count(Subscription.id)).group_by(Subscription.user_id)).all()
    )
    follower_counts_by_leader_id = dict(
        db.execute(select(Subscription.leader_id, func.count(Subscription.id)).group_by(Subscription.leader_id)).all()
    )

    result: list[AdminUserRead] = []
    for user in users:
        leader_id = leader_ids_by_user_id.get(user.id)
        result.append(
            AdminUserRead(
                id=user.id,
                email=user.email,
                display_name=user.display_name,
                role=user.role,
                is_active=user.is_active,
                created_at=user.created_at,
                leader_id=leader_id,
                following_count=following_counts.get(user.id, 0),
                follower_count=follower_counts_by_leader_id.get(leader_id, 0) if leader_id else 0,
            )
        )
    return result


@router.post("/users/{user_id}/promote-admin", response_model=UserRead)
def promote_user_to_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = "admin"
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/ban", response_model=UserRead)
def ban_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admins cannot ban themselves")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/unban", response_model=UserRead)
def unban_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
