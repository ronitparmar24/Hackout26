import pandas as pd
from sklearn.ensemble import IsolationForest

def detect_anomalies(suppliers: list[dict]) -> list[bool]:
    """
    Detect anomalies across the current batch of suppliers using Isolation Forest.
    Returns a list of booleans indicating if each supplier is an anomaly.
    """
    if len(suppliers) < 5:
        # Not enough data to reliably find anomalies
        return [False] * len(suppliers)
        
    df = pd.DataFrame(suppliers)
    features = df[["energy_emissions", "transport_emissions", "material_emissions", "total_emissions"]].copy()
    features = features.fillna(0)
    
    # 5% contamination rate for anomalies
    clf = IsolationForest(contamination=0.05, random_state=42)
    preds = clf.fit_predict(features)
    
    # IF returns -1 for anomaly, 1 for normal
    return [bool(p == -1) for p in preds]
