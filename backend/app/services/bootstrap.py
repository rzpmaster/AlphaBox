import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)


def ensure_initial_admin(db: Session) -> User:
    user = db.scalar(select(User).where(User.email == settings.initial_admin_email))
    if user:
        if user.role != UserRole.ADMIN.value:
            user.role = UserRole.ADMIN.value
            db.commit()
            db.refresh(user)
            logger.info("Promoted initial admin user %s", settings.initial_admin_email)
        return user

    user = User(
        email=settings.initial_admin_email,
        display_name=settings.initial_admin_display_name,
        hashed_password=hash_password(settings.initial_admin_password),
        role=UserRole.ADMIN.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Created initial admin user %s", settings.initial_admin_email)
    return user
