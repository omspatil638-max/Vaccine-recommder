import os
import sys
from contextlib import asynccontextmanager

# Make the project root importable so `rule_engine` resolves.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import APP_VERSION, CORS_ORIGINS
from app.db import init_db
from engine import load_all
from app import models  # noqa: F401  (registers tables)
from app.routers import app_api, auth, intake, legacy_engine, system


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    load_all()  # validate medical knowledge at startup; refuse to start if invalid
    yield


app = FastAPI(
    title="Vaccination guidance API",
    description="Deterministic vaccination guidance derived from versioned, cited guidelines.",
    version=APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "X-CSRF-Token"],
)

@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "same-origin")
    response.headers.setdefault("Cache-Control", "no-store")
    return response


app.include_router(system.router)
app.include_router(auth.router)
app.include_router(intake.router)
app.include_router(app_api.router)
app.include_router(legacy_engine.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
