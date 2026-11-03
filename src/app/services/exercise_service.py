from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.models import AppUser, Exercise, ExerciseAttempt, Lesson
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate
from app.services.attempt_service import record_attempt


class ExerciseHasAttemptsError(Exception):
    pass


def create_exercise(db: Session, lesson_id: int, request: ExerciseCreate) -> Exercise | None:
    if db.get(Lesson, lesson_id) is None:
        return None

    exercise = Exercise(
        prompt=request.prompt,
        correct_answer=request.correct_answer,
        exercise_type=request.type,
        options=request.options,
        lesson_id=lesson_id,
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


def get_exercises_for_lesson(db: Session, lesson_id: int) -> list[Exercise] | None:
    if db.get(Lesson, lesson_id) is None:
        return None
    query = select(Exercise).where(Exercise.lesson_id == lesson_id)
    return list(db.scalars(query).all())


def check_answer(
    db: Session,
    exercise_id: int,
    answer: str,
    user: AppUser,
) -> tuple[bool, str] | None:
    exercise = db.get(Exercise, exercise_id)
    if exercise is None:
        return None

    is_correct = answer.strip().casefold() == exercise.correct_answer.strip().casefold()
    record_attempt(db, user, exercise, is_correct)
    return is_correct, exercise.correct_answer


def update_exercise(db: Session, exercise_id: int, request: ExerciseUpdate) -> Exercise | None:
    exercise = db.get(Exercise, exercise_id)
    if exercise is None:
        return None

    exercise.prompt = request.prompt
    exercise.correct_answer = request.correct_answer
    exercise.exercise_type = request.type
    exercise.options = request.options
    db.commit()
    db.refresh(exercise)
    return exercise


def delete_exercise(db: Session, exercise_id: int) -> bool:
    exercise = db.get(Exercise, exercise_id)
    if exercise is None:
        return False

    attempt_id = db.scalar(
        select(ExerciseAttempt.id)
        .where(ExerciseAttempt.exercise_id == exercise_id)
        .limit(1)
    )
    if attempt_id is not None:
        raise ExerciseHasAttemptsError

    db.delete(exercise)
    db.commit()
    return True
