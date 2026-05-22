from functools import lru_cache

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "AlphaBox"
    environment: str = "development"
    secret_key: str = Field(min_length=16)
    access_token_expire_minutes: int = 60 * 24 * 7
    backend_cors_origins: str = "http://localhost:3000"
    database_url: str
    redis_url: str = "redis://localhost:6379/0"
    create_initial_admin: bool = True
    initial_admin_email: str = "admin@alphabox.local"
    initial_admin_password: str = Field(default="ChangeMe123!", min_length=8)
    initial_admin_display_name: str = "AlphaBox Admin"

    @property
    def cors_origins(self) -> list[str | AnyHttpUrl]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
