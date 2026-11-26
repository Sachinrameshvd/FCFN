from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from backend.db.database import (
    SessionLocal, Item, SnapshotHistory, ShoppingItem, CommunityItem, FederatedNode, History,
    get_all_items, add_item, init_db
)
from backend.core.causal_twin import run_causal_analysis, get_cleaning_advice, generate_causal_report

# Ensure database tables exist on startup
init_db()

app = FastAPI(title="FedCausalFresh Net API", version="2.0.0")

class ItemCreate(BaseModel):
    name: str
    category: str
    vendor_type: str
    zone: str
    days_to_expiry: Optional[int] = None

class CommunityShareRequest(BaseModel):
    name: str
    expiry_at: Optional[str] = None
    location: Optional[str] = "T. Nagar, Chennai"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health_check():
    db = SessionLocal()
    try:
        item_count = db.query(Item).count()
        node_count = db.query(FederatedNode).count()
        return {
            "status": "healthy",
            "service": "FCFN Python AI Engine",
            "database": "connected",
            "item_count": item_count,
            "federated_nodes": node_count,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")
    finally:
        db.close()

@app.get("/items")
def read_items():
    return get_all_items()

@app.post("/items")
def create_item(item: ItemCreate):
    db = SessionLocal()
    try:
        created = add_item(item.name, item.category, item.vendor_type, item.zone, item.days_to_expiry)
        return {
            "id": created.id,
            "name": created.name,
            "category": created.category,
            "vendor_type": created.vendor_type,
            "zone": created.zone,
            "expiry_at": created.expiry_at.isoformat() if created.expiry_at else None,
            "status": created.status
        }
    finally:
        db.close()

@app.get("/predict/{item_id}")
def predict_spoilage(item_id: int, target_zone: str):
    db = SessionLocal()
    try:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Item with ID {item_id} not found")
        
        effect = run_causal_analysis(item.name, target_zone)
        advice = get_cleaning_advice(item.vendor_type, item.category)
        report = generate_causal_report(item.name, target_zone, effect, item.vendor_type, item.category)
        
        return {
            "item": item.name,
            "category": item.category,
            "vendor_type": item.vendor_type,
            "current_zone": item.zone,
            "target_zone": target_zone,
            "causal_effect": round(effect, 2),
            "total_days_lift": round(effect * (2 if target_zone == 'back' else 1), 1),
            "cleaning_advice": advice,
            "report_text": report
        }
    finally:
        db.close()

@app.post("/items/{item_id}/refresh")
def refresh_status(item_id: int):
    from backend.db.database import update_item_status
    update_item_status(item_id)
    return {"status": "updated", "item_id": item_id}

@app.get("/history")
def get_snapshot_history():
    import json
    db = SessionLocal()
    try:
        snapshots = db.query(SnapshotHistory).order_by(SnapshotHistory.timestamp.desc()).limit(10).all()
        result = []
        for s in snapshots:
            result.append({
                "id": s.id,
                "timestamp": s.timestamp.isoformat() if isinstance(s.timestamp, datetime) else s.timestamp,
                "count": s.item_count,
                "items": json.loads(s.detected_items) if s.detected_items else []
            })
        return result
    finally:
        db.close()

@app.get("/shopping")
def get_shopping_list():
    db = SessionLocal()
    try:
        items = db.query(ShoppingItem).order_by(ShoppingItem.added_at.desc()).all()
        result = []
        for item in items:
            result.append({
                "id": item.id,
                "name": item.name,
                "category": item.category or "General",
                "priority": item.priority or "medium",
                "added_at": item.added_at.isoformat() if item.added_at else datetime.now().isoformat()
            })
        
        # Include AI forecast predictions if list is low
        if len(result) < 3:
            from backend.core.forecaster import get_forecast_alerts
            forecasts = get_forecast_alerts()
            for f in forecasts:
                if not any(str(it["name"]).lower() == str(f["item"]).lower() for it in result):
                    result.append({
                        "id": f"ai_{f['item']}",
                        "name": f["item"],
                        "category": "Produce",
                        "priority": "high",
                        "reason": f"AI Forecast: Low in {f['hours_remaining']}h",
                        "type": "ai"
                    })
        return result
    finally:
        db.close()

@app.post("/shopping/sync-expired")
def sync_expired():
    db = SessionLocal()
    try:
        now = datetime.now()
        expired = db.query(Item).filter(Item.expiry_at < now).all()
        synced_count = 0
        for item in expired:
            existing = db.query(ShoppingItem).filter(ShoppingItem.name.ilike(item.name)).first()
            if not existing:
                shop_id = f"shop-exp-{int(now.timestamp())}-{synced_count}"
                new_shop = ShoppingItem(
                    id=shop_id,
                    name=item.name,
                    category=item.category,
                    priority="high"
                )
                db.add(new_shop)
                synced_count += 1
        
        # Delete expired items from inventory after sync
        if expired:
            for item in expired:
                db.delete(item)
            db.commit()
            
        return {"count": len(expired), "synced_new": synced_count, "message": f"Synced {len(expired)} expired items to shopping list."}
    finally:
        db.close()

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
        {"market": 'Koyambedu', "item": 'Tomato', "price": '₹40/kg', "trend": 'up'},
        {"market": 'Koyambedu', "item": 'Onion', "price": '₹35/kg', "trend": 'down'},
        {"market": 'Uzhavar Sandhai', "item": 'Brinjal', "price": '₹25/kg', "trend": 'stable'},
        {"market": 'Uzhavar Sandhai', "item": 'Ladies Finger', "price": '₹30/kg', "trend": 'up'}
    ]

@app.get("/community")
def get_community_board():
    db = SessionLocal()
    try:
        items = db.query(CommunityItem).order_by(CommunityItem.created_at.desc()).all()
        result = []
        for item in items:
            result.append({
                "id": item.id,
                "name": item.name,
                "donor_id": item.donor_id,
                "expiry_at": item.expiry_at.isoformat() if item.expiry_at else (datetime.now() + timedelta(days=2)).isoformat(),
                "location": item.location or "Chennai",
                "created_at": item.created_at.isoformat() if item.created_at else datetime.now().isoformat()
            })
        if not result:
            # Provide initial baseline records
            return [
                {"id": 'comm-1', "name": 'Tomatoes (5 nos)', "donor_id": 'Node-44', "expiry_at": (datetime.now() + timedelta(days=2)).isoformat(), "location": 'T. Nagar, Chennai'},
                {"id": 'comm-2', "name": 'Drumsticks', "donor_id": 'Node-12', "expiry_at": (datetime.now() + timedelta(days=3)).isoformat(), "location": 'Adyar, Chennai'}
            ]
        return result
    finally:
        db.close()

@app.post("/community/share")
def share_to_community(data: CommunityShareRequest):
    db = SessionLocal()
    try:
        comm_id = f"comm-user-{int(datetime.now().timestamp())}"
        expiry = datetime.fromisoformat(data.expiry_at) if data.expiry_at else datetime.now() + timedelta(days=2)
        new_comm = CommunityItem(
            id=comm_id,
            name=data.name,
            donor_id="You",
            expiry_at=expiry,
            location=data.location
        )
        db.add(new_comm)
        db.commit()
        return {"status": "shared", "id": comm_id, "name": data.name, "donor_id": "You", "location": data.location}
    finally:
        db.close()

@app.get("/community/health")
def get_community_health():
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

@app.get("/weather")
def get_weather():
    return {
        "location": "Chennai",
        "humidity": 92,
        "alert": "High Humidity Alert: Coastal moisture levels are peaking. Fungal risk increased for street-vendor greens.",
        "recommendation": "Move all leafy greens to the 'Back' zone for maximum airflow."
    }

@app.get("/alerts/misplaced")
def get_misplaced_items():
    from backend.core.item_tracker import detect_misplaced_items
    items = get_all_items()
    detections = [{"name": i.name, "zone": i.zone} for i in items]
    return detect_misplaced_items(detections)

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

