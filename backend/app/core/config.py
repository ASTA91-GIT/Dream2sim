import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "Dream2Sim"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Security
    SECRET_KEY: str = "dream2sim-super-secret-development-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./dream2sim.db"

    # Redis (Optional, with memory fallback)
    REDIS_URL: Optional[str] = None

    # Meta Model API
    MODEL_API_KEY: Optional[str] = Field(default=None, alias="MODEL_API_KEY")
    META_API_BASE_URL: str = "https://api.meta.ai/v1"
    MUSE_SPARK_MODEL: str = "muse-spark"
    MUSE_WONDER_MODEL: str = "muse-wonder"
    MUSE_IMAGE_MODEL: str = "muse-image"
    MUSE_VOICE_MODEL: str = "muse-voice-transcribe"
    SAM_MODEL: str = "sam-3.1"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # File uploads & storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 25

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
