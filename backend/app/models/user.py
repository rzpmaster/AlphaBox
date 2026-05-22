from enum import StrEnum

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class UserRole(StrEnum):
    USER = "user"
    LEADER = "leader"
    ADMIN = "admin"


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(32), default=UserRole.USER.value)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    leader_profile: Mapped["Leader | None"] = relationship(back_populates="user")  # noqa: F821
