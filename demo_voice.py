import os
import sys
import time

# Ensure backend can be imported
sys.path.append(os.getcwd())

from backend.voice.assistant import VoiceAssistant
from backend.db.database import get_all_items

def run_voice_demo():
    print("🎙️ Starting FCFN Privacy-First Local Voice Assistant 🎙️")
    print("Loading local Whisper model (this may take a few seconds)...")
    
    try:
        assistant = VoiceAssistant()
        print("\n✅ Model loaded successfully!")
        
        while True:
            print("\n--------------------------------------------------")
            print("Press ENTER to start speaking, or type 'q' to quit.")
            choice = input("> ")
            if choice.lower() == 'q':
                print("Shutting down voice assistant.")
                break
                
            # Fetch current live items from the database
            current_items = get_all_items()
            
            assistant.speak("I am listening. How can I help you with your fridge?")
            
            # Listen for 5 seconds
            query = assistant.listen(duration=5)
            print(f"\n🗣️ You said: '{query}'")
            
            if not query:
                print("Didn't catch that. Please try again.")
                continue
                
            print("🧠 Processing intent...")
            response = assistant.process_intent(query, current_items)
            
            print(f"\n🤖 Assistant: {response}")
            assistant.speak(response)
            
    except Exception as e:
        print(f"Error starting voice assistant: {e}")
        print("Note: To run this local Audio AI, you might need to install PyAudio using: pip install PyAudio")

if __name__ == "__main__":
    run_voice_demo()
