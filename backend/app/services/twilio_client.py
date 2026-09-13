import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

def send_whatsapp_message(to_number: str, message_body: str):
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_WHATSAPP_NUMBER")
    
    client = Client(account_sid, auth_token)
    
    # Ensure the 'whatsapp:' prefix is present, as Twilio requires it
    if not to_number.startswith("whatsapp:"):
        to_number = f"whatsapp:{to_number}"
        
    message = client.messages.create(
        from_=from_number,
        body=message_body,
        to=to_number
    )
    
    return message.sid