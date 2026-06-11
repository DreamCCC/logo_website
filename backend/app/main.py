from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import admin, auth, content, quotes

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(quotes.router, prefix=settings.api_prefix)
app.include_router(content.router, prefix=settings.api_prefix)
app.include_router(admin.router, prefix=settings.api_prefix)

app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
