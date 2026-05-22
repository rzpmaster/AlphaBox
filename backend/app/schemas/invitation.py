from datetime import datetime

from pydantic import BaseModel, ConfigDict


class InvitationCreateRequest(BaseModel):
    count: int = 1


class InvitationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    created_by_id: int | None
    used_by_id: int | None
    used_at: datetime | None
    created_at: datetime


class InvitationWithStatus(InvitationRead):
    is_used: bool
    used_by_name: str | None = None
