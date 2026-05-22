from decimal import Decimal

from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Post(TimestampMixin, Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    leader_id: Mapped[int] = mapped_column(ForeignKey("leaders.id"), index=True)
    title: Mapped[str] = mapped_column(String(180))
    body: Mapped[str] = mapped_column(Text)

    leader: Mapped["Leader"] = relationship(back_populates="posts")  # noqa: F821


class Signal(TimestampMixin, Base):
    __tablename__ = "signals"

    id: Mapped[int] = mapped_column(primary_key=True)
    leader_id: Mapped[int] = mapped_column(ForeignKey("leaders.id"), index=True)
    symbol: Mapped[str] = mapped_column(String(32), index=True)
    code: Mapped[str | None] = mapped_column(String(32), nullable=True)
    side: Mapped[str] = mapped_column(String(16))
    thesis: Mapped[str] = mapped_column(Text)
    entry: Mapped[Decimal | None] = mapped_column(Numeric(18, 6), nullable=True)
    target: Mapped[Decimal | None] = mapped_column(Numeric(18, 6), nullable=True)
    stop_loss: Mapped[Decimal | None] = mapped_column(Numeric(18, 6), nullable=True)
    timeframe: Mapped[str] = mapped_column(String(64))
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    exit_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 6), nullable=True)
    return_rate: Mapped[Decimal | None] = mapped_column(Numeric(12, 6), nullable=True)
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    leader: Mapped["Leader"] = relationship(back_populates="signals")  # noqa: F821
