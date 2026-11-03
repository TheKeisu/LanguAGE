from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.security import get_admin_claims, get_current_claims
from app.db.session import get_db
from app.schemas.exercise import (
    ExerciseCreate,
    ExerciseResponse,
    ExerciseUpdate,
    SubmitAnswer,
    SubmitAnswerResponse,
)
from app.services import exercise_service, user_service

router = APIRouter()


@router.post(
    "/lesson/{lesson_id}/exercises",
    response_model=ExerciseResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_admin_claims)],
)
def create_exercise(
    lesson_id: int,
    request: ExerciseCreate,
    db: Session = Depends(get_db),
) -> ExerciseResponse:
    exercise = exercise_service.create_exercise(db, lesson_id, request)
    if exercise is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return ExerciseResponse(
        id=exercise.id,
        prompt=exercise.prompt,
        type=exercise.exercise_type,
        options=exercise.options,
    )


@router.get("/lesson/{lesson_id}/exercises", response_model=list[ExerciseResponse])
def get_exercises_for_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
) -> list[ExerciseResponse]:
    exercises = exercise_service.get_exercises_for_lesson(db, lesson_id)
    if exercises is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return [
        ExerciseResponse(
            id=exercise.id,
            prompt=exercise.prompt,
            type=exercise.exercise_type,
            options=exercise.options,
        )
        for exercise in exercises
    ]


@router.post(
    "/exercises/{exercise_id}/answer",
    response_model=SubmitAnswerResponse,
)
def submit_answer(
    exercise_id: int,
    request: SubmitAnswer,
    claims: dict = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> SubmitAnswerResponse:
    user = user_service.get_or_create_supabase_user(db, claims["sub"], claims["email"])
    result = exercise_service.check_answer(db, exercise_id, request.answer, user)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    is_correct, correct_answer = result
    return SubmitAnswerResponse(
        isCorrect=is_correct,
        correctAnswer=None if is_correct else correct_answer,
    )


@router.put(
    "/exercises/{exercise_id}",
    response_model=ExerciseResponse,
    dependencies=[Depends(get_admin_claims)],
)
def update_exercise(
    exercise_id: int,
    request: ExerciseUpdate,
    db: Session = Depends(get_db),
) -> ExerciseResponse:
    exercise = exercise_service.update_exercise(db, exercise_id, request)
    if exercise is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return ExerciseResponse(
        id=exercise.id,
        prompt=exercise.prompt,
        type=exercise.exercise_type,
        options=exercise.options,
    )


@router.delete(
    "/exercises/{exercise_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_admin_claims)],
)
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)) -> Response:
    try:
        deleted = exercise_service.delete_exercise(db, exercise_id)
    except exercise_service.ExerciseHasAttemptsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Нельзя удалить упражнение: по нему уже есть ответы",
        )
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
