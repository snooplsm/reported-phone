export interface GeoSearchResponse {
  type: string; // "FeatureCollection"
  features: Feature[];
  bbox?: [number, number, number, number]; // Optional bounding box
}

export interface Feature {
  type: string; // "Feature"
  geometry: {
    type: string; // "Point"
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    address_low?: string; // House number
    street_full?: string;
    street_address: string; // Street name
    distance?: number; // Distance from query point
    accuracy?: string; // Accuracy level
    point?: {
      lat: number; // Latitude of the query point
      lon: number; // Longitude of the query point
    };
    id: string;
    name?: string; // Name of the venue or address
    borough?: string; // Borough name
    neighborhood?: string; // Neighborhood name
    city?: string; // City name
    state?: string; // State name
    zip_code?: string; // Postal code
    country?: string; // Country name
    confidence?: number; // Confidence level
  };
}