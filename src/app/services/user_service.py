from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.models import AppUser


def get_user_by_id(db: Session, user_id: int) -> AppUser | None:
    return db.get(AppUser, user_id)


def get_or_create_supabase_user(db: Session, supabase_user_id: str, email: str) -> AppUser:
    user = db.scalar(select(AppUser).where(AppUser.supabase_user_id == supabase_user_id))
    if user is not None:
        return user

    user = db.scalar(select(AppUser).where(AppUser.email == email))
    if user is not None:
        if user.supabase_user_id is None:
            user.supabase_user_id = supabase_user_id
            db.commit()
            db.refresh(user)
        return user

    user = AppUser(
        email=email,
        display_name=email.split("@", maxsplit=1)[0],
        supabase_user_id=supabase_user_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
