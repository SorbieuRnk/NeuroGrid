import os

from app.schemas.llm_outputs import StrategyOutput
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate

# Import the new model providers
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_xai import ChatXAI

load_dotenv()

def generate_demand_response_strategy(kw_deficit: float, user_profiles: str) -> StrategyOutput:
    
    # OPTION 1: Gemini (Google) - Excellent for complex reasoning and large context
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
    
    # OPTION 2: Groq (Groq Inc) - Ultra-fast inference (uncomment to use)
    # llm = ChatGroq(model="llama3-70b-8192", temperature=0)
    
    # OPTION 3: Grok (xAI) - (uncomment to use)
    # llm = ChatXAI(model="grok-beta", temperature=0)
    
    # Bind the exact same Pydantic schema to the new LLM
    structured_llm = llm.with_structured_output(StrategyOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the NeuroGrid AI Strategist. Your goal is to allocate localized load shedding.
        Analyze the available user profiles and select specific households to reduce power consumption.
        Match the targeted appliance to the user's historical affinities and allocate an appropriate reward.
        Do NOT exceed the required kW deficit."""),
        ("human", "Required Load Shed (kW Deficit): {kw_deficit}\n\nAvailable Users Database:\n{user_profiles}")
    ])
    
    chain = prompt | structured_llm
    
    return chain.invoke({
        "kw_deficit": kw_deficit, 
        "user_profiles": user_profiles
    })