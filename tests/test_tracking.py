import sys
import os
import json

# Ensure backend can be imported
sys.path.append(os.getcwd())

from backend.db.database import init_db, add_snapshot, SnapshotHistory, SessionLocal
from backend.core.item_tracker import track_movements

def test_tracking():
    print("Initializing DB for tracking test...")
    init_db()
    
    # 1. First Scan
    detections_1 = [
        {'name': 'Tomato', 'zone': 'front-left', 'confidence': 0.95},
        {'name': 'Milk', 'zone': 'back-center', 'confidence': 0.98}
    ]
    print("Snapshot 1: Tomato (front-left), Milk (back-center)")
    add_snapshot(detections_1)
    
    # 2. Second Scan (Milk moved, Tomato removed, Apple added)
    detections_2 = [
        {'name': 'Milk', 'zone': 'middle-center', 'confidence': 0.97},
        {'name': 'Apple', 'zone': 'front-right', 'confidence': 0.92}
    ]
    print("Snapshot 2: Milk moved to middle-center, Tomato removed, Apple added")
    
    changes = track_movements(detections_2)
    print(f"Changes Detected: {changes}")
    
    # Assertions
    moved_names = [m['name'] for m in changes.get('moved', [])]
    new_names = [n['name'] for n in changes.get('new', [])]
    removed_names = [r['name'] for r in changes.get('removed', [])]
    
    passed = True
    if 'Milk' not in moved_names:
        print("FAIL: Milk movement not detected")
        passed = False
    if 'Apple' not in new_names:
        print("FAIL: Apple addition not detected")
        passed = False
    if 'Tomato' not in removed_names:
        print("FAIL: Tomato removal not detected")
        passed = False
        
    if passed:
        print("Tracking test: PASSED")
    else:
        print("Tracking test: FAILED")

if __name__ == "__main__":
    test_tracking()
