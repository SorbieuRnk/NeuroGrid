from pydantic import BaseModel, Field


# --- LLM 1: Strategist Schemas ---

class ApplianceTask(BaseModel):
    appliance_name: str = Field(..., description="The flexible appliance to be turned off (e.g., Water Pump, EV Charger)")
    expected_kw_reduction: float = Field(..., description="Estimated kW saved by turning this off")
    duration_minutes: int = Field(..., description="Duration to pause the appliance in minutes")
    reward_type: str = Field(..., description="The incentive offered (e.g., Travel Voucher, Bill Discount)")
    reward_amount: int = Field(..., description="Numerical value of the reward in INR or tokens")

class UserTarget(BaseModel):
    phone_number: str = Field(..., description="The target user's WhatsApp number")
    task: ApplianceTask = Field(..., description="The specific appliance reduction task assigned to this user")
    rationale: str = Field(..., description="Brief reasoning for why this user and appliance were selected based on their profile")

class StrategyOutput(BaseModel):
    target_users: list[UserTarget] = Field(..., description="List of users selected for the demand response event")
    total_kw_shed: float = Field(..., description="Total calculated kW that will be saved across all targeted users")

# --- LLM 2: Copywriter Schemas ---

class MessageDraft(BaseModel):
    phone_number: str = Field(..., description="The recipient's WhatsApp number")
    message_body: str = Field(..., description="The hyper-personalized, gamified WhatsApp message text")