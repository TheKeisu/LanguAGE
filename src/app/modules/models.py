from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SqlEnum, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LessonType(str, Enum):
    THEORY = "THEORY"
    PRACTICE = "PRACTICE"


class ExerciseType(str, Enum):
    TEXT = "TEXT"
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    FILL_BLANK = "FILL_BLANK"


class Lesson(Base):
    __tablename__ = "lesson"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[LessonType] = mapped_column(
        SqlEnum(LessonType, name="lesson_type", native_enum=False), nullable=False
    )


class Exercise(Base):
    __tablename__ = "exercise"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    prompt: Mapped[str] = mapped_column(String, nullable=False)
    correct_answer: Mapped[str] = mapped_column(String, nullable=False)
    exercise_type: Mapped[ExerciseType] = mapped_column(
        SqlEnum(ExerciseType, name="exercise_type", native_enum=False),
        nullable=False,
        default=ExerciseType.TEXT,
    )
    options: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lesson.id"), nullable=False)


class AppUser(Base):
    __tablename__ = "app_user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    supabase_user_id: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)


class ExerciseAttempt(Base):
    __tablename__ = "exercise_attempt"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.id"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercise.id"), nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
