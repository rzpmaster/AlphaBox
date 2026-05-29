from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, require_leader_or_admin
from app.db.session import get_db
from app.models.content import Post, Signal
from app.models.leader import Leader
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.content import FeedItem, PostCreateRequest, PostRead, SignalArchiveRequest, SignalCreateRequest, SignalRead

router = APIRouter()


def _is_subscription_active(subscription: Subscription) -> bool:
    if subscription.status != "paid" or not subscription.expires_at:
        return False
    expires_at = subscription.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > datetime.now(timezone.utc)


def _can_view_leader_content(leader_id: int, current_user: User, db: Session) -> bool:
    if current_user.role == "admin":
        return True
    if current_user.leader_profile and current_user.leader_profile.id == leader_id:
        return True
    subscription = db.scalar(
        select(Subscription).where(Subscription.user_id == current_user.id, Subscription.leader_id == leader_id)
    )
    return bool(subscription and _is_subscription_active(subscription))


def _current_leader(current_user: User) -> Leader:
    if not current_user.leader_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leader profile not found")
    return current_user.leader_profile


def _not_deleted(model):
    return model.is_deleted.is_(False)


@router.post("/posts", response_model=PostRead, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin),
) -> Post:
    leader = _current_leader(current_user)
    post = Post(leader_id=leader.id, **payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.post("/signals", response_model=SignalRead, status_code=status.HTTP_201_CREATED)
def create_signal(
    payload: SignalCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin),
) -> Signal:
    leader = _current_leader(current_user)
    signal = Signal(leader_id=leader.id, **payload.model_dump())
    db.add(signal)
    db.commit()
    db.refresh(signal)
    return signal


@router.get("/me/posts", response_model=list[PostRead])
def list_my_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin),
) -> list[Post]:
    leader = _current_leader(current_user)
    return list(db.scalars(select(Post).where(Post.leader_id == leader.id, _not_deleted(Post)).order_by(Post.created_at.desc())))


@router.get("/me/signals", response_model=list[SignalRead])
def list_my_signals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin),
) -> list[Signal]:
    leader = _current_leader(current_user)
    return list(db.scalars(select(Signal).where(Signal.leader_id == leader.id, _not_deleted(Signal)).order_by(Signal.created_at.desc())))


@router.patch("/posts/{post_id}", response_model=PostRead)
def update_my_post(
    post_id: int,
    payload: PostCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin),
) -> Post:
    leader = _current_leader(current_user)
    post = db.get(Post, post_id)
    if not post or post.is_deleted or post.leader_id != leader.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    post.title = payload.title
    post.body = payload.body
    db.commit()
    db.refresh(post)
    return post


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin),
) -> None:
    leader = _current_leader(current_user)
    post = db.get(Post, post_id)
    if not post or post.is_deleted or post.leader_id != leader.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    post.is_deleted = True
    post.deleted_at = datetime.now(timezone.utc)
    db.commit()


@router.get("/posts/{post_id}", response_model=PostRead)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Post:
    post = db.get(Post, post_id)
    if not post or post.is_deleted or not _can_view_leader_content(post.leader_id, current_user, db):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.patch("/signals/{signal_id}", response_model=SignalRead)
def update_my_signal(
    signal_id: int,
    payload: SignalCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin),
) -> Signal:
    leader = _current_leader(current_user)
    signal = db.get(Signal, signal_id)
    if not signal or signal.is_deleted or signal.leader_id != leader.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signal not found")
    if signal.is_archived:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Archived signals cannot be updated")

    for field, value in payload.model_dump().items():
        setattr(signal, field, value)
    db.commit()
    db.refresh(signal)
    return signal


@router.post("/signals/{signal_id}/archive", response_model=SignalRead)
def archive_my_signal(
    signal_id: int,
    payload: SignalArchiveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin),
) -> Signal:
    leader = _current_leader(current_user)
    signal = db.get(Signal, signal_id)
    if not signal or signal.is_deleted or signal.leader_id != leader.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signal not found")
    if signal.is_archived:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signal is already archived")

    signal.exit_price = payload.current_price
    signal.return_rate = None
    if signal.side in {"long", "short"}:
        if not signal.entry or signal.entry <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Entry price is required to calculate return")
        direction = Decimal("1") if signal.side == "long" else Decimal("-1")
        signal.return_rate = ((payload.current_price - signal.entry) / signal.entry) * direction
    signal.is_archived = True
    signal.archived_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(signal)
    return signal


@router.delete("/signals/{signal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_signal(
    signal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin),
) -> None:
    leader = _current_leader(current_user)
    signal = db.get(Signal, signal_id)
    if not signal or signal.is_deleted or signal.leader_id != leader.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signal not found")
    signal.is_deleted = True
    signal.deleted_at = datetime.now(timezone.utc)
    db.commit()


@router.get("/signals/{signal_id}", response_model=SignalRead)
def get_signal(
    signal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Signal:
    signal = db.get(Signal, signal_id)
    if not signal or signal.is_deleted or not _can_view_leader_content(signal.leader_id, current_user, db):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signal not found")
    return signal


@router.get("/leaders/{leader_id}/posts", response_model=list[PostRead])
def list_leader_posts(leader_id: int, db: Session = Depends(get_db)) -> list[Post]:
    return list(db.scalars(select(Post).where(Post.leader_id == leader_id, _not_deleted(Post)).order_by(Post.created_at.desc())))


@router.get("/leaders/{leader_id}/signals", response_model=list[SignalRead])
def list_leader_signals(leader_id: int, db: Session = Depends(get_db)) -> list[Signal]:
    return list(db.scalars(select(Signal).where(Signal.leader_id == leader_id, _not_deleted(Signal)).order_by(Signal.created_at.desc())))


@router.get("/feed", response_model=list[FeedItem])
def my_feed(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[FeedItem]:
    leader_ids = list(
        db.scalars(
            select(Subscription.leader_id).where(
                Subscription.user_id == current_user.id,
                Subscription.status == "paid",
                Subscription.expires_at > datetime.now(timezone.utc),
            )
        )
    )
    if not leader_ids:
        return []

    leaders = {leader.id: leader for leader in db.scalars(select(Leader).where(Leader.id.in_(leader_ids))).all()}
    posts = db.scalars(select(Post).where(Post.leader_id.in_(leader_ids), _not_deleted(Post)).order_by(Post.created_at.desc())).all()
    signals = db.scalars(select(Signal).where(Signal.leader_id.in_(leader_ids), _not_deleted(Signal)).order_by(Signal.created_at.desc())).all()
    items: list[FeedItem] = [
        FeedItem(type="post", created_at=post.created_at, leader=leaders[post.leader_id], item=post) for post in posts
    ]
    items.extend(
        FeedItem(type="signal", created_at=signal.created_at, leader=leaders[signal.leader_id], item=signal)
        for signal in signals
    )
    return sorted(items, key=lambda item: item.created_at, reverse=True)
