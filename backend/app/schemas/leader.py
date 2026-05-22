from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LeaderCreateRequest(BaseModel):
    handle: str = Field(min_length=2, max_length=80, pattern=r"^[a-zA-Z0-9_]+$")
    headline: str = Field(min_length=3, max_length=180)
    bio: str = Field(min_length=10)
    strategy: str = Field(min_length=2, max_length=120)
    risk_level: str = Field(min_length=2, max_length=32)


class LeaderUpdateRequest(BaseModel):
    handle: str = Field(min_length=2, max_length=80, pattern=r"^[a-zA-Z0-9_]+$")
    headline: str = Field(min_length=3, max_length=180)
    bio: str = Field(min_length=10)
    strategy: str = Field(min_length=2, max_length=120)
    risk_level: str = Field(min_length=2, max_length=32)


class LeaderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    handle: str
    headline: str
    bio: str
    strategy: str
    risk_level: str
    is_published: bool
    created_at: datetime
