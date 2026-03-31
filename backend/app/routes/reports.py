from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth import get_current_active_admin
from app.db import get_db
from app.models import Medicine, Sale, User
from app.schemas import (
    DailySalesReportResponse,
    MedicineResponse,
    MonthlySalesReportResponse,
    SalesSummary,
    SaleResponse,
)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/low-stock", response_model=list[MedicineResponse])
def get_low_stock_medicines(
    threshold: int = Query(10, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    medicines = (
        db.query(Medicine)
        .filter(Medicine.quantity <= threshold)
        .order_by(Medicine.quantity.asc(), Medicine.id.desc())
        .all()
    )
    return medicines


@router.get("/near-expiry", response_model=list[MedicineResponse])
def get_near_expiry_medicines(
    days: int = Query(30, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    today = date.today()
    expiry_limit = today + timedelta(days=days)

    medicines = (
        db.query(Medicine)
        .filter(Medicine.expiry_date >= today, Medicine.expiry_date <= expiry_limit)
        .order_by(Medicine.expiry_date.asc(), Medicine.id.desc())
        .all()
    )
    return medicines


@router.get("/stock", response_model=list[MedicineResponse])
def get_stock_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    medicines = db.query(Medicine).order_by(Medicine.name.asc()).all()
    return medicines


@router.get("/expiry", response_model=list[MedicineResponse])
def get_expiry_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    medicines = db.query(Medicine).order_by(Medicine.expiry_date.asc()).all()
    return medicines


@router.get("/daily-sales", response_model=DailySalesReportResponse)
def get_daily_sales_report(
    report_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    sales = (
        db.query(Sale)
        .filter(Sale.sale_date == report_date)
        .order_by(Sale.id.desc())
        .all()
    )

    total_sales = len(sales)
    total_quantity_sold = sum(int(getattr(sale, "quantity", 0) or 0) for sale in sales)
    total_revenue = sum(float(getattr(sale, "total_amount", 0) or 0) for sale in sales)

    summary = SalesSummary(
        total_sales=total_sales,
        total_quantity_sold=total_quantity_sold,
        total_revenue=total_revenue,
    )
    validated_sales = [SaleResponse.model_validate(sale) for sale in sales]
    return DailySalesReportResponse(
        report_date=report_date,
        summary=summary,
        sales=validated_sales,
    )


@router.get("/monthly-sales", response_model=MonthlySalesReportResponse)
def get_monthly_sales_report(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    sales = (
        db.query(Sale)
        .filter(
            Sale.sale_date >= date(year, month, 1),
            Sale.sale_date < (
                date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
            ),
        )
        .order_by(Sale.sale_date.desc(), Sale.id.desc())
        .all()
    )

    total_sales = len(sales)
    total_quantity_sold = sum(int(getattr(sale, "quantity", 0) or 0) for sale in sales)
    total_revenue = sum(float(getattr(sale, "total_amount", 0) or 0) for sale in sales)

    summary = SalesSummary(
        total_sales=total_sales,
        total_quantity_sold=total_quantity_sold,
        total_revenue=total_revenue,
    )

    validated_sales = [SaleResponse.model_validate(sale) for sale in sales]

    return MonthlySalesReportResponse(
        year=year,
        month=month,
        summary=summary,
        sales=validated_sales,
    )