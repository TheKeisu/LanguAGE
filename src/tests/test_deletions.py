import unittest

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db.base import Base
from app.modules.models import (
    AppUser,
    Exercise,
    ExerciseAttempt,
    ExerciseType,
    Lesson,
    LessonType,
)
from app.services import exercise_service, lesson_service


class DeleteServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.user = AppUser(email="learner@example.com", display_name="Learner")
        self.lesson = Lesson(
            title="Lesson",
            description="Description",
            type=LessonType.THEORY,
        )
        self.db.add_all([self.user, self.lesson])
        self.db.flush()
        self.exercise = Exercise(
            prompt="Translate",
            correct_answer="hello",
            exercise_type=ExerciseType.TEXT,
            lesson_id=self.lesson.id,
        )
        self.db.add(self.exercise)
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def add_attempt(self) -> None:
        self.db.add(
            ExerciseAttempt(
                user_id=self.user.id,
                exercise_id=self.exercise.id,
                is_correct=False,
            )
        )
        self.db.commit()

    def test_exercise_with_attempts_cannot_be_deleted(self) -> None:
        self.add_attempt()

        with self.assertRaises(exercise_service.ExerciseHasAttemptsError):
            exercise_service.delete_exercise(self.db, self.exercise.id)

        self.assertIsNotNone(self.db.get(Exercise, self.exercise.id))

    def test_exercise_without_attempts_can_be_deleted(self) -> None:
        self.assertTrue(exercise_service.delete_exercise(self.db, self.exercise.id))

        self.assertIsNone(self.db.get(Exercise, self.exercise.id))

    def test_lesson_with_attempts_cannot_be_deleted(self) -> None:
        self.add_attempt()

        with self.assertRaises(lesson_service.LessonHasAttemptsError):
            lesson_service.delete_lesson(self.db, self.lesson.id)

        self.assertIsNotNone(self.db.get(Lesson, self.lesson.id))
        self.assertIsNotNone(self.db.get(Exercise, self.exercise.id))

    def test_lesson_without_attempts_deletes_its_exercises(self) -> None:
        self.assertTrue(lesson_service.delete_lesson(self.db, self.lesson.id))

        self.assertIsNone(self.db.get(Lesson, self.lesson.id))
        exercises = self.db.scalars(select(Exercise)).all()
        self.assertEqual(exercises, [])

    def test_deleting_unknown_lesson_returns_false(self) -> None:
        self.assertFalse(lesson_service.delete_lesson(self.db, 9999))


if __name__ == "__main__":
    unittest.main()
