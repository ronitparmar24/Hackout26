import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def cluster_suppliers(suppliers: list[dict]) -> list[int]:
    """
    Cluster the current batch of suppliers using KMeans.
    Returns a list of cluster labels (integers).
    """
    if len(suppliers) < 3:
        return [0] * len(suppliers)
        
    df = pd.DataFrame(suppliers)
    features = df[["energy_emissions", "transport_emissions", "material_emissions", "total_emissions"]].copy()
    features = features.fillna(0)
    
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)
    
    # Let's target 3 clusters: low, medium, high impact
    kmeans = KMeans(n_clusters=3, random_state=42, n_init="auto")
    labels = kmeans.fit_predict(scaled_features)
    
    return [int(l) for l in labels]
