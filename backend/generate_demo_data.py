"""
Step 0: Generate demo_suppliers.csv and training_data.csv
"""
import numpy as np
import pandas as pd
from faker import Faker

fake = Faker()
Faker.seed(42)
np.random.seed(42)

TIERS = ["Tier 1", "Tier 2", "Tier 3"]
REGIONS = ["India", "UK"]
MODES = ["Road", "Rail", "Sea", "Air"]
MATERIALS = ["Steel", "Plastic", "Aluminum", "Textile", "Electronics"]

# --- Cluster profiles: (tier, region, material) -> (energy_mean, energy_std, km_mean, km_std, qty_mean, qty_std) ---
PROFILES = {
    # Low-impact cluster: Tier 1, UK, Steel/Plastic, low energy & short distance
    ("Tier 1", "UK", "Steel"):       (500,  100,  200,  50,  5,  2),
    ("Tier 1", "UK", "Plastic"):     (400,   80,  150,  40,  4,  1.5),
    # Medium-impact cluster: Tier 2, India, mixed materials
    ("Tier 2", "India", "Aluminum"): (2000, 400,  800, 200, 10,  3),
    ("Tier 2", "India", "Steel"):    (1800, 300,  600, 150,  8,  2),
    ("Tier 2", "India", "Plastic"):  (1500, 300,  500, 100,  7,  2),
    # High-impact cluster: Tier 3, India, heavy materials
    ("Tier 3", "India", "Textile"):      (5000, 800, 2000, 400, 20, 5),
    ("Tier 3", "India", "Electronics"):  (6000, 900, 2500, 500, 15, 4),
    ("Tier 3", "India", "Aluminum"):     (4500, 700, 1800, 300, 18, 5),
}

PROFILE_KEYS = list(PROFILES.keys())


def _gen_row(profile_key, mode=None):
    tier, region, material = profile_key
    e_m, e_s, k_m, k_s, q_m, q_s = PROFILES[profile_key]
    return {
        "supplier_name": fake.company(),
        "tier": tier,
        "region": region,
        "energy_kwh": round(max(10, np.random.normal(e_m, e_s)), 2),
        "transport_km": round(max(5, np.random.normal(k_m, k_s)), 2),
        "transport_mode": mode or np.random.choice(MODES),
        "material_type": material,
        "material_qty": round(max(0.5, np.random.normal(q_m, q_s)), 2),
    }


# ===================== DEMO SUPPLIERS (70 rows) =====================
rows = []
# ~22 rows per cluster group (low/med/high)
low_keys = PROFILE_KEYS[:2]
med_keys = PROFILE_KEYS[2:5]
high_keys = PROFILE_KEYS[5:]
for _ in range(22):
    rows.append(_gen_row(low_keys[np.random.randint(len(low_keys))]))
for _ in range(24):
    rows.append(_gen_row(med_keys[np.random.randint(len(med_keys))]))
for _ in range(21):
    rows.append(_gen_row(high_keys[np.random.randint(len(high_keys))]))


# Plant 3 anomaly rows (extreme values)
anomaly_indices = []
for i, anom in enumerate([
    {"supplier_name": "ANOMALY_MegaPolluter", "tier": "Tier 1", "region": "India",
     "energy_kwh": 50000, "transport_km": 15000, "transport_mode": "Air",
     "material_type": "Electronics", "material_qty": 100},
    {"supplier_name": "ANOMALY_GhostFactory", "tier": "Tier 2", "region": "UK",
     "energy_kwh": 99000, "transport_km": 200, "transport_mode": "Road",
     "material_type": "Steel", "material_qty": 0.01},
    {"supplier_name": "ANOMALY_SkyFreight", "tier": "Tier 3", "region": "India",
     "energy_kwh": 300, "transport_km": 50000, "transport_mode": "Air",
     "material_type": "Textile", "material_qty": 80},
]):
    rows.append(anom)
    anomaly_indices.append(len(rows) - 1)

df_demo = pd.DataFrame(rows)
np.random.shuffle(df_demo.values)  # shuffle row order

# Scatter ~15% missing in energy_kwh and transport_km
n = len(df_demo)
n_missing = int(n * 0.15)
miss_energy = np.random.choice(n, n_missing, replace=False)
miss_transport = np.random.choice(n, n_missing, replace=False)
# Don't blank anomaly rows
for idx in miss_energy:
    if df_demo.loc[idx, "supplier_name"] not in [r["supplier_name"] for r in rows[-3:]]:
        df_demo.loc[idx, "energy_kwh"] = np.nan
for idx in miss_transport:
    if df_demo.loc[idx, "supplier_name"] not in [r["supplier_name"] for r in rows[-3:]]:
        df_demo.loc[idx, "transport_km"] = np.nan

df_demo.to_csv("demo_suppliers.csv", index=False)

# ===================== TRAINING DATA (550 rows) =====================
train_rows = []
for _ in range(550):
    pk = PROFILE_KEYS[np.random.randint(len(PROFILE_KEYS))]
    train_rows.append(_gen_row(pk))

df_train = pd.DataFrame(train_rows)
# No missing values, no anomalies
df_train.to_csv("training_data.csv", index=False)

# ===================== SUMMARY =====================
energy_miss = df_demo["energy_kwh"].isna().sum()
transport_miss = df_demo["transport_km"].isna().sum()
total_cells = n * 2  # two columns that can be missing
pct_missing = (energy_miss + transport_miss) / total_cells * 100

anomaly_names = ["ANOMALY_MegaPolluter", "ANOMALY_GhostFactory", "ANOMALY_SkyFreight"]
anomalies_in_csv = df_demo[df_demo["supplier_name"].isin(anomaly_names)]

print("=" * 50)
print("DEMO SUPPLIERS CSV")
print(f"  Rows:              {len(df_demo)}")
print(f"  energy_kwh NaN:    {energy_miss}")
print(f"  transport_km NaN:  {transport_miss}")
print(f"  % missing (of energy+transport cells): {pct_missing:.1f}%")
print(f"  Anomaly rows:      {len(anomalies_in_csv)}")
for _, r in anomalies_in_csv.iterrows():
    print(f"    - {r['supplier_name']}: energy={r['energy_kwh']}, km={r['transport_km']}")
print()

# Cluster group sizes (approximate by tier)
print("  Cluster group sizes (by tier):")
print(df_demo["tier"].value_counts().to_string(header=False))
print()

print("TRAINING DATA CSV")
print(f"  Rows:              {len(df_train)}")
print(f"  Missing values:    {df_train.isna().sum().sum()}")
print(f"  Tier distribution:")
print(df_train["tier"].value_counts().to_string(header=False))
print("=" * 50)
