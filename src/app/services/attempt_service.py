from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.models import AppUser, Exercise, ExerciseAttempt, Lesson


def record_attempt(
    db: Session,
    user: AppUser,
    exercise: Exercise,
    is_correct: bool,
) -> ExerciseAttempt:
    attempt = ExerciseAttempt(
        user_id=user.id,
        exercise_id=exercise.id,
        is_correct=is_correct,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


def get_attempts_for_user(db: Session, user: AppUser) -> list[ExerciseAttempt]:
    query = (
        select(ExerciseAttempt)
        .where(ExerciseAttempt.user_id == user.id)
        .order_by(ExerciseAttempt.created_at.desc(), ExerciseAttempt.id.desc())
    )
    return list(db.scalars(query).all())


def get_progress_summary(db: Session, user: AppUser) -> tuple[int, int]:
    query = (
        select(
            func.count(ExerciseAttempt.id),
            func.count(ExerciseAttempt.id).filter(ExerciseAttempt.is_correct.is_(True)),
        )
        .where(ExerciseAttempt.user_id == user.id)
    )
    total_attempts, correct_attempts = db.execute(query).one()
    return total_attempts, correct_attempts


def get_lesson_progress(db: Session, user: AppUser) -> list[dict[str, int | str | bool]]:
    query = (
        select(
            Lesson.id,
            Lesson.title,
            func.count(func.distinct(Exercise.id)).label("total_exercises"),
            func.count(func.distinct(ExerciseAttempt.exercise_id)).label("answered_exercises"),
            func.count(func.distinct(Exercise.id))
            .filter(ExerciseAttempt.is_correct.is_(True))
            .label("correct_exercises"),
        )
        .select_from(Lesson)
        .outerjoin(Exercise, Exercise.lesson_id == Lesson.id)
        .outerjoin(
            ExerciseAttempt,
            (ExerciseAttempt.exercise_id == Exercise.id)
            & (ExerciseAttempt.user_id == user.id),
        )
        .group_by(Lesson.id, Lesson.title)
        .order_by(Lesson.id)
    )

    lesson_rows = db.execute(query).all()
    progress = []
    for row in lesson_rows:
        total_exercises = row.total_exercises
        answered_exercises = row.answered_exercises
        correct_exercises = row.correct_exercises
        completed = (
            total_exercises > 0
            and answered_exercises == total_exercises
            and correct_exercises / total_exercises >= 0.5
        )
        progress.append(
            {
                "lessonId": row.id,
                "title": row.title,
                "totalExercises": total_exercises,
                "answeredExercises": answered_exercises,
                "correctExercises": correct_exercises,
                "completed": completed,
            }
        )
    return progress
