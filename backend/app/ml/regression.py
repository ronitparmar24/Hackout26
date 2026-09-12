import os
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), "regression_model.joblib")

def train_models(csv_path: str):
    df = pd.read_csv(csv_path)
    
    # We want to predict energy_kwh and transport_km.
    # We will train two separate models inside a dictionary, or a MultiOutputRegressor.
    # Let's use two separate models for simplicity.
    
    features = ["tier", "region", "transport_mode", "material_type", "material_qty"]
    
    X = df[features]
    y_energy = df["energy_kwh"]
    y_transport = df["transport_km"]
    
    # Preprocessor
    categorical_features = ["tier", "region", "transport_mode", "material_type"]
    numeric_features = ["material_qty"]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
        ]
    )
    
    # Pipelines
    energy_model = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    transport_model = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    # Train-test split for evaluation
    X_train, X_test, ye_train, ye_test, yt_train, yt_test = train_test_split(
        X, y_energy, y_transport, test_size=0.2, random_state=42
    )
    
    energy_model.fit(X_train, ye_train)
    transport_model.fit(X_train, yt_train)
    
    # Evaluate
    ye_pred = energy_model.predict(X_test)
    yt_pred = transport_model.predict(X_test)
    
    mae_energy = mean_absolute_error(ye_test, ye_pred)
    mae_transport = mean_absolute_error(yt_test, yt_pred)
    
    # Save models
    models = {
        "energy": energy_model,
        "transport": transport_model
    }
    joblib.dump(models, MODEL_PATH)
    
    return mae_energy, mae_transport

_cached_models = None

DEFAULT_ENERGY = {
    "Tier 1": 500.0,
    "Tier 2": 1800.0,
    "Tier 3": 5000.0,
}

DEFAULT_TRANSPORT = {
    "Road": 250.0,
    "Rail": 650.0,
    "Sea": 1600.0,
    "Air": 2500.0,
}

def _load_models():
    global _cached_models
    if _cached_models is None and os.path.exists(MODEL_PATH):
        try:
            _cached_models = joblib.load(MODEL_PATH)
        except Exception:
            _cached_models = None
    return _cached_models

def predict_missing(row: dict):
    """
    Given a row dictionary, predict missing energy_kwh and transport_km.
    Uses trained Random Forest models when available, falling back to industry averages.
    """
    res = {}
    models = _load_models()
    
    if models:
        try:
            features = ["tier", "region", "transport_mode", "material_type", "material_qty"]
            df_row = pd.DataFrame([{k: row.get(k) for k in features}])
            if pd.isna(row.get("energy_kwh")):
                res["energy_kwh"] = float(models["energy"].predict(df_row)[0])
            if pd.isna(row.get("transport_km")):
                res["transport_km"] = float(models["transport"].predict(df_row)[0])
            return res
        except Exception:
            pass

    # Domain fallback if model is not available
    if pd.isna(row.get("energy_kwh")):
        res["energy_kwh"] = DEFAULT_ENERGY.get(row.get("tier"), 1500.0)
    if pd.isna(row.get("transport_km")):
        res["transport_km"] = DEFAULT_TRANSPORT.get(row.get("transport_mode"), 500.0)
        
    return res

