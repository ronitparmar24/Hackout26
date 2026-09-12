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
    
    # Preprocessor
    categorical_features = ["tier", "region", "transport_mode", "material_type"]
    numeric_features = ["material_qty"]
    
    def get_preprocessor():
        return ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), numeric_features),
                ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
            ]
        )
    
    # Train Energy Model on valid energy rows
    df_energy = df.dropna(subset=["energy_kwh"]).copy()
    Xe = df_energy[features]
    ye = df_energy["energy_kwh"]
    
    energy_model = Pipeline([
        ("preprocessor", get_preprocessor()),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    if len(df_energy) > 5:
        Xe_train, Xe_test, ye_train, ye_test = train_test_split(Xe, ye, test_size=0.2, random_state=42)
        energy_model.fit(Xe_train, ye_train)
        mae_energy = mean_absolute_error(ye_test, energy_model.predict(Xe_test))
    else:
        energy_model.fit(Xe, ye)
        mae_energy = 0.0

    # Train Transport Model on valid transport rows
    df_trans = df.dropna(subset=["transport_km"]).copy()
    Xt = df_trans[features]
    yt = df_trans["transport_km"]
    
    transport_model = Pipeline([
        ("preprocessor", get_preprocessor()),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    if len(df_trans) > 5:
        Xt_train, Xt_test, yt_train, yt_test = train_test_split(Xt, yt, test_size=0.2, random_state=42)
        transport_model.fit(Xt_train, yt_train)
        mae_transport = mean_absolute_error(yt_test, transport_model.predict(Xt_test))
    else:
        transport_model.fit(Xt, yt)
        mae_transport = 0.0
    
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

