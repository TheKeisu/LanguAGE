from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    email: str
    displayName: str


class LessonProgress(BaseModel):
    lessonId: int
    title: str
    totalExercises: int
    answeredExercises: int
    correctExercises: int
    completed: bool


class ProgressSummary(BaseModel):
    totalAttempts: int
    correctAttempts: int
    incorrectAttempts: int
    accuracyPercent: float
    totalLessons: int
    completedLessons: int
    lessons: list[LessonProgress]
