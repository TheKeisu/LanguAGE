import unittest

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.api.routes.exercises import get_exercises_for_lesson, submit_answer
from app.db.base import Base
from app.modules.models import (
    AppUser,
    Exercise,
    ExerciseAttempt,
    ExerciseType,
    Lesson,
    LessonType,
)
from app.schemas.exercise import SubmitAnswer
from app.services.attempt_service import get_attempts_for_user
from app.services.user_service import get_or_create_supabase_user


class AnswerSubmissionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.lesson = Lesson(
            title="Lesson",
            description="Description",
            type=LessonType.PRACTICE,
        )
        self.db.add(self.lesson)
        self.db.flush()
        self.exercise = Exercise(
            prompt="Choose the translation",
            correct_answer="Рақмет",
            exercise_type=ExerciseType.MULTIPLE_CHOICE,
            options=["Сәлем", "Рақмет", "Сау бол"],
            lesson_id=self.lesson.id,
        )
        self.db.add(self.exercise)
        self.db.commit()
        self.claims = {"sub": "supabase-user-id", "email": "learner@example.com"}

    def tearDown(self) -> None:
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_incorrect_answer_returns_correct_answer(self) -> None:
        response = submit_answer(
            self.exercise.id,
            SubmitAnswer(answer="Сәлем"),
            self.claims,
            self.db,
        )

        self.assertFalse(response.isCorrect)
        self.assertEqual(response.correctAnswer, "Рақмет")

    def test_correct_answer_does_not_repeat_correct_answer(self) -> None:
        response = submit_answer(
            self.exercise.id,
            SubmitAnswer(answer="  РАҚМЕТ  "),
            self.claims,
            self.db,
        )

        self.assertTrue(response.isCorrect)
        self.assertIsNone(response.correctAnswer)

    def test_answer_is_saved_as_an_attempt(self) -> None:
        submit_answer(
            self.exercise.id,
            SubmitAnswer(answer="Рақмет"),
            self.claims,
            self.db,
        )

        attempts = self.db.scalars(select(ExerciseAttempt)).all()
        self.assertEqual(len(attempts), 1)
        self.assertTrue(attempts[0].is_correct)

    def test_attempt_history_is_returned_newest_first(self) -> None:
        submit_answer(
            self.exercise.id,
            SubmitAnswer(answer="wrong"),
            self.claims,
            self.db,
        )
        submit_answer(
            self.exercise.id,
            SubmitAnswer(answer="Рақмет"),
            self.claims,
            self.db,
        )
        user = get_or_create_supabase_user(
            self.db,
            self.claims["sub"],
            self.claims["email"],
        )

        attempts = get_attempts_for_user(self.db, user)

        self.assertEqual([attempt.is_correct for attempt in attempts], [True, False])

    def test_exercise_list_does_not_expose_correct_answer(self) -> None:
        response = get_exercises_for_lesson(self.lesson.id, self.db)[0]

        self.assertEqual(response.options, ["Сәлем", "Рақмет", "Сау бол"])
        self.assertNotIn("correctAnswer", response.model_dump(by_alias=True))
        self.assertNotIn("correct_answer", response.model_dump())


if __name__ == "__main__":
    unittest.main()
