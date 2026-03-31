from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Medicine
from app.schemas import MedicineCreate, MedicineResponse, MedicineUpdate

router = APIRouter(prefix="/medicines", tags=["Medicines"])


@router.post("/", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(payload: MedicineCreate, db: Session = Depends(get_db)):
    existing_medicine = (
        db.query(Medicine)
        .filter(Medicine.batch_number == payload.batch_number)
        .first()
    )

    if existing_medicine:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medicine with this batch number already exists.",
        )

    medicine = Medicine(
        name=payload.name,
        category=payload.category,
        batch_number=payload.batch_number,
        expiry_date=payload.expiry_date,
        price=payload.price,
        quantity=payload.quantity,
    )

    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


@router.get("/", response_model=List[MedicineResponse])
def get_medicines(db: Session = Depends(get_db)):
    medicines = db.query(Medicine).order_by(Medicine.id.desc()).all()
    return medicines


@router.get("/{medicine_id}", response_model=MedicineResponse)
def get_medicine(medicine_id: int, db: Session = Depends(get_db)):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()

    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found.",
        )

    return medicine


@router.put("/{medicine_id}", response_model=MedicineResponse)
def update_medicine(
    medicine_id: int,
    payload: MedicineUpdate,
    db: Session = Depends(get_db),
):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()

    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if "batch_number" in update_data:
        existing_medicine = (
            db.query(Medicine)
            .filter(
                Medicine.batch_number == update_data["batch_number"],
                Medicine.id != medicine_id,
            )
            .first()
        )
        if existing_medicine:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another medicine with this batch number already exists.",
            )

    for field, value in update_data.items():
        setattr(medicine, field, value)

    db.commit()
    db.refresh(medicine)
    return medicine


@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicine(medicine_id: int, db: Session = Depends(get_db)):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()

    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found.",
        )

    db.delete(medicine)
    db.commit()