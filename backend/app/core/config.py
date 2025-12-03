from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import Optional


class Settings(BaseSettings):
	FRONTEND_ORIGIN: Optional[AnyHttpUrl] = None

	# LLM
	OPENROUTER_API_KEY: Optional[str] = None
	OPENAI_API_KEY: Optional[str] = None
	OPENROUTER_BASE_URL: str = "https://openrouter.ai/api"
	OPENAI_MODEL: str = "google/gemini-2.5-flash"

	# Database
	DATABASE_URL: str

	class Config:
		env_file = ".env"
		extra = "ignore"


settings = Settings()
