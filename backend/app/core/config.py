from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field, HttpUrl
from typing import List , Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "FaceEmotionTrackAI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database components (Pydantic reads these from .env)
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[int] = None
    POSTGRES_DB: Optional[str] = None

# Direct DATABASE_URL override - used in CI and  testing
    DATABASE_URL_OVERRIDE: Optional[str] = None

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        
        if self.DATABASE_URL_OVERRIDE:
            return self.DATABASE_URL_OVERRIDE
        # Build the URL: postgresql://user:pass@host:port/db
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.POSTGRES_DB}"
    
    
    ALLOWED_ORIGINS: list[HttpUrl] = ["http://localhost:3000"]  # TODO: Change to your frontend URL when  it is on Prodcution in AWS ec2 instance
    
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    MODELS_PATH: str = "/app/ml_weights"
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"
    LOG_MAX_BYTES: int = 10 * 1024 * 1024 # 10MB
    LOG_BACKUP_COUNT: int = 5
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_DATE_FORMAT: str = "%Y-%m-%d %H:%M:%S"
    LOG_LEVEL_FILE: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore" 
    )
    
# Instantiate the settings object to be imported across the application
settings = Settings()
