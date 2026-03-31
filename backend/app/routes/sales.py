from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_active_admin
from app.db import get_db
from app.models import Customer, Medicine, Sale, User
from app.schemas import SaleCreate, SaleResponse

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.post("/", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    medicine = db.query(Medicine).filter(Medicine.id == payload.medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found.",
        )

    if payload.customer_id is not None:
        customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found.",
            )

    current_quantity = int(getattr(medicine, "quantity", 0) or 0)

    if payload.quantity > current_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock for this sale.",
        )

    subtotal = payload.quantity * payload.unit_price
    calculated_total = subtotal + payload.tax - payload.discount

    if calculated_total < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total amount cannot be negative.",
        )

    if abs(payload.total_amount - calculated_total) > 0.0001:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total amount must equal (quantity * unit_price) + tax - discount.",
        )

    sale = Sale(
        medicine_id=payload.medicine_id,
        customer_id=payload.customer_id,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        tax=payload.tax,
        discount=payload.discount,
        total_amount=payload.total_amount,
        sale_date=payload.sale_date,
    )

    new_quantity = current_quantity - payload.quantity
    setattr(medicine, "quantity", new_quantity)

    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale


@router.get("/", response_model=List[SaleResponse])
def get_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    sales = db.query(Sale).order_by(Sale.id.desc()).all()
    return sales


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()

    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found.",
        )

    return sale