import json
from datetime import datetime, timedelta
from backend.db.database import SessionLocal, SnapshotHistory, Item

def predict_consumption_rate(item_name: str):
    """
    Analyzes historical snapshots to estimate when an item will run out.
    """
    db = SessionLocal()
    try:
        # Get last 10 snapshots 
        snapshots = db.query(SnapshotHistory).order_by(SnapshotHistory.timestamp.desc()).limit(10).all()
        
        if len(snapshots) < 2:
            return None # Not enough data
            
        history = []
        for s in snapshots:
            detected = json.loads(s.detected_items)
            count = sum(1 for d in detected if d['name'].lower() == item_name.lower())
            history.append({
                "timestamp": s.timestamp,
                "count": count
            })
            
        # Sort by time ascending
        history.sort(key=lambda x: x['timestamp'])
        
        # Simple Linear Trend: (Current - Previous) / TimeDelta
        first = history[0]
        last = history[-1]
        
        # Ensure timestamps are datetime objects
        t_first = first['timestamp']
        t_last = last['timestamp']
        
        time_diff = (t_last - t_first).total_seconds() / 3600.0 # float hours
        count_diff = float(last['count'] - first['count'])
        
        if time_diff == 0 or count_diff >= 0:
            return None # Stagnant or increasing (restocked)
            
        consumption_per_hour = abs(count_diff) / time_diff
        
        if consumption_per_hour == 0:
            return None
            
        hours_remaining = float(last['count']) / consumption_per_hour
        predicted_time = t_last + timedelta(hours=float(hours_remaining))
        
        return {
            "item": item_name,
            "current_count": int(last['count']),
            "predicted_zero_day": predicted_time.isoformat(),
            "hours_remaining": round(hours_remaining, 1),
            "confidence": "High" if len(snapshots) > 5 else "Medium"
        }
    finally:
        db.close()

def get_forecast_alerts():
    """
    Returns items predicted to hit zero within the next 48 hours.
    """
    essentials = ["Milk", "Eggs", "Tomatoes", "Bread"]
    alerts = []
    for item in essentials:
        prediction = predict_consumption_rate(item)
        if prediction and float(prediction['hours_remaining']) < 48.0:
            alerts.append(prediction)
    return alerts
