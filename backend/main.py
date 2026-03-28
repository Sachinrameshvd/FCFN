from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from backend.db.database import SessionLocal, Item, SnapshotHistory, get_all_items, add_item
from backend.core.causal_twin import run_causal_analysis, get_cleaning_advice

app = FastAPI(title="FedCausalFresh Net API")

class ItemCreate(BaseModel):
    name: str
    category: str
    vendor_type: str
    zone: str
    days_to_expiry: int | None = None

@app.get("/items")
def read_items():
    return get_all_items()

@app.post("/items")
def create_item(item: ItemCreate):
    db = SessionLocal()
    try:
        return add_item(item.name, item.category, item.vendor_type, item.zone, item.days_to_expiry)
    finally:
        db.close()

@app.get("/predict/{item_id}")
def predict_spoilage(item_id: int, target_zone: str):
    db = SessionLocal()
    try:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        from backend.core.causal_twin import run_causal_analysis, get_cleaning_advice, generate_causal_report
        effect = run_causal_analysis(item.name, target_zone)
        advice = get_cleaning_advice(item.vendor_type, item.category)
        report = generate_causal_report(item.name, target_zone, effect, item.vendor_type, item.category)
        
        return {
            "item": item.name,
            "causal_effect": effect,
            "cleaning_advice": advice,
            "report_text": report
        }
    finally:
        db.close()

@app.post("/items/{item_id}/refresh")
def refresh_status(item_id: int):
    from backend.db.database import update_item_status
    update_item_status(item_id)
    return {"status": "updated"}

@app.get("/history")
def get_snapshot_history():
    import json
    db = SessionLocal()
    snapshots = db.query(SnapshotHistory).order_by(SnapshotHistory.timestamp.desc()).limit(10).all()
    
    result = []
    for s in snapshots:
        result.append({
            "id": s.id,
            "timestamp": s.timestamp,
            "count": s.item_count,
            "items": json.loads(s.detected_items)
        })
    db.close()
    return result

# --- New Endpoints for Frontend Dashboard ---

@app.get("/shopping")
def get_shopping_list():
    from backend.core.forecaster import get_forecast_alerts
    forecasts = get_forecast_alerts()
    
    base_list = [
        {"id": 1, "name": "Tomatoes", "reason": "Expired recently", "type": "manual"},
        {"id": 2, "name": "Milk", "reason": "Low inventory", "type": "manual"}
    ]
    
    # Add AI predictions to shopping list if they aren't already there
    for f in forecasts:
        if not any(str(item['name']).lower() == str(f['item']).lower() for item in base_list):
            base_list.append({
                "id": f"ai_{f['item']}",
                "name": f['item'],
                "reason": f"AI Forecast: 0 in {f['hours_remaining']}h",
                "type": "ai"
            })
            
    return base_list

@app.get("/api/forecast")
def get_full_forecast():
    from backend.core.forecaster import predict_consumption_rate
    items = ["Milk", "Eggs", "Tomatoes", "Bread", "Paneer"]
    results = []
    for item in items:
        pred = predict_consumption_rate(item)
        if pred:
            results.append(pred)
        else:
            # Mock some data if no history yet for demo
            results.append({
                "item": item,
                "current_count": 2,
                "hours_remaining": 36.5,
                "predicted_zero_day": (datetime.now() + timedelta(hours=36.5)).isoformat(),
                "confidence": "Medium"
            })
    return results

@app.get("/market")
def get_market_trends():
    return [
        {"item": "Tomato", "trend": "up", "price": "₹40/kg"},
        {"item": "Onion", "trend": "down", "price": "₹30/kg"}
    ]

@app.get("/community")
def get_community_board():
    return [
        {"user": "Neighbor", "message": "Extra greens available!", "time": "2h ago"},
        {"user": "Community Fridge", "message": "Need milk donations.", "time": "5h ago"}
    ]

@app.get("/community/health")
def get_community_health():
    # Synthetic city-wide health data from the 5 federated nodes
    return {
        "city_average_freshness": 78,
        "total_waste_reduced": "124kg",
        "neighborhoods": [
            {"name": "Adyar", "freshness": 85, "active_fridges": 12, "waste_trend": "down"},
            {"name": "T. Nagar", "freshness": 62, "active_fridges": 25, "waste_trend": "stable"},
            {"name": "Mylapore", "freshness": 91, "active_fridges": 8, "waste_trend": "down"},
            {"name": "Velachery", "freshness": 74, "active_fridges": 15, "waste_trend": "up"},
            {"name": "Besant Nagar", "freshness": 88, "active_fridges": 10, "waste_trend": "down"}
        ],
        "vendor_quality": [
            {"name": "T. Nagar Fresh Market", "location": "T. Nagar", "score": 45, "status": "alert", "trend": "down"},
            {"name": "Adyar Organic Hub", "location": "Adyar", "score": 92, "status": "premium", "trend": "up"},
            {"name": "Mylapore Heritage Veg", "location": "Mylapore", "score": 88, "status": "good", "trend": "stable"},
            {"name": "Velachery Daily Mart", "location": "Velachery", "score": 68, "status": "average", "trend": "down"},
            {"name": "Ecr Beachside Greens", "location": "Besant Nagar", "score": 96, "status": "premium", "trend": "up"}
        ],
        "city_trends": [
            {"day": "Mon", "freshness": 70},
            {"day": "Tue", "freshness": 72},
            {"day": "Wed", "freshness": 75},
            {"day": "Thu", "freshness": 74},
            {"day": "Fri", "freshness": 78},
            {"day": "Sat", "freshness": 82},
            {"day": "Sun", "freshness": 78}
        ]
    }

@app.post("/community/share")
def share_to_community(data: dict):
    return {"status": "shared"}

@app.get("/weather")
def get_weather():
    # Simulating high humidity in Chennai
    return {"humidity": 92, "alert": "High Humidity Alert: Coastal moisture levels are peaking. Fungal risk increased for street-vendor greens."}

@app.post("/shopping/sync-expired")
def sync_expired():
    return {"count": 1, "message": "Synced 1 expired item to shopping list"}

@app.get("/alerts/misplaced")
def get_misplaced_items():
    from backend.core.item_tracker import detect_misplaced_items
    from backend.db.database import get_all_items
    
    items = get_all_items()
    # Mock detection format for tracker
    detections = [{"name": i.name, "zone": i.zone} for i in items]
    misplaced = detect_misplaced_items(detections)
    
    return misplaced

@app.get("/causal/graph")
def get_causal_graph():
    return {
        "nodes": [
            {"id": "humidity", "label": "Humidity", "type": "confounder", "description": "Tamil Nadu humidity levels"},
            {"id": "vendor", "label": "Vendor Type", "type": "confounder", "description": "Street vs Supermarket"},
            {"id": "zone", "label": "Fridge Zone", "type": "treatment", "description": "Current item placement"},
            {"id": "freshness", "label": "Freshness", "type": "outcome", "description": "Predicted shelf life"}
        ],
        "edges": [
            {"source": "humidity", "target": "zone", "label": "Affects Placement"},
            {"source": "humidity", "target": "freshness", "label": "Spoilage Cause"},
            {"source": "vendor", "target": "zone", "label": "Selection Bias"},
            {"source": "vendor", "target": "freshness", "label": "Base Quality"},
            {"source": "zone", "target": "freshness", "label": "Direct Effect"}
        ]
    }

@app.get("/api/impact")
def get_impact_stats():
    # Synthetic impact data based on rescued items
    return {
        "co2_saved": 12.5,
        "items_rescued": 24,
        "eco_score": 85,
        "rank": "Silver",
        "neighborhood_rank": "Top 5% in T. Nagar",
        "history": [
            {"day": "Mon", "saved": 1.2},
            {"day": "Tue", "saved": 0.8},
            {"day": "Wed", "saved": 2.1},
            {"day": "Thu", "saved": 1.5},
            {"day": "Fri", "saved": 3.2},
            {"day": "Sat", "saved": 2.4},
            {"day": "Sun", "saved": 1.3}
        ],
        "leaderboard": [
            {"user": "You", "score": 85, "saved": 12.5},
            {"user": "Arun_Node", "score": 92, "saved": 15.2},
            {"user": "Priya_Fridge", "score": 78, "saved": 10.8},
            {"user": "Chennai_Hero", "score": 98, "saved": 21.0}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
