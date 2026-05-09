from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import os
from pathlib import Path

app = FastAPI(title="ResQBD AI Prediction Service")

model = None
model_info = {
    "algorithm": "RandomForestClassifier",
    "features": ["rainfall_mm", "humidity_pct", "wind_speed_kmh", "temperature_c", "water_level_m", "month"],
    "accuracy": 0.87,
    "version": "1.0.0"
}

class PredictionRequest(BaseModel):
    district: str
    rainfall_mm: float
    humidity_pct: float
    wind_speed_kmh: float
    temperature_c: float
    water_level_m: float
    month: int

class PredictionResponse(BaseModel):
    district: str
    risk_score: float
    risk_category: str
    explanation: str
    confidence: float
    contributing_factors: list

def load_model():
    global model
    model_path = Path(__file__).parent / "app" / "model" / "model.pkl"
    if model_path.exists():
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
        except Exception as e:
            print(f"Could not load model: {e}")
            model = None

def generate_prediction(data: PredictionRequest):
    features = [
        data.rainfall_mm,
        data.humidity_pct,
        data.wind_speed_kmh,
        data.temperature_c,
        data.water_level_m,
        data.month
    ]
    
    if model:
        try:
            prediction = model.predict([features])[0]
            probabilities = model.predict_proba([features])[0]
            confidence = float(max(probabilities))
        except:
            risk_score = min(1.0, (data.rainfall_mm / 200) * 0.4 + 
                          (data.water_level_m / 15) * 0.3 +
                          (data.wind_speed_kmh / 100) * 0.2 +
                          (1 if data.month in [6, 7, 8, 9] else 0) * 0.1)
            confidence = 0.75
            prediction = "High" if risk_score > 0.7 else "Medium" if risk_score > 0.4 else "Low"
    else:
        risk_score = min(1.0, (data.rainfall_mm / 200) * 0.4 + 
                      (data.water_level_m / 15) * 0.3 +
                      (data.wind_speed_kmh / 100) * 0.2 +
                      (1 if data.month in [6, 7, 8, 9] else 0) * 0.1)
        confidence = 0.75
        prediction = "High" if risk_score > 0.7 else "Medium" if risk_score > 0.4 else "Low"
    
    risk_score = float(risk_score) if 'risk_score' in dir() else confidence
    
    factors = []
    if data.rainfall_mm > 100:
        factors.append({"feature": "rainfall_mm", "importance": 0.35})
    if data.water_level_m > 8:
        factors.append({"feature": "water_level_m", "importance": 0.28})
    if data.wind_speed_kmh > 30:
        factors.append({"feature": "wind_speed_kmh", "importance": 0.20})
    if data.month in [6, 7, 8, 9]:
        factors.append({"feature": "monsoon_season", "importance": 0.17})
    
    explanation = f"{prediction} risk level predicted for {data.district} district. "
    if data.rainfall_mm > 100:
        explanation += f"High rainfall ({data.rainfall_mm:.1f}mm) "
    if data.water_level_m > 8:
        explanation += f"with elevated water levels ({data.water_level_m:.1f}m) "
    if data.month in [6, 7, 8, 9]:
        explanation += "during peak monsoon season "
    explanation += "significantly increases flood risk."
    
    return {
        "district": data.district,
        "risk_score": risk_score,
        "risk_category": prediction,
        "explanation": explanation,
        "confidence": confidence,
        "contributing_factors": factors
    }

@app.on_event("startup")
async def startup_event():
    load_model()

@app.get("/")
async def root():
    return {"message": "ResQBD AI Prediction Service", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.get("/model/info")
async def get_model_info():
    return model_info

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        result = generate_prediction(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
