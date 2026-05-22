from app.db.session import SessionLocal
from app.services.bootstrap import ensure_initial_admin


def main() -> None:
    with SessionLocal() as db:
        user = ensure_initial_admin(db)
        print(f"Ensured admin user {user.email}")


if __name__ == "__main__":
    main()
