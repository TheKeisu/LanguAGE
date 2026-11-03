from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_admin_claims, get_current_claims
from app.db.session import get_db
from app.modules.models import AppUser
from app.schemas.exercise import ExerciseAttemptResponse
from app.schemas.user import LessonProgress, ProgressSummary, UserResponse
from app.services import attempt_service, user_service

router = APIRouter()


def _to_user_response(user: AppUser) -> UserResponse:
    return UserResponse(id=user.id, email=user.email, displayName=user.display_name)


@router.get("/users/me", response_model=UserResponse)
def get_my_profile(
    claims: dict = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> UserResponse:
    user = user_service.get_or_create_supabase_user(db, claims["sub"], claims["email"])
    return _to_user_response(user)


@router.get("/users/me/progress", response_model=ProgressSummary)
def get_my_progress(
    claims: dict = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> ProgressSummary:
    user = user_service.get_or_create_supabase_user(db, claims["sub"], claims["email"])
    total_attempts, correct_attempts = attempt_service.get_progress_summary(db, user)
    lesson_progress = attempt_service.get_lesson_progress(db, user)
    incorrect_attempts = total_attempts - correct_attempts
    accuracy_percent = (
        round(correct_attempts / total_attempts * 100, 1) if total_attempts else 0.0
    )
    return ProgressSummary(
        totalAttempts=total_attempts,
        correctAttempts=correct_attempts,
        incorrectAttempts=incorrect_attempts,
        accuracyPercent=accuracy_percent,
        totalLessons=len(lesson_progress),
        completedLessons=sum(lesson["completed"] for lesson in lesson_progress),
        lessons=[LessonProgress(**lesson) for lesson in lesson_progress],
    )


@router.get(
    "/users/me/attempts",
    response_model=list[ExerciseAttemptResponse],
)
def get_my_attempts(
    claims: dict = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> list[ExerciseAttemptResponse]:
    user = user_service.get_or_create_supabase_user(db, claims["sub"], claims["email"])
    attempts = attempt_service.get_attempts_for_user(db, user)
    return [
        ExerciseAttemptResponse(
            id=attempt.id,
            exerciseId=attempt.exercise_id,
            isCorrect=attempt.is_correct,
            createdAt=attempt.created_at,
        )
        for attempt in attempts
    ]


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(get_admin_claims)],
)
def get_user(user_id: int, db: Session = Depends(get_db)) -> UserResponse:
    user = user_service.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return _to_user_response(user)
