from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.leader import LeaderRead
from app.schemas.user import UserRead


class SubscriptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    leader_id: int
    amount: Decimal
    status: str
    billing_period: str
    paid_at: datetime | None
    expires_at: datetime | None
    created_at: datetime


class SubscriptionWithLeader(BaseModel):
    subscription: SubscriptionRead
    leader: LeaderRead


class AdminSubscriptionRead(BaseModel):
    subscription: SubscriptionRead
    leader: LeaderRead
    user: UserRead


class SubscriptionStatusUpdateRequest(BaseModel):
    status: str = Field(pattern=r"^(pending|paid|cancelled|expired)$")


class SubscriptionCreateRequest(BaseModel):
    billing_period: str = Field(pattern=r"^(monthly|yearly)$")
