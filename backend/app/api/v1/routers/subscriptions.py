from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.leader import Leader
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import SubscriptionRead, SubscriptionWithLeader

router = APIRouter()


@router.get("", response_model=list[SubscriptionWithLeader])
def list_my_subscriptions(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[SubscriptionWithLeader]:
    subscriptions = db.scalars(select(Subscription).where(Subscription.user_id == current_user.id)).all()
    return [
        SubscriptionWithLeader(subscription=subscription, leader=db.get(Leader, subscription.leader_id))
        for subscription in subscriptions
    ]


@router.post("/{leader_id}", response_model=SubscriptionRead, status_code=status.HTTP_201_CREATED)
def subscribe(
    leader_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Subscription:
    leader = db.get(Leader, leader_id)
    if not leader or not leader.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leader not found")
    existing = db.scalar(
        select(Subscription).where(Subscription.user_id == current_user.id, Subscription.leader_id == leader_id)
    )
    if existing:
        return existing
    subscription = Subscription(user_id=current_user.id, leader_id=leader_id)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.delete("/{leader_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsubscribe(
    leader_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    subscription = db.scalar(
        select(Subscription).where(Subscription.user_id == current_user.id, Subscription.leader_id == leader_id)
    )
    if subscription:
        db.delete(subscription)
        db.commit()
