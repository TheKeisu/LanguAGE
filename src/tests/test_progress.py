import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.routes.users import get_my_progress
from app.db.base import Base
from app.modules.models import AppUser, Exercise, ExerciseAttempt, ExerciseType, Lesson, LessonType
from app.services.attempt_service import get_lesson_progress, record_attempt


class LessonProgressTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.user = AppUser(email="learner@example.com", display_name="Learner")
        self.db.add(self.user)
        self.lesson = self.create_lesson("Shopping")

    def tearDown(self) -> None:
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def create_lesson(self, title: str) -> Lesson:
        lesson = Lesson(
            title=title,
            description="Lesson description",
            type=LessonType.THEORY,
        )
        self.db.add(lesson)
        self.db.flush()
        return lesson

    def create_exercises(self, count: int) -> list[Exercise]:
        exercises = [
            Exercise(
                prompt=f"Question {index}",
                correct_answer=f"Answer {index}",
                exercise_type=ExerciseType.TEXT,
                lesson_id=self.lesson.id,
            )
            for index in range(count)
        ]
        self.db.add_all(exercises)
        self.db.commit()
        return exercises

    def answer(self, exercise: Exercise, is_correct: bool) -> None:
        record_attempt(self.db, self.user, exercise, is_correct)

    def test_lesson_completes_when_everything_is_answered_and_half_is_correct(self) -> None:
        first, second = self.create_exercises(2)
        self.answer(first, True)
        self.answer(second, False)

        progress = get_lesson_progress(self.db, self.user)[0]

        self.assertEqual(progress["answeredExercises"], 2)
        self.assertEqual(progress["correctExercises"], 1)
        self.assertTrue(progress["completed"])

    def test_unanswered_exercise_keeps_lesson_incomplete(self) -> None:
        first, _ = self.create_exercises(2)
        self.answer(first, True)

        progress = get_lesson_progress(self.db, self.user)[0]

        self.assertEqual(progress["answeredExercises"], 1)
        self.assertFalse(progress["completed"])

    def test_another_users_attempts_do_not_affect_progress(self) -> None:
        (exercise,) = self.create_exercises(1)
        another_user = AppUser(email="other@example.com", display_name="Other")
        self.db.add(another_user)
        self.db.commit()
        record_attempt(self.db, another_user, exercise, True)

        progress = get_lesson_progress(self.db, self.user)[0]

        self.assertEqual(progress["answeredExercises"], 0)
        self.assertEqual(progress["correctExercises"], 0)
        self.assertFalse(progress["completed"])

    def test_lesson_stays_incomplete_when_less_than_half_is_correct(self) -> None:
        first, second, third = self.create_exercises(3)
        self.answer(first, True)
        self.answer(second, False)
        self.answer(third, False)

        progress = get_lesson_progress(self.db, self.user)[0]

        self.assertEqual(progress["answeredExercises"], 3)
        self.assertEqual(progress["correctExercises"], 1)
        self.assertFalse(progress["completed"])

    def test_retries_count_one_exercise_only_once(self) -> None:
        first, second = self.create_exercises(2)
        self.answer(first, False)
        self.answer(first, True)
        self.answer(second, False)

        progress = get_lesson_progress(self.db, self.user)[0]

        self.assertEqual(progress["answeredExercises"], 2)
        self.assertEqual(progress["correctExercises"], 1)
        self.assertTrue(progress["completed"])

    def test_empty_lesson_is_not_completed(self) -> None:
        self.db.commit()

        progress = get_lesson_progress(self.db, self.user)[0]

        self.assertEqual(progress["totalExercises"], 0)
        self.assertFalse(progress["completed"])

    def test_progress_endpoint_returns_attempt_totals_and_lesson_progress(self) -> None:
        first, second = self.create_exercises(2)
        self.answer(first, True)
        self.answer(second, False)

        response = get_my_progress(
            {"sub": "supabase-user-id", "email": self.user.email},
            self.db,
        )

        self.assertEqual(response.totalAttempts, 2)
        self.assertEqual(response.correctAttempts, 1)
        self.assertEqual(response.incorrectAttempts, 1)
        self.assertEqual(response.accuracyPercent, 50.0)
        self.assertEqual(response.completedLessons, 1)
        self.assertTrue(response.lessons[0].completed)


if __name__ == "__main__":
    unittest.main()
