from pydantic import BaseModel, Field,ConfigDict,AliasChoices


# --- LLM 1: Strategist Schemas ---

class HouseholdTarget(BaseModel):
    phone_number: str = Field(description="User's phone number")
    current_kw: float = Field(description="Current total power consumption in kW")
    reduction_percent: int = Field(description="Suggested reduction percentage, e.g. 30, 40, or 50")
    target_reduction_kw: float = Field(description="Target kW reduction amount")
    incentive_reward: str = Field(description="Personalized reward tailored to user preference")
    suggested_tips: list[str] = Field(description="Generic tips like 'Pause high-load appliances like AC or geyser'")

class DemandResponseStrategy(BaseModel):
    model_config = ConfigDict(title="demand_response_strategy")
    total_deficit_kw: float
    total_curtailable_kw: float
    target_users: list[HouseholdTarget]

# --- LLM 2: Copywriter Schemas ---

class MessageDraft(BaseModel):
    phone_number: str
    message_body: str

# Schema strictly for the LLM output
class CopywriterOutput(BaseModel):
    model_config = ConfigDict(title="copywriter_output", populate_by_name=True)

    message_body: str = Field(
        validation_alias=AliasChoices("message_body", "alert", "message", "text", "body", "content"),
        description="The demand-response notification text under 160 characters"
    )