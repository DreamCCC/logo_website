from sqlalchemy import inspect, select, text

from app.config import get_settings
from app.db import Base, SessionLocal, engine
from app import models  # noqa: F401
from app.models import User
from app.security import hash_password


def main() -> None:
    settings = get_settings()
    _ensure_is_admin_column()
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        email = settings.admin_email.lower()
        admin = db.scalar(select(User).where(User.email == email))
        if admin:
            admin.is_admin = True
            message = f"Admin user exists and is enabled: {email}"
        else:
            admin = User(
                email=email,
                password_hash=hash_password(settings.admin_initial_password),
                company_name="KS. Logo",
                contact_name="Admin",
                preferred_locale="de",
                is_admin=True,
            )
            db.add(admin)
            message = f"Admin user created: {email}"

        db.commit()
        print(message)


def _ensure_is_admin_column() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    if "is_admin" in columns:
        return

    column_sql = (
        "ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0"
        if engine.dialect.name == "mysql"
        else "ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0"
    )
    with engine.begin() as connection:
        connection.execute(text(column_sql))
    print("Added users.is_admin column.")


if __name__ == "__main__":
    main()
