from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.security import get_admin_claims
from app.db.session import get_db
from app.modules.models import LessonType
from app.schemas.lesson import LessonCreate, LessonResponse, LessonUpdate
from app.services import lesson_service

router = APIRouter()


@router.get("/lesson", response_model=list[LessonResponse])
def get_all_lessons(db: Session = Depends(get_db)) -> list[LessonResponse]:
    return lesson_service.get_all_lessons(db)


@router.get("/lesson/by-type", response_model=list[LessonResponse])
def get_lessons_by_type(
    lesson_type: LessonType = Query(alias="type"),
    db: Session = Depends(get_db),
) -> list[LessonResponse]:
    return lesson_service.get_lessons_by_type(db, lesson_type)


@router.get("/lesson/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)) -> LessonResponse:
    lesson = lesson_service.get_lesson_by_id(db, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return lesson


@router.post(
    "/lesson",
    response_model=LessonResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_admin_claims)],
)
def create_lesson(request: LessonCreate, db: Session = Depends(get_db)) -> LessonResponse:
    return lesson_service.create_lesson(db, request)


@router.put(
    "/lesson/{lesson_id}",
    response_model=LessonResponse,
    dependencies=[Depends(get_admin_claims)],
)
def update_lesson(
    lesson_id: int,
    request: LessonUpdate,
    db: Session = Depends(get_db),
) -> LessonResponse:
    lesson = lesson_service.update_lesson(db, lesson_id, request)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return lesson


@router.delete(
    "/lesson/{lesson_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_admin_claims)],
)
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)) -> Response:
    try:
        deleted = lesson_service.delete_lesson(db, lesson_id)
    except lesson_service.LessonHasAttemptsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Нельзя удалить урок: по его упражнениям уже есть ответы",
        )
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
