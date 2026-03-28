from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models
from app.db import Base, engine, get_db
from app.routes.medicines import router as medicines_router
from app.routes.suppliers import router as suppliers_router
from app.routes.customers import router as customers_router

app = FastAPI(title="Medical Store Management System API")


Base.metadata.create_all(bind=engine)


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
            detail=f"Database connection failed: {str(e)}",
        )


app.include_router(medicines_router)
app.include_router(suppliers_router)
app.include_router(customers_router)