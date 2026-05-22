from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


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
    leader_is_verified: bool = False


class UserUpdateRequest(BaseModel):
    display_name: str = Field(min_length=2, max_length=120)
    current_password: str | None = None
    new_password: str | None = Field(default=None, min_length=8, max_length=128)
