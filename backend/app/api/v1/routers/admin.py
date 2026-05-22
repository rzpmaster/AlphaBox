from datetime import datetime, timedelta, timezone

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
from app.schemas.subscription import AdminSubscriptionRead, SubscriptionStatusUpdateRequest
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
    user_names = dict(db.execute(select(User.id, User.display_name)).all())
    return [
        InvitationWithStatus(
            id=invitation.id,
            code=invitation.code,
            created_by_id=invitation.created_by_id,
            used_by_id=invitation.used_by_id,
            used_at=invitation.used_at,
            created_at=invitation.created_at,
            is_used=invitation.used_by_id is not None,
            used_by_name=user_names.get(invitation.used_by_id) if invitation.used_by_id else None,
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
    leaders_by_user_id = {
        user_id: {"id": leader_id, "is_verified": is_verified}
        for user_id, leader_id, is_verified in db.execute(select(Leader.user_id, Leader.id, Leader.is_verified)).all()
    }
    following_counts = dict(
        db.execute(select(Subscription.user_id, func.count(Subscription.id)).group_by(Subscription.user_id)).all()
    )
    follower_counts_by_leader_id = dict(
        db.execute(select(Subscription.leader_id, func.count(Subscription.id)).group_by(Subscription.leader_id)).all()
    )

    result: list[AdminUserRead] = []
    for user in users:
        leader_meta = leaders_by_user_id.get(user.id)
        leader_id = leader_meta["id"] if leader_meta else None
        result.append(
            AdminUserRead(
                id=user.id,
                email=user.email,
                display_name=user.display_name,
                role=user.role,
                is_active=user.is_active,
                created_at=user.created_at,
                leader_id=leader_id,
                leader_is_verified=bool(leader_meta and leader_meta["is_verified"]),
                following_count=following_counts.get(user.id, 0),
                follower_count=follower_counts_by_leader_id.get(leader_id, 0) if leader_id else 0,
            )
        )
    return result


@router.get("/subscriptions", response_model=list[AdminSubscriptionRead])
def list_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[AdminSubscriptionRead]:
    subscriptions = db.scalars(select(Subscription).order_by(Subscription.created_at.desc())).all()
    result: list[AdminSubscriptionRead] = []
    for subscription in subscriptions:
        leader = db.get(Leader, subscription.leader_id)
        user = db.get(User, subscription.user_id)
        if leader and user:
            result.append(AdminSubscriptionRead(subscription=subscription, leader=leader, user=user))
    return result


@router.patch("/subscriptions/{subscription_id}", response_model=AdminSubscriptionRead)
def update_subscription_status(
    subscription_id: int,
    payload: SubscriptionStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> AdminSubscriptionRead:
    subscription = db.get(Subscription, subscription_id)
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")

    subscription.status = payload.status
    if payload.status == "paid":
        subscription.paid_at = datetime.now(timezone.utc)
        subscription.expires_at = subscription.paid_at + timedelta(days=365 if subscription.billing_period == "yearly" else 30)
    elif payload.status == "pending":
        subscription.paid_at = None
        subscription.expires_at = None
    db.commit()
    db.refresh(subscription)

    leader = db.get(Leader, subscription.leader_id)
    user = db.get(User, subscription.user_id)
    if not leader or not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription relation not found")
    return AdminSubscriptionRead(subscription=subscription, leader=leader, user=user)


@router.delete("/subscriptions/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> None:
    subscription = db.get(Subscription, subscription_id)
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    db.delete(subscription)
    db.commit()


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


@router.post("/users/{user_id}/revoke-admin", response_model=UserRead)
def revoke_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admins cannot revoke themselves")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = "leader" if user.leader_profile else "user"
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


@router.post("/leaders/{leader_id}/verify", response_model=AdminUserRead)
def verify_leader(
    leader_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> AdminUserRead:
    leader = db.get(Leader, leader_id)
    if not leader:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leader not found")
    leader.is_verified = True
    db.commit()
    db.refresh(leader)
    user = db.get(User, leader.user_id)
    return AdminUserRead(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        leader_id=leader.id,
        leader_is_verified=leader.is_verified,
        following_count=db.scalar(select(func.count(Subscription.id)).where(Subscription.user_id == user.id)) or 0,
        follower_count=db.scalar(select(func.count(Subscription.id)).where(Subscription.leader_id == leader.id)) or 0,
    )


@router.post("/leaders/{leader_id}/unverify", response_model=AdminUserRead)
def unverify_leader(
    leader_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> AdminUserRead:
    leader = db.get(Leader, leader_id)
    if not leader:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leader not found")
    leader.is_verified = False
    db.commit()
    db.refresh(leader)
    user = db.get(User, leader.user_id)
    return AdminUserRead(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        leader_id=leader.id,
        leader_is_verified=leader.is_verified,
        following_count=db.scalar(select(func.count(Subscription.id)).where(Subscription.user_id == user.id)) or 0,
        follower_count=db.scalar(select(func.count(Subscription.id)).where(Subscription.leader_id == leader.id)) or 0,
    )
