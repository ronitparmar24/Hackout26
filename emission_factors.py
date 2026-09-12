"""
Emission factors used by the Carbon-Aware Supply Chain Dashboard.

Only the ~10 values actually needed for this project are hardcoded here —
extracted by hand from the official government sources, not the full
spreadsheets (which contain hundreds of rows for vehicle types, laden %,
fuel types etc. that we don't need for a hackathon MVP).

Sources:
- UK Govt GHG Conversion Factors 2026 (DESNZ/DEFRA):
  https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026
- EPA GHG Emission Factors Hub 2025:
  https://www.epa.gov/climateleadership/ghg-emission-factors-hub
"""

# --- Electricity ---
# kg CO2e per kWh
ENERGY_FACTORS = {
    "UK": 0.13096,   # UK Govt 2026, "UK electricity" sheet, "Electricity generated"
    "India": 0.71,   # India CEA baseline grid average (separate source, approximate)
}

# --- Transport ---
# kg CO2e per tonne-km, by mode
TRANSPORT_FACTORS = {
    "Road": 0.10356,  # UK Govt 2026, "Freighting goods", Average non-refrigerated HGVs
    "Rail": 0.02583,  # UK Govt 2026, "Freighting goods", Rail: Freight train
    "Sea":  0.01205,  # UK Govt 2026, "Freighting goods", Cargo ship: General cargo 10,000+ dwt
    "Air":  0.89939,  # UK Govt 2026, "Freighting goods", Freight flights: Long-haul to/from UK
}

# --- Materials ---
# kg CO2e per tonne, primary material production ("cradle-to-gate")
MATERIAL_FACTORS = {
    "Steel":       2861.58,   # UK Govt 2026, "Material use", Metal: steel cans
    "Plastic":     3170.51,   # UK Govt 2026, "Material use", Plastics: average plastics
    "Aluminum":    9113.58,   # UK Govt 2026, "Material use", Metal: aluminium cans and foil
    "Textile":    22310.00,   # UK Govt 2026, "Material use", Clothing
    "Electronics":24865.48,   # UK Govt 2026, "Material use", Electrical items - IT
}


def calculate_emissions(energy_kwh, transport_km, transport_mode,
                         material_type, material_qty, region="India"):
    """
    Returns (energy_emissions, transport_emissions, material_emissions, total)
    All values in kg CO2e.
    """
    energy_factor = ENERGY_FACTORS.get(region, ENERGY_FACTORS["India"])
    transport_factor = TRANSPORT_FACTORS.get(transport_mode, TRANSPORT_FACTORS["Road"])
    material_factor = MATERIAL_FACTORS.get(material_type, MATERIAL_FACTORS["Plastic"])

    energy_emissions = (energy_kwh or 0) * energy_factor
    # transport factor is per TONNE-km, so multiply by both distance and shipped weight
    transport_emissions = (transport_km or 0) * (material_qty or 0) * transport_factor
    material_emissions = (material_qty or 0) * material_factor

    total = energy_emissions + transport_emissions + material_emissions
    return energy_emissions, transport_emissions, material_emissions, total
