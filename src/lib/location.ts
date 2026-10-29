export interface CampusLandmark {
  id: string;
  name: string;
  zone: string;
  lat: number;
  lng: number;
}

export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  { id: 'library', name: 'Central University Library', zone: 'Academic Block', lat: 28.5458, lng: 77.1925 },
  { id: 'sac', name: 'Student Activity Center (SAC)', zone: 'Student Hub', lat: 28.5472, lng: 77.1938 },
  { id: 'hostel-north', name: 'Boys Hostel Complex (North)', zone: 'North Residential', lat: 28.5495, lng: 77.1912 },
  { id: 'hostel-south', name: 'Girls Hostel Complex (South)', zone: 'South Residential', lat: 28.5422, lng: 77.1945 },
  { id: 'tech-park', name: 'Computer Science & Tech Block', zone: 'Academic Block', lat: 28.5448, lng: 77.1960 },
  { id: 'cafeteria', name: 'Main Campus Cafeteria & Quad', zone: 'Central Plaza', lat: 28.5465, lng: 77.1930 },
  { id: 'sports', name: 'Sports Complex & Ground', zone: 'West Campus', lat: 28.5480, lng: 77.1890 },
  { id: 'main-gate', name: 'Main Campus Gate & Bus Stop', zone: 'Campus Entry', lat: 28.5430, lng: 77.1910 },
];

/**
 * Calculates the straight-line distance between two GPS coordinates in kilometers
 * using the Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return Infinity;
  }

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats a distance in kilometers into a friendly student campus badge text
 */
export function formatDistance(distKm: number): string {
  if (!isFinite(distKm)) return '';
  if (distKm < 0.05) return 'Right here (< 50 m)';
  if (distKm < 1) {
    const meters = Math.round(distKm * 1000);
    return `~${meters} m away`;
  }
  return `~${distKm.toFixed(1)} km away`;
}

/**
 * Parses a radius filter option into kilometers
 */
export function getRadiusLimitKm(radiusOption: string): number {
  switch (radiusOption) {
    case '500m':
      return 0.5;
    case '1km':
      return 1.0;
    case '3km':
      return 3.0;
    case '5km':
      return 5.0;
    default:
      return Infinity;
  }
}
