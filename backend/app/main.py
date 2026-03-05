from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text

from app.database import engine, Base, SessionLocal
from app.config import settings
from app.routers import auth, leads, tasks, deals, previews, templates, messages, dashboard, jobs, payments, settings as settings_router, backups

# Create tables on startup
def create_tables():
    """Create all tables in the database"""
    import os
    print(f"📍 Database URL: {settings.database_url}")
    print(f"📍 Current directory: {os.getcwd()}")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")


def init_scheduler():
    """Initialize APScheduler"""
    from app.workers.scheduler import scheduler, register_jobs

    try:
        # Register all jobs first
        register_jobs()

        if not scheduler.running:
            scheduler.start()
            print("✓ APScheduler started")
    except Exception as e:
        print(f"✗ Failed to start scheduler: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    print("🚀 Starting Lovable CRM API...")
    create_tables()
    print("✓ Database tables created/verified")

    init_scheduler()

    yield

    # Shutdown
    print("🛑 Shutting down...")
    from app.workers.scheduler import scheduler

    if scheduler.running:
        scheduler.shutdown()
        print("✓ APScheduler stopped")


app = FastAPI(
    title="Lovable CRM API",
    description="CRM system for managing website redesign previews",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://192.168.1.21:3000",
        "http://192.168.1.21:3001",
        "http://192.168.1.21:8000",
        "http://192.168.1.202:3000",
        "http://192.168.1.202:3001",
        "http://192.168.1.202:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(leads.router, prefix="/leads", tags=["leads"])
app.include_router(tasks.router, prefix="/leads", tags=["tasks"])
app.include_router(deals.router, prefix="/leads", tags=["deals"])
app.include_router(previews.router, prefix="/leads", tags=["previews"])
app.include_router(messages.router, prefix="/leads", tags=["messages"])
app.include_router(payments.router, prefix="/leads", tags=["payments"])
app.include_router(templates.router, prefix="/templates", tags=["templates"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(backups.router, tags=["backups"])
app.include_router(settings_router.router, prefix="/api", tags=["settings"])


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "0.1.0",
        "debug": settings.debug,
    }


@app.get("/", tags=["root"])
async def root():
    """Root endpoint"""
    return {
        "name": "Lovable CRM API",
        "version": "0.1.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
