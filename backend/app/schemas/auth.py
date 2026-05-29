from pydantic import BaseModel, Field, SecretStr

from app.schemas.common import EmailAddress
from app.schemas.user import UserRead


class RegisterRequest(BaseModel):
    email: EmailAddress
    password: SecretStr = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=2, max_length=120)
    invitation_code: str = Field(min_length=4, max_length=64)


class LoginRequest(BaseModel):
    email: EmailAddress
    password: SecretStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
