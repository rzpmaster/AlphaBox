from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.leader import LeaderRead


class PostCreateRequest(BaseModel):
    title: str
    body: str

    @field_validator("title", "body")
    @classmethod
    def require_non_empty(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Field cannot be empty")
        return stripped


class PostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    leader_id: int
    title: str
    body: str
    created_at: datetime


class SignalCreateRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=32)
    code: str | None = Field(default=None, max_length=32)
    side: Literal["long", "short", "watch"]
    thesis: str = Field(max_length=5000)
    entry: Decimal | None = None
    target: Decimal | None = None
    stop_loss: Decimal | None = None
    timeframe: str = Field(max_length=64)


class SignalArchiveRequest(BaseModel):
    current_price: Decimal = Field(gt=0)


class SignalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    leader_id: int
    symbol: str
    code: str | None
    side: str
    thesis: str
    entry: Decimal | None
    target: Decimal | None
    stop_loss: Decimal | None
    timeframe: str
    is_archived: bool
    exit_price: Decimal | None
    return_rate: Decimal | None
    archived_at: datetime | None
    created_at: datetime


class FeedItem(BaseModel):
    type: Literal["post", "signal"]
    created_at: datetime
    leader: LeaderRead
    item: PostRead | SignalRead
