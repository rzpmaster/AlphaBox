from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    display_name: str
    role: str
    is_active: bool
    created_at: datetime


class AdminUserRead(UserRead):
    following_count: int
    follower_count: int
    leader_id: int | None = None
