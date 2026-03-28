import os
import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.database import Base, Item, Fridge, DB_PATH, calculate_expiry

# Predefined distributions for realistic mock data
CATEGORIES = {
    'Vegetable': ['Tomato', 'Carrot', 'Brinjal', 'Ladies Finger', 'Onion', 'Potato'],
    'Fruit': ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes'],
    'Dairy': ['Milk Packet', 'Curd', 'Paneer', 'Cheese', 'Butter'],
    'Greens': ['Spinach', 'Coriander', 'Mint', 'Curry Leaves']
}

ZONES = ['front', 'middle', 'back']
VENDORS = ['street', 'supermarket']

# Probabilities for a typical Indian household fridge
ZONE_PROBS = [0.2, 0.5, 0.3]  # Less stuff in front door, most in middle
VENDOR_PROBS = [0.6, 0.4]     # Slight bias to street vendors for fresh produce

def get_random_item():
    category = random.choice(list(CATEGORIES.keys()))
    
    # E.g., Dairy is rarely bought from a 'street' vendor in this context
    if category == 'Dairy':
        vendor = 'supermarket'
    else:
        vendor = random.choices(VENDORS, weights=VENDOR_PROBS, k=1)[0]
        
    name = random.choice(CATEGORIES[category])
    zone = random.choices(ZONES, weights=ZONE_PROBS, k=1)[0]
    
    return name, category, vendor, zone

def populate_database(num_items=500):
    print(f"🚀 Populating Fridge Database with {num_items} realistic items...")
    
    # 1. Setup connection
    engine = create_engine(f"sqlite:///{DB_PATH}")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    # 2. Clear existing items to start fresh
    print("🧹 Clearing old database records...")
    db.query(Item).delete()
    db.commit()
    
    # 3. Ensure a fridge exists
    if db.query(Fridge).count() == 0:
        db.add(Fridge(location="Chennai", humidity_baseline=85.0))
        db.commit()
    
    # 4. Generate items
    items_to_add = []
    
    # Generate past timestamps to simulate "historical" data
    now = datetime.now()
    
    print("⏳ Generating complex distributions...")
    
    for _ in range(num_items):
        name, category, vendor, zone = get_random_item()
        
        # Calculate theoretical expiry based on rules
        base_days = calculate_expiry(name, category, zone, vendor)
        
        # Introduce a little random noise to make the ML model work for its learning
        # (e.g., sometimes a tomato spoils 1 day early or late despite the rules)
        noise = random.choice([-1, 0, 1])
        actual_days_to_expiry = max(1, base_days + noise)
        
        # Simulate that this item was added between 1 and 14 days ago
        days_ago = random.randint(1, 14)
        added_at = now - timedelta(days=days_ago)
        
        # Calculate expiry date
        expiry_at = added_at + timedelta(days=actual_days_to_expiry)
        
        # Determine current status
        if now > expiry_at:
            status = 'expired'
        elif (expiry_at - now).days <= 1:
            status = 'expiring soon'
        else:
            status = 'fresh'
            
        item = Item(
            name=name,
            category=category,
            vendor_type=vendor,
            added_at=added_at,
            expiry_at=expiry_at,
            zone=zone,
            status=status
        )
        items_to_add.append(item)
    
    # Bulk insert for speed
    db.bulk_save_objects(items_to_add)
    db.commit()
    
    # Stats
    total = db.query(Item).count()
    expired = db.query(Item).filter(Item.status == 'expired').count()
    fresh = db.query(Item).filter(Item.status == 'fresh').count()
    
    db.close()
    
    print("\n✅ Database Population Complete!")
    print(f"📊 Total items in DB: {total}")
    print(f"🥦 Fresh: {fresh} | ⚠️ Expiring Soon: {total - fresh - expired} | ❌ Expired: {expired}")
    print("\nYou can now run the Federated Learning simulation again to observe the model successfully training and reducing loss!")

if __name__ == "__main__":
    import sys
    if not os.path.exists("backend"):
        print("Please run this script from the project root directory.")
        sys.exit(1)
        
    populate_database(500)
