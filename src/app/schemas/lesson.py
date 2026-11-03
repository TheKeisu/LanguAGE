from pydantic import BaseModel, ConfigDict, field_validator

from app.modules.models import LessonType

class LessonCreate(BaseModel):
    # Kotlin only marked description as NotBlank on creation.
    title: str
    description: str
    type: LessonType

    @field_validator("description")
    @classmethod
    def description_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Поле не должно быть пустым")
        return value


class LessonUpdate(BaseModel):
    title: str
    description: str
    type: LessonType

    @field_validator("title", "description")
    @classmethod
    def fields_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Поле не должно быть пустым")
        return value


class LessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    type: LessonType
