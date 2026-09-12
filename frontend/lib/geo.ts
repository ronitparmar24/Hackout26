import { Supplier } from "@/lib/api";

const CITY_KEYWORD_COORDS: Record<string, [number, number]> = {
  london: [51.5074, -0.1278],
  birmingham: [52.4862, -1.8904],
  manchester: [53.4808, -2.2426],
  bristol: [51.4545, -2.5879],
  leeds: [53.8008, -1.5491],
  sheffield: [53.3811, -1.4701],
  oxford: [51.7520, -1.2577],
  cambridge: [52.2053, 0.1218],
  newcastle: [54.9783, -1.6178],
  glasgow: [55.8642, -4.2518],
  mumbai: [19.0760, 72.8777],
  delhi: [28.6139, 77.2090],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.3850, 78.4867],
  jamshedpur: [22.8046, 86.2029],
  surat: [21.1702, 72.8311],
  tata: [22.8046, 86.2029],
};

const REGIONAL_HUBS: Record<string, [number, number][]> = {
  UK: [
    [51.5074, -0.1278], // London
    [52.4862, -1.8904], // Birmingham
    [53.4808, -2.2426], // Manchester
    [51.4545, -2.5879], // Bristol
    [53.8008, -1.5491], // Leeds
    [53.3811, -1.4701], // Sheffield
    [51.7520, -1.2577], // Oxford
    [52.2053, 0.1218],  // Cambridge
  ],
  India: [
    [19.0760, 72.8777], // Mumbai
    [28.6139, 77.2090], // Delhi
    [12.9716, 77.5946], // Bengaluru
    [13.0827, 80.2707], // Chennai
    [18.5204, 73.8567], // Pune
    [23.0225, 72.5714], // Ahmedabad
    [22.5726, 88.3639], // Kolkata
    [17.3850, 78.4867], // Hyderabad
    [22.8046, 86.2029], // Jamshedpur
  ],
  Global: [
    [50.1109, 8.6821],   // Frankfurt
    [51.9244, 4.4777],   // Rotterdam
    [41.8781, -87.6298], // Chicago
    [31.2304, 121.4737], // Shanghai
    [1.3521, 103.8198],  // Singapore
    [25.2048, 55.2708],  // Dubai
  ],
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getSupplierCoordinates(supplier: Supplier): [number, number] {
  // Check if coordinates exist on object
  const rawAny = supplier as unknown as Record<string, unknown>;
  if (typeof rawAny.latitude === "number" && typeof rawAny.longitude === "number") {
    return [rawAny.latitude, rawAny.longitude];
  }
  if (typeof rawAny.lat === "number" && typeof rawAny.lng === "number") {
    return [rawAny.lat, rawAny.lng];
  }

  const nameLower = (supplier.supplier_name || "").toLowerCase();

  // 1. Match city name in supplier_name
  for (const [keyword, coords] of Object.entries(CITY_KEYWORD_COORDS)) {
    if (nameLower.includes(keyword)) {
      const hash = simpleHash(supplier.id || supplier.supplier_name);
      const jitterLat = ((hash % 100) - 50) * 0.0012;
      const jitterLng = (((hash >> 2) % 100) - 50) * 0.0012;
      return [coords[0] + jitterLat, coords[1] + jitterLng];
    }
  }

  // 2. Match region
  const region = (supplier.region || "Global").trim();
  const hubs = REGIONAL_HUBS[region] || REGIONAL_HUBS.Global;
  const hash = simpleHash(supplier.id || supplier.supplier_name || "supplier");
  const baseCoords = hubs[hash % hubs.length];

  // Apply deterministic dispersion so points around the hub cluster nicely
  const offsetLat = ((hash % 80) - 40) * 0.0035;
  const offsetLng = (((hash >> 3) % 80) - 40) * 0.0035;

  return [
    Number((baseCoords[0] + offsetLat).toFixed(5)),
    Number((baseCoords[1] + offsetLng).toFixed(5)),
  ];
}
