from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.modules.models import ExerciseType


class ExerciseCreate(BaseModel):
    prompt: str
    correct_answer: str = Field(alias="correctAnswer")
    type: ExerciseType = ExerciseType.TEXT
    options: list[str] | None = None

    @field_validator("prompt", "correct_answer")
    @classmethod
    def fields_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Поле не должно быть пустым")
        return value

    @field_validator("options")
    @classmethod
    def options_must_not_be_blank(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        cleaned_options = [option.strip() for option in value]
        if any(not option for option in cleaned_options):
            raise ValueError("Варианты ответа не должны быть пустыми")
        if len({option.casefold() for option in cleaned_options}) != len(cleaned_options):
            raise ValueError("Варианты ответа должны отличаться друг от друга")
        return cleaned_options

    @model_validator(mode="after")
    def multiple_choice_requires_options(self) -> ExerciseCreate:
        if self.type == ExerciseType.MULTIPLE_CHOICE:
            if self.options is None or len(self.options) < 2:
                raise ValueError("Для выбора ответа нужно указать минимум два варианта")
            if self.correct_answer.strip().casefold() not in {
                option.casefold() for option in self.options
            }:
                raise ValueError("Правильный ответ должен совпадать с одним из вариантов")
        elif self.options:
            raise ValueError("Варианты ответа можно указать только для типа MULTIPLE_CHOICE")
        return self


class ExerciseUpdate(ExerciseCreate):
    pass


class ExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    prompt: str
    type: ExerciseType
    options: list[str] | None


class SubmitAnswer(BaseModel):
    answer: str

    @field_validator("answer")
    @classmethod
    def answer_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Ответ не должен быть пустым")
        return value


class SubmitAnswerResponse(BaseModel):
    isCorrect: bool
    correctAnswer: str | None = None


class ExerciseAttemptResponse(BaseModel):
    id: int
    exerciseId: int
    isCorrect: bool
    createdAt: datetime
