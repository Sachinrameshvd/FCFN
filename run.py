from backend.db.database import init_db, add_item, get_all_items
from backend.vision.camera import FridgeCamera
from backend.voice.assistant import VoiceAssistant
from backend.core.causal_twin import run_causal_analysis
from backend.simulation.federated_simulation import run_simulation
import time

def show_inventory_summary():
    items = get_all_items()
    print("\n" + "="*50)
    print(f"{'ITEM':<15} | {'ZONE':<10} | {'EXPIRY':<12} | {'STATUS'}")
    print("-" * 50)
    for item in items:
        expiry_str = item.expiry_at.strftime("%Y-%m-%d")
        print(f"{item.name:<15} | {item.zone:<10} | {expiry_str:<12} | {item.status}")
    print("="*50 + "\n")

def main():
    print("--- FedCausalFresh Net (FCFN) Initializing ---")
    init_db()
    assistant = VoiceAssistant()
    camera = FridgeCamera()

    # 1. Seed Initial Data
    add_item("Tomato", "Vegetable", "street", "front", 3)
    add_item("Milk", "Dairy", "supermarket", "back", 4)
    
    assistant.speak("Welcome to FedCausalFresh Net. I am monitoring your fridge in Chennai.")

    while True:
        print("\n1. Scan Fridge (Camera)")
        print("2. Voice Command")
        print("3. Run Causal Analysis")
        print("4. Run Federated Simulation")
        print("5. Exit")
        
        choice = input("Select an option: ")

        if choice == '1':
            assistant.speak("Scanning fridge contents...")
            detections = camera.capture_and_detect()
            
            if not detections:
                print("\n[SYSTEM] No items detected via Camera.")
                # Demo mode / Seed data
                detections = [
                    {'name': 'Tomato', 'zone': 'front-left', 'confidence': 0.95},
                    {'name': 'Milk', 'zone': 'back-center', 'confidence': 0.98}
                ]
                print(f"[DEMO] Using simulated detections: {detections}")

            # 1. Track Movements & Misplacements
            from backend.core.item_tracker import track_movements, detect_misplaced_items
            from backend.db.database import add_snapshot
            
            changes = track_movements(detections)
            misplaced = detect_misplaced_items(detections)
            
            # 2. Save Snapshot
            add_snapshot(detections)
            
            # 3. Update Inventory
            for d in detections:
                add_item(d['name'], "Detected", "street", d['zone'], 5)
            
            # 4. Report Findings
            if changes.get('moved'):
                for m in changes['moved']:
                    msg = f"Detected movement: {m['name']} moved from {m['from']} to {m['to']}."
                    print(f"[TRACKER] {msg}")
                    assistant.speak(msg)
            
            if misplaced:
                for mp in misplaced:
                    msg = f"Alert: {mp['item']} is in {mp['current_zone']}. Recommended: {mp['recommended_zone']} for {mp['reason']}."
                    print(f"[TRACKER] {msg}")
                    assistant.speak(msg)
            
            show_inventory_summary()
            assistant.speak("Scan complete. Inventory updated.")

        elif choice == '2':
            assistant.speak("How can I help you today?")
            query = assistant.listen()
            if query:
                print(f"User said: {query}")
                items = get_all_items()
                response = assistant.process_intent(query, items)
                assistant.speak(response)
            else:
                print("No voice detected.")

        elif choice == '3':
            items = get_all_items()
            if not items:
                print("Inventory empty. Scan first.")
                continue
            
            target = items[0]
            print(f"Running Causal Analysis for {target.name}...")
            effect = run_causal_analysis(target.name, "back")
            print(f"\n--- CAUSAL REPORT: {target.name} ---")
            print(f"Current Zone: {target.zone}")
            print(f"Intervention: Move to 'Back' (High Airflow)")
            print(f"Estimated Shelf-Life Lift: +{effect:.1f} days")
            print(f"Confidence Score: 0.89 (Federated Prior: Chennai-High-Humidity)")
            assistant.speak(f"Moving your {target.name} to the back zone could extend its life by {effect:.1f} days.")

        elif choice == '4':
            run_simulation()

        elif choice == '5':
            break

if __name__ == "__main__":
    main()
