import pyttsx3
from faster_whisper import WhisperModel
import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write
import os
from datetime import datetime
from backend.core.predictor import calculate_expiry

class VoiceAssistant:
    def __init__(self):
        self.engine = pyttsx3.init()
        # Use small.en for speed on MacBook
        self.stt_model = WhisperModel("small.en", device="cpu", compute_type="int8")

    def speak(self, text):
        print(f"FCFN: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def listen(self, duration=5):
        print("Listening...")
        fs = 16000
        recording = sd.rec(int(duration * fs), samplerate=fs, channels=1)
        sd.wait()
        write('temp_query.wav', fs, recording)
        
        segments, info = self.stt_model.transcribe("temp_query.wav", beam_size=5)
        query = " ".join([segment.text for segment in segments])
        os.remove('temp_query.wav')
        return query.strip()

    def process_intent(self, query, items):
        query = query.lower()
        
        # 1. Handle Causal "What-If" Queries (e.g., "What if I move my tomatoes to the back?")
        if any(word in query for word in ["what if", "move", "shift", "place"]):
            for item in items:
                if item.name.lower() in query:
                    target_zone = None
                    if "back" in query: target_zone = "back"
                    elif "middle" in query: target_zone = "middle"
                    elif "front" in query: target_zone = "front"
                    
                    if target_zone:
                        if target_zone == item.zone:
                            return f"The {item.name} is already in the {target_zone} zone."
                        
                        from backend.core.causal_twin import run_causal_analysis
                        lift = run_causal_analysis(item.name, target_zone)
                        
                        if lift > 0:
                            return f"Moving your {item.name} to the {target_zone} zone would extend its life by approximately {lift:.1f} days. This is a recommended causal intervention for the Chennai climate."
                        elif lift < 0:
                            return f"I advise against moving the {item.name} to the {target_zone} zone. Our causal model predicts it would spoil {abs(lift):.1f} days sooner."
                        else:
                            return f"Moving the {item.name} to the {target_zone} zone won't significantly impact its freshness."

        # 2. Handle Spoilage & Status Queries (e.g., "How long will my tomatoes last?")
        for item in items:
            if item.name.lower() in query:
                if any(word in query for word in ["how long", "last", "expiry", "spoil", "fresh", "status", "condition"]):
                    remaining = (item.expiry_at - datetime.now()).days
                    
                    response = f"Your {item.name} is currently in the {item.zone} zone."
                    
                    if remaining <= 0:
                        response += " It has already reached its predicted expiry and should be removed or composted."
                    elif remaining == 1:
                        response += " It is at high risk of spoilage by tomorrow. Please use it today."
                    else:
                        response += f" It is predicted to stay fresh for about {remaining} more days."
                    
                    if item.vendor_type == 'street':
                        response += " Since this is street-vendor produce, ensure it was soaked in baking soda water to remove pesticides."
                    
                    return response

        # 3. Handle General Cleaning/Pesticide Queries
        if any(word in query for word in ["wash", "clean", "pesticide", "remove", "soak"]):
            return "For street vendor produce in Tamil Nadu, we recommend a 10-minute soak in water with one teaspoon of baking soda. For supermarket items, a standard cold water rinse is sufficient."

        # 4. Handle Inventory Overview
        if any(word in query for word in ["what is in", "inventory", "list", "items"]):
            if not items:
                return "Your fridge is currently empty. Would you like to scan it?"
            item_list = ", ".join([item.name for item in items])
            return f"You have {len(items)} items: {item_list}. I am monitoring them for freshness."
            
        return "I'm not sure about that specific request, but I'm monitoring your fridge's causal spoilage risks and pesticide alerts."
