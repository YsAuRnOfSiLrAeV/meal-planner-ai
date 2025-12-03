from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserUpsert, UserRead, UserDeleteRequest

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/upsert", response_model=UserRead)
def upsert_user(payload: UserUpsert, db: Session = Depends(get_db)):
    existing = (
        db.query(User)
        .filter(User.provider == payload.provider, User.provider_sub == payload.provider_sub)
        .one_or_none()
    )
    if existing:
        if payload.email != existing.email:
            existing.email = payload.email
        if payload.name != existing.name:
            existing.name = payload.name
        db.commit()
        db.refresh(existing)
        return existing

    user = User(
        provider=payload.provider,
        provider_sub=payload.provider_sub,
        email=payload.email,
        name=payload.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("", status_code=200)
def delete_user(payload: UserDeleteRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).one_or_none()
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(existing)
    db.commit()
    return {"status": "deleted"}