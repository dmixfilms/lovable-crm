import os
from sqlalchemy import create_engine, event, Engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

# Get database URL from env or use default SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lovable_crm.db")

# SQLite-specific setup
if DATABASE_URL.startswith("sqlite"):
    # Use StaticPool for SQLite to avoid threading issues
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
        poolclass=StaticPool if "sqlite" in DATABASE_URL else None,
    )

    # Enable foreign keys for SQLite
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        if "sqlite" in DATABASE_URL:
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
