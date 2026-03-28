import os
import sys
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.database import DB_PATH, Item, Fridge
from backend.core.causal_twin import run_causal_analysis

def get_historical_dataframe(item_category=None):
    """
    Connects to the fridge.db and extracts past item data into a Pandas DataFrame 
    formatted exactly how the DoWhy Causal Engine expects it.
    """
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found. Did you run populate_db.py first?")
        sys.exit(1)
        
    engine = create_engine(f"sqlite:///{DB_PATH}")
    Session = sessionmaker(bind=engine)
    db = Session()
    
    # We need: zone, humidity, vendor, shelf_life
    # First, get the fridge humidity baseline (assuming 1 fridge for now)
    fridge = db.query(Fridge).first()
    humidity = fridge.humidity_baseline if fridge else 85.0
    
    # Query items. If a category is given, filter. Otherwise get all.
    query = db.query(Item)
    if item_category:
        query = query.filter(Item.category == item_category)
        
    items = query.all()
    
    if not items:
        print(f"No items found in database for category: {item_category}")
        db.close()
        return None
        
    # Build the dictionary for pandas
    data = {
        'zone': [],
        'humidity': [],
        'vendor': [],
        'shelf_life': []
    }
    
    for item in items:
        # Calculate how many days it lasted (or is predicted to last)
        days = (item.expiry_at - item.added_at).days
        
        data['zone'].append(item.zone)
        # Adding slight noise to humidity to represent sensor fluctuations over time
        import random
        data['humidity'].append(humidity + random.uniform(-5.0, 5.0))
        data['vendor'].append(item.vendor_type)
        data['shelf_life'].append(max(1, days))
        
    db.close()
    
    return pd.DataFrame(data)

def test_causal_engine():
    print("🧠 Starting Causal Inference Engine Test 🧠")
    print("--------------------------------------------------")
    print("We will test the causal effect of moving a Tomato from the 'front' zone to the 'back' zone.")
    
    # 1. Get real data from our database
    print("\n[1/3] Extracting historical observation data from fridge.db (Vegetables)...")
    historical_df = get_historical_dataframe(item_category='Vegetable')
    
    if historical_df is None or len(historical_df) < 10:
        print("Not enough data to run causal inference! Need more historical samples.")
        return
        
    print(f"✅ Successfully loaded {len(historical_df)} historical records.")
    print("Sample Data:")
    print(historical_df.head(3))
    
    # 2. Run the Causal Analysis
    print("\n[2/3] Building Causal Graph and applying DoWhy Matching...")
    print("Intervention: What happens to Shelf Life if Zone = 'back' vs 'front'?")
    
    # Currently, 'run_causal_analysis' inside causal_twin.py checks the *treatment* effect of moving to the target zone. 
    # By default, it encodes front=0, middle=1, back=2 and estimates linear effect of zone.
    # The return value is the average unit change in shelf life when zone index increases by 1.
    
    # We pass 'Tomato' just as a label, and 'back' as our target.
    effect = run_causal_analysis(item_name="Tomato", target_zone="back", historical_data=historical_df)
    
    # 3. Output results
    print(f"\n[3/3] 🎯 Causal Effect Estimated: {effect:.2f} days")
    
    # Since front=0 and back=2, the total effect of moving from front to back is effect * (2-0).
    total_lift = effect * 2
    
    print("--------------------------------------------------")
    print("💡 SUMMARY:")
    if total_lift > 0:
        print(f"Moving a Tomato from the FRONT door to the BACK of the fridge causes an estimated \033[92m+{total_lift:.2f} days\033[0m increase in shelf life.")
    else:
        print(f"Moving a Tomato to the back causes an estimated {total_lift:.2f} days change in shelf life.")
    print("This is calculated by analyzing the complex correlations in your fridge.db (filtering out vendor and humidity confounders).")
    print("--------------------------------------------------")

if __name__ == "__main__":
    import warnings
    # Suppress DoWhy/Pandas warnings for a cleaner output
    warnings.filterwarnings('ignore')
    
    test_causal_engine()
