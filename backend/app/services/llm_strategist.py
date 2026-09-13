import os

from app.schemas.llm_outputs import DemandResponseStrategy
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate

# Import the new model providers
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
STRATEGIST_PROMPT = """
You are an expert Grid Demand-Response Strategist.
Given a grid deficit in kW and a registry of consumers with their current total power draw (kW) and reward preferences:
1. Select target households to meet the required deficit without placing an unrealistic burden on any single home.
2. For each selected household, calculate a convincing, achievable percentage reduction (typically between 25% and 50%).
3. Match their stated reward preference with an appropriate incentive.

Deficit Target: {kw_deficit} kW
Active Consumers:
{user_profiles}
"""

def generate_demand_response_strategy(kw_deficit: float, user_profiles: str) -> DemandResponseStrategy:
    structured_llm = llm.with_structured_output(DemandResponseStrategy)
    prompt = ChatPromptTemplate.from_template(STRATEGIST_PROMPT)
    chain = prompt | structured_llm
    return chain.invoke({"kw_deficit": kw_deficit, "user_profiles": user_profiles})