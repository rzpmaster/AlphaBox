from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.leader import LeaderRead


class SubscriptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    leader_id: int
    created_at: datetime


class SubscriptionWithLeader(BaseModel):
    subscription: SubscriptionRead
    leader: LeaderRead
