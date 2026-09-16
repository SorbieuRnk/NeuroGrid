import os
from dotenv import load_dotenv

load_dotenv()

from app.schemas.llm_outputs import HouseholdTarget, MessageDraft,CopywriterOutput
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

llm_copywriter = ChatGroq(model="openai/gpt-oss-20b", temperature=0.7)

COPYWRITER_PROMPT = """
You are a behavioral energy copywriter.
Generate a valid JSON object with the single key "message_body" containing a short, encouraging demand-response alert:
{{"message_body": "your message here"}}

Rules:
- Ask the user to lower energy use by {reduction_percent}%.
- Mention their current ~{current_kw} kW usage.
- Feature their incentive: {incentive_reward}.
- Provide a quick tip (e.g. pause AC/geyser 45-60 min).
- Keep "message_body" concise and under 160 characters.
"""

def draft_percentage_message(target: HouseholdTarget) -> MessageDraft:
    structured_llm = llm_copywriter.with_structured_output(CopywriterOutput, method="json_mode")
    prompt = ChatPromptTemplate.from_template(COPYWRITER_PROMPT)
    chain = prompt | structured_llm

    result: CopywriterOutput = chain.invoke({
        "reduction_percent": target.reduction_percent,
        "current_kw": target.current_kw,
        "incentive_reward": target.incentive_reward
    })

    # Safely pair the LLM copy with the known phone number
    return MessageDraft(
        phone_number=target.phone_number,
        message_body=result.message_body
    )