from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models
from app.db import Base, engine, get_db
from app.routes.auth import router as auth_router
from app.routes.medicines import router as medicines_router
from app.routes.suppliers import router as suppliers_router
from app.routes.customers import router as customers_router
from app.routes.purchases import router as purchases_router
from app.routes.sales import router as sales_router
from app.routes.reports import router as reports_router

app = FastAPI(title="Medical Store Management System API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
       "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

app.include_router(auth_router)
app.include_router(medicines_router)
app.include_router(suppliers_router)
app.include_router(customers_router)
app.include_router(purchases_router)
app.include_router(sales_router)
app.include_router(reports_router)