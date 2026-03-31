from datetime import date, datetime
from typing import Optional, Sequence
from pydantic import BaseModel, ConfigDict, Field


class MedicineBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    batch_number: str = Field(..., min_length=1, max_length=100)
    expiry_date: date
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)


class MedicineCreate(MedicineBase):
    pass


class MedicineUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    batch_number: Optional[str] = Field(None, min_length=1, max_length=100)
    expiry_date: Optional[date] = None
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)


class MedicineResponse(MedicineBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    contact: str = Field(..., min_length=1, max_length=100)
    address: Optional[str] = Field(None, max_length=255)


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    contact: Optional[str] = Field(None, min_length=1, max_length=100)
    address: Optional[str] = Field(None, max_length=255)


class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    contact: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=255)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    contact: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=255)


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PurchaseBase(BaseModel):
    medicine_id: int
    supplier_id: int
    quantity: int = Field(..., gt=0)
    unit_cost: float = Field(..., gt=0)
    total_cost: float = Field(..., gt=0)
    purchase_date: date


class PurchaseCreate(PurchaseBase):
    pass


class PurchaseResponse(PurchaseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SaleBase(BaseModel):
    medicine_id: int
    customer_id: Optional[int] = None
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    tax: float = Field(0.0, ge=0)
    discount: float = Field(0.0, ge=0)
    total_amount: float = Field(..., ge=0)
    sale_date: date


class SaleCreate(SaleBase):
    pass


class SaleResponse(SaleBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None

class SalesSummary(BaseModel):
    total_sales: int
    total_quantity_sold: int
    total_revenue: float


class DailySalesReportResponse(BaseModel):
    report_date: date
    summary: SalesSummary
    sales: Sequence[SaleResponse]


class MonthlySalesReportResponse(BaseModel):
    year: int
    month: int
    summary: SalesSummary
    sales: Sequence[SaleResponse]