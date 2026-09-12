"""
Climatiq API Client for GHG Protocol-Compliant Scope 3 Emission Factor Calculations.

Integrates Climatiq's scientifically vetted emission factors database (DEFRA, EPA, IEA, GLEC)
with graceful fallback to verified local conversion tables so pipelines never fail on rate limits.
"""

import os
import logging
import requests
from typing import Dict, Any, Tuple, Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

CLIMATIQ_API_KEY = os.getenv("CLIMATIQ_API_KEY", "")
CLIMATIQ_BASE_URL = "https://api.climatiq.io"
DATA_VERSION = "^37"

# Default fallback factors (DEFRA 2026 / CEA baseline in kg CO2e)
FALLBACK_ENERGY = {
    "UK": 0.13096,     # UK Govt DESNZ 2026
    "India": 0.71,     # India CEA baseline
    "Global": 0.2330,  # Global average
}

FALLBACK_TRANSPORT = {
    # kg CO2e per tonne-km
    "Road": 0.10356,  # DEFRA 2026 HGV
    "Rail": 0.02583,  # DEFRA 2026 Rail Freight
    "Sea":  0.01205,  # DEFRA 2026 Cargo Ship
    "Air":  0.89939,  # DEFRA 2026 Air Freight
}

FALLBACK_MATERIALS = {
    # kg CO2e per tonne
    "Steel":       2861.58,   # UK DEFRA Metal: steel
    "Plastic":     3170.51,   # UK DEFRA Plastics: average
    "Aluminum":    9113.58,   # UK DEFRA Metal: aluminium
    "Textile":    22310.00,   # UK DEFRA Clothing / textiles
    "Electronics":24865.48,   # UK DEFRA Electrical items - IT
}

# Pre-mapped Climatiq Activity IDs for low latency & reliability
ACTIVITY_MAP = {
    "energy": {
        "UK": "electricity-supply_grid-source_supplier_mix",
        "GB": "electricity-supply_grid-source_supplier_mix",
        "India": "electricity-supply_grid-source_residual_mix",
        "IN": "electricity-supply_grid-source_residual_mix",
        "Global": "electricity-supply_grid-source_supplier_mix",
    },
    "freight": {
        "Road": "freight_vehicle-vehicle_type_commercial_truck-fuel_source_na-vehicle_weight_na-percentage_load_na",
        "Rail": "freight_train-route_type_na-fuel_type_na-load_type_cargo",
        "Sea":  "sea_freight-vessel_type_container-route_type_na-vessel_length_na-tonnage_na-fuel_source_na",
        "Air":  "freight_flight-route_type_na-distance_lte_1500km-weight_na-rf_excluded-aircraft_type_belly_freight-distance_basis_gcd",
    },
    "material": {
        "Steel": "metals-type_steel_engineering_steel",
        "Plastic": "waste-type_packaging_other_plastics_and_complex_plastics-disposal_method_landfill",
        "Aluminum": "metals-type_aluminum_slugs_cast_aluminium",
        "Textile": "textiles-type_textiles",
        "Electronics": "electronics-type_electronic_computer",
    }
}

# In-memory factor and estimate cache
_CACHE: Dict[str, Any] = {}


class EmissionResult(float):
    """
    Float representing tCO2e with rich metadata for auditing.
    Compatible with standard math and comparisons while preserving data provenance.
    """
    def __new__(cls, tco2e: float, kg_co2e: Optional[float] = None, source: str = "Climatiq / DEFRA 2024", factor_id: str = ""):
        obj = super().__new__(cls, float(tco2e))
        obj.tco2e = float(tco2e)
        obj.kg_co2e = kg_co2e if kg_co2e is not None else float(tco2e) * 1000.0
        obj.source = source
        obj.factor_id = factor_id
        return obj

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tco2e": self.tco2e,
            "kg_co2e": self.kg_co2e,
            "source": self.source,
            "factor_id": self.factor_id,
        }

    def __getitem__(self, item):
        if item == "tco2e":
            return self.tco2e
        if item in ("kg_co2e", "co2e_kg"):
            return self.kg_co2e
        if item == "source":
            return self.source
        if item == "factor_id":
            return self.factor_id
        raise KeyError(item)


def _get_headers() -> Dict[str, str]:
    api_key = os.getenv("CLIMATIQ_API_KEY", CLIMATIQ_API_KEY)
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }


def _call_estimate(activity_id: str, parameters: Dict[str, Any], timeout: float = 6.0) -> Optional[Dict[str, Any]]:
    """Calls Climatiq Core /estimate endpoint with timeout and error handling."""
    api_key = os.getenv("CLIMATIQ_API_KEY", CLIMATIQ_API_KEY)
    if not api_key:
        return None

    payload = {
        "emission_factor": {
            "activity_id": activity_id,
            "data_version": DATA_VERSION
        },
        "parameters": parameters
    }

    try:
        resp = requests.post(
            f"{CLIMATIQ_BASE_URL}/estimate",
            headers=_get_headers(),
            json=payload,
            timeout=timeout
        )
        if resp.status_code == 200:
            return resp.json()
        logger.warning(f"Climatiq estimate returned status {resp.status_code}: {resp.text[:150]}")
    except Exception as e:
        logger.warning(f"Climatiq estimate request failed: {e}")
    return None


def get_energy_emissions(kwh: float, region: str = "India") -> EmissionResult:
    """
    Calculates electricity emissions using Climatiq API.
    Returns EmissionResult (tCO2e) with audit source metadata.
    """
    if kwh is None or kwh <= 0:
        return EmissionResult(0.0, 0.0, "Climatiq / DEFRA 2024", "electricity-zero")

    cache_key = f"energy_{region}_{round(kwh, 2)}"
    if cache_key in _CACHE:
        return _CACHE[cache_key]

    # Map region code
    reg_clean = region.strip() if region else "India"
    activity_id = ACTIVITY_MAP["energy"].get(reg_clean, ACTIVITY_MAP["energy"]["Global"])

    # 1. Attempt Climatiq Core Estimate
    data = _call_estimate(activity_id, {"energy": float(kwh), "energy_unit": "kWh"})
    if data and "co2e" in data:
        unit = data.get("co2e_unit", "kg").lower()
        raw_val = float(data["co2e"])
        kg_val = raw_val if unit == "kg" else raw_val * 1000.0 if unit == "t" else raw_val / 1000.0
        tco2e = kg_val / 1000.0
        source_name = data.get("emission_factor", {}).get("source", "DEFRA")
        year = data.get("emission_factor", {}).get("year", "2024")
        res = EmissionResult(tco2e, kg_val, f"Climatiq / {source_name} {year}", activity_id)
        _CACHE[cache_key] = res
        return res

    # 2. Graceful fallback: local verified table
    fallback_rate = FALLBACK_ENERGY.get(reg_clean, FALLBACK_ENERGY["India"])
    kg_val = float(kwh) * fallback_rate
    tco2e = kg_val / 1000.0
    res = EmissionResult(tco2e, kg_val, "DEFRA 2024 (Local Fallback)", "defra-energy-2024")
    _CACHE[cache_key] = res
    return res


def get_freight_emissions(
    weight_kg: float,
    distance_km: float,
    transport_mode: str,
    origin: Optional[str] = None,
    destination: Optional[str] = None
) -> EmissionResult:
    """
    Calculates freight transit emissions (road, rail, sea, air) using Climatiq Freight factors.
    Returns EmissionResult (tCO2e) with audit source metadata.
    """
    if weight_kg is None or weight_kg <= 0 or distance_km is None or distance_km <= 0:
        return EmissionResult(0.0, 0.0, "Climatiq / DEFRA 2024", "freight-zero")

    mode_clean = transport_mode.capitalize() if transport_mode else "Road"
    cache_key = f"freight_{mode_clean}_{round(weight_kg, 1)}_{round(distance_km, 1)}"
    if cache_key in _CACHE:
        return _CACHE[cache_key]

    activity_id = ACTIVITY_MAP["freight"].get(mode_clean, ACTIVITY_MAP["freight"]["Road"])
    weight_t = float(weight_kg) / 1000.0

    # 1. Attempt Climatiq Core Estimate
    data = _call_estimate(
        activity_id,
        {
            "weight": weight_t,
            "weight_unit": "t",
            "distance": float(distance_km),
            "distance_unit": "km"
        }
    )
    if data and "co2e" in data:
        unit = data.get("co2e_unit", "kg").lower()
        raw_val = float(data["co2e"])
        kg_val = raw_val if unit == "kg" else raw_val * 1000.0 if unit == "t" else raw_val / 1000.0
        tco2e = kg_val / 1000.0
        source_name = data.get("emission_factor", {}).get("source", "DEFRA")
        year = data.get("emission_factor", {}).get("year", "2024")
        res = EmissionResult(tco2e, kg_val, f"Climatiq / {source_name} {year}", activity_id)
        _CACHE[cache_key] = res
        return res

    # 2. Graceful fallback: local verified freight table
    rate_per_tkm = FALLBACK_TRANSPORT.get(mode_clean, FALLBACK_TRANSPORT["Road"])
    kg_val = weight_t * float(distance_km) * rate_per_tkm
    tco2e = kg_val / 1000.0
    res = EmissionResult(tco2e, kg_val, "DEFRA 2024 (Local Fallback)", "defra-freight-2024")
    _CACHE[cache_key] = res
    return res


def get_material_emissions(material_type: str, quantity_kg: float) -> EmissionResult:
    """
    Finds the closest matching material emission factor via Climatiq Search / Catalog,
    then executes an Estimate calculation.
    Returns EmissionResult (tCO2e) with audit source metadata.
    """
    if quantity_kg is None or quantity_kg <= 0:
        return EmissionResult(0.0, 0.0, "Climatiq / DEFRA 2024", "material-zero")

    mat_clean = material_type.capitalize() if material_type else "Steel"
    cache_key = f"material_{mat_clean}_{round(quantity_kg, 1)}"
    if cache_key in _CACHE:
        return _CACHE[cache_key]

    activity_id = ACTIVITY_MAP["material"].get(mat_clean, ACTIVITY_MAP["material"]["Steel"])
    weight_t = float(quantity_kg) / 1000.0

    # 1. Attempt Climatiq Core Estimate
    data = _call_estimate(activity_id, {"weight": float(quantity_kg), "weight_unit": "kg"})
    if not data:
        # Try search endpoint if activity_id did not respond
        search_key = f"search_mat_{mat_clean}"
        if search_key not in _CACHE:
            try:
                s_resp = requests.get(
                    f"{CLIMATIQ_BASE_URL}/search",
                    headers=_get_headers(),
                    params={"query": mat_clean.lower(), "data_version": DATA_VERSION, "results_per_page": 1},
                    timeout=4.0
                )
                if s_resp.status_code == 200:
                    results = s_resp.json().get("results", [])
                    if results:
                        _CACHE[search_key] = results[0].get("activity_id")
            except Exception:
                pass
        dynamic_id = _CACHE.get(search_key)
        if dynamic_id:
            data = _call_estimate(dynamic_id, {"weight": float(quantity_kg), "weight_unit": "kg"})

    if data and "co2e" in data:
        unit = data.get("co2e_unit", "kg").lower()
        raw_val = float(data["co2e"])
        kg_val = raw_val if unit == "kg" else raw_val * 1000.0 if unit == "t" else raw_val / 1000.0
        tco2e = kg_val / 1000.0
        source_name = data.get("emission_factor", {}).get("source", "DEFRA")
        year = data.get("emission_factor", {}).get("year", "2024")
        res = EmissionResult(tco2e, kg_val, f"Climatiq / {source_name} {year}", activity_id)
        _CACHE[cache_key] = res
        return res

    # 2. Graceful fallback: local verified material table
    factor_per_tonne = FALLBACK_MATERIALS.get(mat_clean, FALLBACK_MATERIALS["Steel"])
    kg_val = weight_t * factor_per_tonne
    tco2e = kg_val / 1000.0
    res = EmissionResult(tco2e, kg_val, "DEFRA 2024 (Local Fallback)", "defra-material-2024")
    _CACHE[cache_key] = res
    return res


def calculate_climatiq_emissions(
    energy_kwh: float,
    transport_km: float,
    transport_mode: str,
    material_type: str,
    material_qty: float,
    region: str = "India"
) -> Tuple[float, float, float, float, str]:
    """
    High-level pipeline calculation function replacing hardcoded factors.
    material_qty is in tonnes (consistent with demo_suppliers.csv and emission_factors.py).

    Returns:
        (energy_kg, transport_kg, material_kg, total_kg, source_str)
    """
    # Convert material_qty (tonnes) to kg for material calculation & freight weight
    qty_tonnes = float(material_qty) if material_qty is not None else 0.0
    weight_kg = qty_tonnes * 1000.0

    # 1. Energy
    energy_res = get_energy_emissions(energy_kwh, region=region)
    # 2. Freight
    freight_res = get_freight_emissions(weight_kg, transport_km, transport_mode)
    # 3. Material
    material_res = get_material_emissions(material_type, weight_kg)

    energy_kg = energy_res.kg_co2e
    transport_kg = freight_res.kg_co2e
    material_kg = material_res.kg_co2e
    total_kg = energy_kg + transport_kg + material_kg

    # Primary source tag for audit trail
    if "Climatiq" in energy_res.source or "Climatiq" in freight_res.source or "Climatiq" in material_res.source:
        primary_source = "Climatiq / DEFRA 2024"
    else:
        primary_source = "DEFRA 2024 (Local Fallback)"

    return energy_kg, transport_kg, material_kg, total_kg, primary_source
