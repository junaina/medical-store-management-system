from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import get_db

app = FastAPI(title="MSMS API")


@app.get("/")
def root():
    return {"message": "backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1")).scalar_one()
        return {
            "database": "connected",
            "result": result,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"database connection failed: {str(e)}",
        )