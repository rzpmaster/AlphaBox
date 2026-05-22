from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class LeaderCreateRequest(BaseModel):
    handle: str = Field(min_length=2, max_length=80, pattern=r"^[a-zA-Z0-9_]+$")
    headline: str = Field(min_length=3, max_length=180)
    bio: str = Field(min_length=10)
    strategy: str = Field(min_length=2, max_length=120)
    risk_level: str = Field(min_length=2, max_length=32)
    subscription_price: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)
    monthly_price: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)
    yearly_price: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)


class LeaderUpdateRequest(BaseModel):
    handle: str = Field(min_length=2, max_length=80, pattern=r"^[a-zA-Z0-9_]+$")
    headline: str = Field(min_length=3, max_length=180)
    bio: str = Field(min_length=10)
    strategy: str = Field(min_length=2, max_length=120)
    risk_level: str = Field(min_length=2, max_length=32)
    subscription_price: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)
    monthly_price: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)
    yearly_price: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)


class LeaderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    handle: str
    headline: str
    bio: str
    strategy: str
    risk_level: str
    subscription_price: Decimal
    monthly_price: Decimal
    yearly_price: Decimal
    is_verified: bool
    is_published: bool
    created_at: datetime
