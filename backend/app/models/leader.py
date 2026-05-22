from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Leader(TimestampMixin, Base):
    __tablename__ = "leaders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    handle: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    headline: Mapped[str] = mapped_column(String(180))
    bio: Mapped[str] = mapped_column(Text)
    strategy: Mapped[str] = mapped_column(String(120))
    risk_level: Mapped[str] = mapped_column(String(32))
    subscription_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    monthly_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    yearly_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship(back_populates="leader_profile")  # noqa: F821
    posts: Mapped[list["Post"]] = relationship(back_populates="leader")  # noqa: F821
    signals: Mapped[list["Signal"]] = relationship(back_populates="leader")  # noqa: F821
