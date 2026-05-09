import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os
from pathlib import Path

def generate_synthetic_data():
    np.random.seed(42)
    n_samples = 2000
    
    districts = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh']
    district_weights = [0.2, 0.18, 0.15, 0.12, 0.13, 0.12, 0.1, 0.1]
    
    months = np.random.randint(1, 13, n_samples)
    
    monsoon_months = [6, 7, 8, 9]
    is_monsoon = np.isin(months, monsoon_months).astype(int)
    
    rainfall = np.where(
        is_monsoon == 1,
        np.random.uniform(50, 250, n_samples),
        np.random.uniform(5, 80, n_samples)
    )
    
    humidity = np.random.uniform(40, 98, n_samples)
    wind_speed = np.random.uniform(5, 80, n_samples)
    temperature = np.random.uniform(15, 40, n_samples)
    water_level = np.where(
        is_monsoon == 1,
        np.random.uniform(3, 12, n_samples),
        np.random.uniform(1, 6, n_samples)
    )
    
    risk_labels = []
    for i in range(n_samples):
        score = 0
        if rainfall[i] > 150: score += 0.35
        elif rainfall[i] > 80: score += 0.15
        
        if water_level[i] > 9: score += 0.30
        elif water_level[i] > 6: score += 0.15
        
        if wind_speed[i] > 50: score += 0.20
        elif wind_speed[i] > 25: score += 0.10
        
        if is_monsoon[i]: score += 0.15
        
        if score > 0.7: risk_labels.append('High')
        elif score > 0.35: risk_labels.append('Medium')
        else: risk_labels.append('Low')
    
    data = pd.DataFrame({
        'district': np.random.choice(districts, n_samples, p=district_weights),
        'rainfall_mm': rainfall,
        'humidity_pct': humidity,
        'wind_speed_kmh': wind_speed,
        'temperature_c': temperature,
        'water_level_m': water_level,
        'month': months,
        'risk_category': risk_labels
    })
    
    return data

def train_model():
    print("Generating synthetic data...")
    data = generate_synthetic_data()
    
    print(f"Dataset shape: {data.shape}")
    print(f"Risk distribution:\n{data['risk_category'].value_counts()}")
    
    district_encoding = {d: i for i, d in enumerate(data['district'].unique())}
    data['district_encoded'] = data['district'].map(district_encoding)
    
    features = ['rainfall_mm', 'humidity_pct', 'wind_speed_kmh', 'temperature_c', 'water_level_m', 'month']
    X = data[features]
    y = data['risk_category']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("\nTraining RandomForest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy: {accuracy:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    feature_importance = pd.DataFrame({
        'feature': features,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    print("\nFeature Importance:")
    print(feature_importance)
    
    model_dir = Path(__file__).parent / "model"
    model_dir.mkdir(parents=True, exist_ok=True)
    
    model_path = model_dir / "model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"\nModel saved to {model_path}")
    
    return model

if __name__ == "__main__":
    train_model()
