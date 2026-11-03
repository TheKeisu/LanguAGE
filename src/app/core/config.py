from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str | None = None
    supabase_url: str = "https://qxjbzomlmtjlbndoqre.supabase.co"
    supabase_jwt_audience: str = "authenticated"
    supabase_jwt_algorithm: str = "ES256"
    admin_user_ids: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def supabase_issuer(self) -> str:
        return f"{self.supabase_url.rstrip('/')}/auth/v1"

    @property
    def supabase_jwks_url(self) -> str:
        return f"{self.supabase_issuer}/.well-known/jwks.json"

    @property
    def admin_user_id_set(self) -> set[str]:
        return {
            user_id.strip()
            for user_id in self.admin_user_ids.split(",")
            if user_id.strip()
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
