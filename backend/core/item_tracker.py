import json
from backend.db.database import SessionLocal, SnapshotHistory, Item

def get_last_snapshot():
    db = SessionLocal()
    snapshot = db.query(SnapshotHistory).order_by(SnapshotHistory.timestamp.desc()).first()
    db.close()
    return snapshot

def track_movements(current_detections):
    """
    Compares current detections with the last snapshot to identify changes.
    """
    last_snapshot = get_last_snapshot()
    if not last_snapshot:
        return {"status": "first_scan", "new_items": current_detections}

    previous_detections = json.loads(last_snapshot.detected_items)
    
    # Simple tracking based on name (in a real system, we'd use track IDs or visual features)
    prev_map = {d['name']: d['zone'] for d in previous_detections}
    curr_map = {d['name']: d['zone'] for d in current_detections}

    moved_items = []
    new_items = []
    removed_items = []

    for name, zone in curr_map.items():
        if name in prev_map:
            if zone != prev_map[name]:
                moved_items.append({"name": name, "from": prev_map[name], "to": zone})
        else:
            new_items.append({"name": name, "zone": zone})

    for name, zone in prev_map.items():
        if name not in curr_map:
            removed_items.append({"name": name, "zone": zone})

    return {
        "moved": moved_items,
        "new": new_items,
        "removed": removed_items
    }

def detect_misplaced_items(detections):
    """
    Identifies items that are in 'risky' or suboptimal zones.
    """
    misplaced = []
    for d in detections:
        # Example logic: Milk should be in 'back' (coolest)
        if d['name'] == 'milk' and d['zone'] != 'back':
            misplaced.append({
                "item": d['name'],
                "current_zone": d['zone'],
                "recommended_zone": "back",
                "reason": "Temperature stability"
            })
        # Tomato in 'back' might be too cold if it's high humidity
        if d['name'] == 'tomato' and d['zone'] == 'back':
            misplaced.append({
                "item": d['name'],
                "current_zone": d['zone'],
                "recommended_zone": "middle",
                "reason": "Avoid chilling injury"
            })
            
    return misplaced
