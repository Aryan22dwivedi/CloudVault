from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database

# IMPORT THE ROUTERS
from .routers import auth, files, analytics, ocr

# Create Database Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="CloudVault API")

# Enable CORS (Allows Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CONNECT THE ROUTERS (This fixes the 404!)
app.include_router(auth.router)
app.include_router(files.router)
app.include_router(analytics.router)
app.include_router(ocr.router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "CloudVault Modular API is running!"}
