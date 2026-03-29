from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_active_admin
from app.db import get_db
from app.models import Medicine, Purchase, Supplier, User
from app.schemas import PurchaseCreate, PurchaseResponse
from typing import List, cast
router = APIRouter(prefix="/purchases", tags=["Purchases"])


@router.post("/", response_model=PurchaseResponse, status_code=status.HTTP_201_CREATED)
def create_purchase(
    payload: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    medicine = db.query(Medicine).filter(Medicine.id == payload.medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found.",
        )

    supplier = db.query(Supplier).filter(Supplier.id == payload.supplier_id).first()
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    expected_total = payload.quantity * payload.unit_cost
    if abs(payload.total_cost - expected_total) > 0.0001:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total cost must equal quantity * unit_cost.",
        )

    purchase = Purchase(
    medicine_id=payload.medicine_id,
    supplier_id=payload.supplier_id,
    quantity=payload.quantity,
    unit_cost=payload.unit_cost,
    total_cost=payload.total_cost,
    purchase_date=payload.purchase_date,
)

    current_quantity = int(getattr(medicine, "quantity", 0) or 0)
    setattr(medicine, "quantity", current_quantity + payload.quantity)

    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase

@router.get("/", response_model=List[PurchaseResponse])
def get_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    purchases = db.query(Purchase).order_by(Purchase.id.desc()).all()
    return purchases


@router.get("/{purchase_id}", response_model=PurchaseResponse)
def get_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found.",
        )

    return purchase