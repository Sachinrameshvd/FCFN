import sys
import os

# Ensure backend can be imported
sys.path.append(os.getcwd())

from backend.voice.assistant import VoiceAssistant
from backend.db.database import init_db, Item, SessionLocal

def test_causal_query():
    print("Initializing DB for test...")
    init_db()
    
    db = SessionLocal()
    # Add a mock item
    item = Item(name="Tomato", category="Vegetable", vendor_type="street", zone="front-center")
    db.add(item)
    db.commit()
    items = [item]
    
    assistant = VoiceAssistant()
    
    query = "What if I move my tomatoes to the back?"
    print(f"Testing Query: {query}")
    response = assistant.process_intent(query, items)
    print(f"Response: {response}")
    
    if "extend its life" in response or "back" in response:
        print("Causal query test: PASSED")
    else:
        print("Causal query test: FAILED")
    
    db.close()

if __name__ == "__main__":
    test_causal_query()
