from pydantic import BaseModel, Field


class ConsumerCreate(BaseModel):
    phone: str = Field(..., example="+919876543210", description="E.164 formatted phone number")
    household_name: str = Field("Primary Residence", example="Apartment 3A")
    current_kw: float = Field(0.0, ge=0.0, example=2.5, description="Initial power consumption in kW")
    reward_preference: str = Field("Electricity Bill Discount", example="Travel Vouchers")

class ConsumerResponse(BaseModel):
    id: int
    phone: str
    household_name: str
    current_kw: float
    reward_preference: str

    class Config:
        from_attributes = True