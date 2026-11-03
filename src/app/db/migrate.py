from pathlib import Path

from sqlalchemy import Connection, create_engine, text

from app.core.config import get_settings


MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations" / "versions"


def apply_migrations(connection: Connection, migrations_dir: Path = MIGRATIONS_DIR) -> list[str]:
    connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )
    applied_versions = set(
        connection.scalars(text("SELECT version FROM schema_migrations")).all()
    )

    newly_applied = []
    for migration_path in sorted(migrations_dir.glob("*.sql")):
        version = migration_path.name
        if version in applied_versions:
            continue

        sql = migration_path.read_text(encoding="utf-8")
        for statement in sql.split(";"):
            statement = statement.strip()
            if statement:
                connection.exec_driver_sql(statement)

        connection.execute(
            text("INSERT INTO schema_migrations (version) VALUES (:version)"),
            {"version": version},
        )
        newly_applied.append(version)

    return newly_applied


def main() -> None:
    database_url = get_settings().database_url
    if not database_url:
        raise SystemExit("DATABASE_URL не настроен. Укажи его в .env перед миграцией.")

    if database_url.startswith("postgresql://"):
        database_url = database_url.replace(
            "postgresql://", "postgresql+psycopg://", 1
        )

    engine = create_engine(database_url, pool_pre_ping=True)
    try:
        with engine.begin() as connection:
            applied = apply_migrations(connection)
    finally:
        engine.dispose()

    if applied:
        for version in applied:
            print(f"Применена миграция: {version}")
    else:
        print("Новых миграций нет.")


if __name__ == "__main__":
    main()
