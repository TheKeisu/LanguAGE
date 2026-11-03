import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from sqlalchemy import create_engine, text

from app.db.migrate import apply_migrations


class MigrationRunnerTests(unittest.TestCase):
    def test_migration_runs_once_and_records_its_version(self) -> None:
        engine = create_engine("sqlite://")
        with TemporaryDirectory() as temp_dir:
            migrations_dir = Path(temp_dir)
            (migrations_dir / "0001_example.sql").write_text(
                "CREATE TABLE example (id INTEGER PRIMARY KEY);"
                "INSERT INTO example (id) VALUES (1);",
                encoding="utf-8",
            )

            try:
                with engine.begin() as connection:
                    first_run = apply_migrations(connection, migrations_dir)
                with engine.begin() as connection:
                    second_run = apply_migrations(connection, migrations_dir)
                    row_count = connection.scalar(text("SELECT COUNT(*) FROM example"))
                    versions = connection.scalars(
                        text("SELECT version FROM schema_migrations")
                    ).all()
            finally:
                engine.dispose()

        self.assertEqual(first_run, ["0001_example.sql"])
        self.assertEqual(second_run, [])
        self.assertEqual(row_count, 1)
        self.assertEqual(versions, ["0001_example.sql"])


if __name__ == "__main__":
    unittest.main()
