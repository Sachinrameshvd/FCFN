import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timedelta
from backend.core.predictor import calculate_expiry

Base = declarative_base()

class Fridge(Base):
    __tablename__ = 'fridges'
    id = Column(Integer, primary_key=True)
    location = Column(String)  # e.g., 'Chennai', 'Madurai'
    humidity_baseline = Column(Float)

class Item(Base):
    __tablename__ = 'items'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    category = Column(String)
    vendor_type = Column(String, default='street')  # 'street' or 'supermarket'
    added_at = Column(DateTime, default=datetime.now)
    expiry_at = Column(DateTime)
    zone = Column(String, default='middle')  # front, middle, back
    status = Column(String, default='fresh')

class History(Base):
    __tablename__ = 'history'
    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(Integer, ForeignKey('items.id'))
    action = Column(String)
    timestamp = Column(DateTime, default=datetime.now)

class FederatedNode(Base):
    __tablename__ = 'federated_nodes'
    id = Column(String, primary_key=True)
    location = Column(String)
    last_sync = Column(DateTime, default=datetime.now)
    contribution_count = Column(Integer, default=0)

class ShoppingItem(Base):
    __tablename__ = 'shopping_list'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String)
    priority = Column(String, default='medium')
    added_at = Column(DateTime, default=datetime.now)

class CommunityItem(Base):
    __tablename__ = 'community_board'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    donor_id = Column(String, default='You')
    expiry_at = Column(DateTime)
    location = Column(String)
    created_at = Column(DateTime, default=datetime.now)

class SensorLog(Base):
    __tablename__ = 'sensor_logs'
    id = Column(Integer, primary_key=True)
    fridge_id = Column(Integer, ForeignKey('fridges.id'))
    temperature = Column(Float)
    humidity = Column(Float)
    timestamp = Column(DateTime, default=datetime.now)

class SnapshotHistory(Base):
    __tablename__ = 'snapshot_history'
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.now)
    item_count = Column(Integer)
    detected_items = Column(String)  # JSON string of item names and zones

class CausalPrediction(Base):
    __tablename__ = 'causal_predictions'
    id = Column(Integer, primary_key=True)
    item_name = Column(String)
    intervention = Column(String)  # e.g., 'move to back'
    estimated_lift = Column(Float)
    timestamp = Column(DateTime, default=datetime.now)

# Create explicit database indices
Index('idx_items_expiry', Item.expiry_at, Item.status)
Index('idx_items_zone', Item.zone)
Index('idx_history_timestamp', History.timestamp)

# Database Setup
DB_PATH = "data/fridge.db"
os.makedirs("data", exist_ok=True)
engine = create_engine(f"sqlite:///{DB_PATH}")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(Fridge).count() == 0:
        chennai = Fridge(location="Chennai", humidity_baseline=85.0)
        db.add(chennai)
        db.commit()
    
    # Ensure default federated nodes exist if table is empty
    if db.query(FederatedNode).count() == 0:
        now_dt = datetime.now()
        nodes = [
            FederatedNode(id="node_chennai", location="Chennai", last_sync=now_dt, contribution_count=142),
            FederatedNode(id="node_trichy", location="Trichy", last_sync=now_dt, contribution_count=89),
            FederatedNode(id="node_madurai", location="Madurai", last_sync=now_dt, contribution_count=115),
            FederatedNode(id="node_coimbatore", location="Coimbatore", last_sync=now_dt, contribution_count=97),
            FederatedNode(id="node_lalgudi", location="Lalgudi", last_sync=now_dt, contribution_count=64),
        ]
        db.bulk_save_objects(nodes)
        db.commit()
        
    db.close()

def add_item(name, category, vendor, zone, days_to_expiry=None):
    db = SessionLocal()
    
    if days_to_expiry is None:
        days_to_expiry = calculate_expiry(name, category, zone, vendor)
    
    expiry = datetime.now() + timedelta(days=days_to_expiry)
    
    status = "fresh"
    if days_to_expiry <= 1:
        status = "expiring soon"
    elif days_to_expiry <= 0:
        status = "expired"

    item = Item(name=name, category=category, vendor_type=vendor, zone=zone, expiry_at=expiry, status=status)
    db.add(item)
    db.commit()
    db.refresh(item)
    
    # Add history record
    hist = History(item_id=item.id, action="ADDED")
    db.add(hist)
    db.commit()
    
    db.close()
    return item

def update_item_status(item_id):
    db = SessionLocal()
    item = db.query(Item).filter(Item.id == item_id).first()
    if item:
        days = calculate_expiry(item.name, item.category, item.zone, item.vendor_type)
        if days <= 1:
            item.status = "expiring soon"
        elif days <= 0:
            item.status = "expired"
        else:
            item.status = "fresh"
            
        db.commit()
    db.close()

def get_all_items():
    db = SessionLocal()
    items = db.query(Item).all()
    db.close()
    return items

def add_snapshot(detections):
    import json
    db = SessionLocal()
    snapshot = SnapshotHistory(
        item_count=len(detections),
        detected_items=json.dumps(detections)
    )
    db.add(snapshot)
    db.commit()
    db.close()
    return snapshot

