import os
from dotenv import load_dotenv

load_dotenv()

from app.schemas.llm_outputs import HouseholdTarget, MessageDraft
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

llm_copywriter = ChatGroq(model="openai/gpt-oss-20b", temperature=0.7)

COPYWRITER_PROMPT = """
You are a behavioral energy copywriter. Draft a short, encouraging, and urgent demand-response alert.
- Ask the user to lower their current household energy use by {reduction_percent}%.
- Highlight that they are currently using ~{current_kw} kW.
- Present their reward clearly: {incentive_reward}.
- Provide a brief tip (e.g., turning off heavy cooling or heating for 45-60 mins).
- Keep it concise, engaging, and under 160 characters if possible.

Phone: {phone_number}
"""

def draft_percentage_message(target: HouseholdTarget) -> MessageDraft:
    structured_llm = llm_copywriter.with_structured_output(MessageDraft)
    prompt = ChatPromptTemplate.from_template(COPYWRITER_PROMPT)
    chain = prompt | structured_llm
    return chain.invoke({
        "reduction_percent": target.reduction_percent,
        "current_kw": target.current_kw,
        "incentive_reward": target.incentive_reward,
        "phone_number": target.phone_number
    })