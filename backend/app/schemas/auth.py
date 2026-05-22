from pydantic import BaseModel, Field

from app.schemas.user import UserRead


class RegisterRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=255)
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=2, max_length=120)
    invitation_code: str = Field(min_length=4, max_length=64)


class LoginRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=255)
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
