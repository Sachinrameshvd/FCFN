import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

ETHYLENE_EMITTERS = {
    'Banana': 9.5,
    'Apple': 8.0,
    'Mango': 8.5,
    'Papaya': 7.5
}

ETHYLENE_SENSITIVE = {
    'Spinach': 9.5,
    'Coriander': 9.0,
    'Brinjal': 8.0,
    'Ladies Finger': 7.5,
    'Tomato': 7.0,
    'Milk Packet': 1.0
}

def generate_ethylene_training_data(n_samples=500):
    np.random.seed(42)
    records = []
    
    for _ in range(n_samples):
        emitter_score = np.random.choice([0.0, 4.0, 7.5, 9.5])
        sensitive_score = np.random.choice([1.0, 7.0, 8.0, 9.5])
        distance_cm = np.random.uniform(5, 50)
        humidity = np.random.uniform(70, 95)
        
        # Physical law: decay penalty is proportional to emitter * sensitive / max(distance, 1)^1.5
        penalty = (emitter_score * sensitive_score * (humidity / 80.0)) / (distance_cm ** 1.2)
        noise = np.random.normal(0, 0.1)
        decay_penalty_days = max(0.0, penalty + noise)
        
        records.append({
            'emitter_score': emitter_score,
            'sensitive_score': sensitive_score,
            'distance_cm': distance_cm,
            'humidity': humidity,
            'decay_penalty_days': decay_penalty_days
        })
        
    return pd.DataFrame(records)

def train_ethylene_model(save_path="ethylene_degradation_model.joblib"):
    print("🌿 Training Tier 6: Ethylene Cross-Produce Degradation Model (Random Forest)...")
    data = generate_ethylene_training_data(1000)
    
    X = data[['emitter_score', 'sensitive_score', 'distance_cm', 'humidity']]
    y = data['decay_penalty_days']
    
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    score = model.score(X, y)
    print(f"✅ Ethylene Proximity Degradation Model Trained (R² Score: {score:.4f})")
    
    joblib.dump(model, save_path)
    print(f"💾 Saved trained model to '{save_path}'")
    return model

if __name__ == "__main__":
    train_ethylene_model()
