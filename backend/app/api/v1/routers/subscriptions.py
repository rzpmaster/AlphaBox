from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.leader import Leader
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import SubscriptionCreateRequest, SubscriptionRead, SubscriptionWithLeader

router = APIRouter()


def _duration_for_period(billing_period: str) -> timedelta:
    return timedelta(days=365 if billing_period == "yearly" else 30)


def _is_unexpired(subscription: Subscription) -> bool:
    if not subscription.expires_at:
        return False
    expires_at = subscription.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > datetime.now(timezone.utc)


def _price_for_period(leader: Leader, billing_period: str):
    return leader.yearly_price if billing_period == "yearly" else leader.monthly_price


def _refresh_expired(subscription: Subscription) -> None:
    if subscription.status == "paid" and not _is_unexpired(subscription):
        subscription.status = "expired"


@router.get("", response_model=list[SubscriptionWithLeader])
def list_my_subscriptions(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[SubscriptionWithLeader]:
    subscriptions = db.scalars(select(Subscription).where(Subscription.user_id == current_user.id)).all()
    changed = False
    result: list[SubscriptionWithLeader] = []
    for subscription in subscriptions:
        previous_status = subscription.status
        _refresh_expired(subscription)
        changed = changed or previous_status != subscription.status
        leader = db.get(Leader, subscription.leader_id)
        if leader:
            result.append(SubscriptionWithLeader(subscription=subscription, leader=leader))
    if changed:
        db.commit()
    return result


@router.post("/{leader_id}", response_model=SubscriptionRead, status_code=status.HTTP_201_CREATED)
def subscribe(
    leader_id: int,
    payload: SubscriptionCreateRequest,
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
        _refresh_expired(existing)
        if existing.status == "cancelled" and _is_unexpired(existing):
            existing.status = "paid"
        elif not (existing.status == "paid" and _is_unexpired(existing)):
            existing.billing_period = payload.billing_period
            existing.amount = _price_for_period(leader, payload.billing_period)
            existing.status = "pending"
            existing.paid_at = None
            existing.expires_at = None
            if existing.amount == 0:
                existing.status = "paid"
                existing.paid_at = datetime.now(timezone.utc)
                existing.expires_at = existing.paid_at + _duration_for_period(existing.billing_period)
        db.commit()
        db.refresh(existing)
        return existing

    amount = _price_for_period(leader, payload.billing_period)
    subscription = Subscription(
        user_id=current_user.id,
        leader_id=leader_id,
        amount=amount,
        billing_period=payload.billing_period,
    )
    if amount == 0:
        subscription.status = "paid"
        subscription.paid_at = datetime.now(timezone.utc)
        subscription.expires_at = subscription.paid_at + _duration_for_period(payload.billing_period)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.get("/{leader_id}", response_model=SubscriptionRead | None)
def get_subscription(
    leader_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Subscription | None:
    subscription = db.scalar(
        select(Subscription).where(Subscription.user_id == current_user.id, Subscription.leader_id == leader_id)
    )
    if not subscription:
        return None
    previous_status = subscription.status
    _refresh_expired(subscription)
    if previous_status != subscription.status:
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
        subscription.status = "cancelled"
        db.commit()
