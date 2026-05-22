import secrets
import string
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.invitation import InvitationCode

CODE_ALPHABET = string.ascii_uppercase + string.digits


def generate_code(length: int = 12) -> str:
    return "AB-" + "".join(secrets.choice(CODE_ALPHABET) for _ in range(length))


def create_invitation_codes(db: Session, created_by_id: int, count: int) -> list[InvitationCode]:
    count = max(1, min(count, 100))
    codes: list[InvitationCode] = []
    for _ in range(count):
        code = generate_code()
        while db.scalar(select(InvitationCode).where(InvitationCode.code == code)):
            code = generate_code()
        invitation = InvitationCode(code=code, created_by_id=created_by_id)
        db.add(invitation)
        codes.append(invitation)
    db.commit()
    for code in codes:
        db.refresh(code)
    return codes


def claim_invitation_code(db: Session, code: str, user_id: int) -> None:
    invitation = db.scalar(select(InvitationCode).where(InvitationCode.code == code).with_for_update())
    if not invitation or invitation.used_by_id is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or used invitation code")
    invitation.used_by_id = user_id
    invitation.used_at = datetime.now(timezone.utc)
