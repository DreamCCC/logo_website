from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Logo Quote Portal API"
    environment: str = "development"
    api_prefix: str = "/api"

    database_url: str = Field(
        default="mysql+pymysql://logo_user:change-me@localhost:3306/logo_portal",
        validation_alias="DATABASE_URL",
    )
    jwt_secret: str = Field(default="change-this-secret", validation_alias="JWT_SECRET")
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24 * 7

    frontend_origin: str = Field(
        default="http://localhost:3000",
        validation_alias="FRONTEND_ORIGIN",
    )
    cookie_secure: bool = Field(default=False, validation_alias="COOKIE_SECURE")
    upload_dir: Path = Field(default=Path("uploads"), validation_alias="UPLOAD_DIR")
    max_upload_size_mb: int = 10
    admin_email: str = Field(default="admin@ks-logo.local", validation_alias="ADMIN_EMAIL")
    admin_initial_password: str = Field(default="123456", validation_alias="ADMIN_INITIAL_PASSWORD")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    return settings
