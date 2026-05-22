from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Subscription(TimestampMixin, Base):
    __tablename__ = "subscriptions"
    __table_args__ = (UniqueConstraint("user_id", "leader_id", name="uq_user_leader_subscription"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    leader_id: Mapped[int] = mapped_column(ForeignKey("leaders.id"))
