import os
from pathlib import Path
from typing import List, Optional, Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

# Dynamic path resolution to detect .env in backend/ or repository root
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BACKEND_DIR.parent
ENV_CANDIDATES = [
    str(BACKEND_DIR / ".env"),
    str(ROOT_DIR / ".env"),
    ".env",
    "../.env",
]


class Settings(BaseSettings):
    PROJECT_NAME: str = "Dream2Sim"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    DEBUG: bool = Field(default=True)
    LOG_LEVEL: str = "INFO"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            val = v.strip().lower()
            if val in ("true", "1", "yes", "on", "t", "y"):
                return True
            if val in ("false", "0", "no", "off", "f", "n"):
                return False
            # Handle non-boolean DEBUG env vars (e.g. from npm/node debug 'WARN', 'INFO', '*')
            return val in ("debug", "trace", "verbose")
        return bool(v)

    # Security
    SECRET_KEY: str = "dream2sim-super-secret-development-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{(BACKEND_DIR / 'dream2sim.db').as_posix()}"

    # Redis (Optional, with memory fallback)
    REDIS_URL: Optional[str] = None

    # Meta Model API Environment Settings
    # Supports both META_API_KEY and MODEL_API_KEY
    META_API_KEY: Optional[str] = Field(default=None, alias="META_API_KEY")
    MODEL_API_KEY: Optional[str] = Field(default=None, alias="MODEL_API_KEY")
    META_API_BASE_URL: str = Field(default="https://api.meta.ai/v1", alias="META_API_BASE_URL")
    META_MODEL: str = Field(default="muse-spark-1.3", alias="META_MODEL")

    # Specific Model Targets
    MUSE_SPARK_MODEL: str = "muse-spark-1.3"
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
        env_file=ENV_CANDIDATES,
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def effective_meta_api_key(self) -> Optional[str]:
        """
        Securely retrieves the Meta Model API Key.
        Priority: META_API_KEY in .env -> MODEL_API_KEY in .env -> os.environ['META_API_KEY'] -> os.environ['MODEL_API_KEY']
        """
        return (
            self.META_API_KEY
            or self.MODEL_API_KEY
            or os.environ.get("META_API_KEY")
            or os.environ.get("MODEL_API_KEY")
        )

    @property
    def effective_meta_model(self) -> str:
        """
        Returns active natural-language simulation model (defaults to muse-spark-1.3).
        """
        return (
            self.META_MODEL
            or self.MUSE_SPARK_MODEL
            or os.environ.get("META_MODEL")
            or "muse-spark-1.3"
        )


settings = Settings()
