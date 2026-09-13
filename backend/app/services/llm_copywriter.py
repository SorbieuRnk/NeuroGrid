import os
from dotenv import load_dotenv

load_dotenv()

from langchain_core.prompts import ChatPromptTemplate
from app.schemas.llm_outputs import MessageDraft, UserTarget
from langchain_groq import ChatGroq

def draft_whatsapp_message(target_data: UserTarget) -> MessageDraft:
    # Temperature 0.7 allows for more creative, conversational text
    llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0.7)
    
    # Bind to the MessageDraft schema
    structured_llm = llm.with_structured_output(MessageDraft)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a behavioral energy economist writing WhatsApp nudges for the NeuroGrid platform.
        Your goal is to persuade the user to reduce their power consumption by pausing a specific appliance.
        Tone: Friendly, urgent, and gamified. Keep it under 3 short sentences. Use emojis.
        Always clearly state the specific appliance, the time duration, and the exact reward they will earn. Do it within 100 words."""),
        
        ("human", """Draft a message for this user:
        Phone Number: {phone}
        Appliance to pause: {appliance}
        Duration: {duration} minutes
        Reward: {reward_amount} {reward_type}
        Strategist Rationale: {rationale}""")
    ])
    
    chain = prompt | structured_llm
    
    return chain.invoke({
        "phone": target_data.phone_number,
        "appliance": target_data.task.appliance_name,
        "duration": target_data.task.duration_minutes,
        "reward_amount": target_data.task.reward_amount,
        "reward_type": target_data.task.reward_type,
        "rationale": target_data.rationale
    })