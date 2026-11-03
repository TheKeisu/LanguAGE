from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.models import Exercise, ExerciseAttempt, Lesson, LessonType
from app.schemas.lesson import LessonCreate, LessonUpdate


class LessonHasAttemptsError(Exception):
    pass


def get_all_lessons(db: Session) -> list[Lesson]:
    return list(db.scalars(select(Lesson)).all())


def get_lesson_by_id(db: Session, lesson_id: int) -> Lesson | None:
    return db.get(Lesson, lesson_id)


def get_lessons_by_type(db: Session, lesson_type: LessonType) -> list[Lesson]:
    query = select(Lesson).where(Lesson.type == lesson_type)
    return list(db.scalars(query).all())


def create_lesson(db: Session, request: LessonCreate) -> Lesson:
    lesson = Lesson(title=request.title, description=request.description, type=request.type)
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


def update_lesson(db: Session, lesson_id: int, request: LessonUpdate) -> Lesson | None:
    lesson = db.get(Lesson, lesson_id)
    if lesson is None:
        return None

    lesson.title = request.title
    lesson.description = request.description
    lesson.type = request.type
    db.commit()
    db.refresh(lesson)
    return lesson


def delete_lesson(db: Session, lesson_id: int) -> bool:
    lesson = db.get(Lesson, lesson_id)
    if lesson is None:
        return False

    attempt_id = db.scalar(
        select(ExerciseAttempt.id)
        .join(Exercise, ExerciseAttempt.exercise_id == Exercise.id)
        .where(Exercise.lesson_id == lesson_id)
        .limit(1)
    )
    if attempt_id is not None:
        raise LessonHasAttemptsError

    exercises = db.scalars(select(Exercise).where(Exercise.lesson_id == lesson_id)).all()
    for exercise in exercises:
        db.delete(exercise)
    db.delete(lesson)
    db.commit()
    return True
