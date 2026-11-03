import unittest

from pydantic import ValidationError

from app.modules.models import ExerciseType
from app.schemas.exercise import ExerciseCreate


class ExerciseCreateTests(unittest.TestCase):
    def test_free_text_is_the_default_type(self) -> None:
        exercise = ExerciseCreate(prompt="Translate", correctAnswer="hello")

        self.assertEqual(exercise.type, ExerciseType.TEXT)
        self.assertIsNone(exercise.options)

    def test_fill_blank_accepts_a_text_answer(self) -> None:
        exercise = ExerciseCreate(
            prompt="Мен ___ оқимын.",
            correctAnswer="кітап",
            type=ExerciseType.FILL_BLANK,
        )

        self.assertEqual(exercise.type, ExerciseType.FILL_BLANK)

    def test_multiple_choice_requires_correct_answer_in_options(self) -> None:
        exercise = ExerciseCreate(
            prompt="Choose the translation",
            correctAnswer="Рақмет",
            type=ExerciseType.MULTIPLE_CHOICE,
            options=["Сәлем", "Рақмет"],
        )

        self.assertEqual(exercise.options, ["Сәлем", "Рақмет"])

    def test_multiple_choice_rejects_missing_correct_answer(self) -> None:
        with self.assertRaises(ValidationError):
            ExerciseCreate(
                prompt="Choose the translation",
                correctAnswer="Рақмет",
                type=ExerciseType.MULTIPLE_CHOICE,
                options=["Сәлем", "Сау бол"],
            )

    def test_multiple_choice_rejects_duplicate_options(self) -> None:
        with self.assertRaises(ValidationError):
            ExerciseCreate(
                prompt="Choose the translation",
                correctAnswer="Hello",
                type=ExerciseType.MULTIPLE_CHOICE,
                options=["Hello", " hello "],
            )


if __name__ == "__main__":
    unittest.main()
