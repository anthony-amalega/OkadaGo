import { Coordinates, Landmark } from '../types';

// Abeokuta, Ogun State, Nigeria city center
export const ABEOKUTA_CENTER: Coordinates = {
  lat: 7.1475,
  lng: 3.3619,
};

export const ABEOKUTA_LANDMARKS: Landmark[] = [
  {
    id: 'panseke',
    name: 'Panseke Junction',
    area: 'Ibara / Panseke',
    category: 'junction',
    lat: 7.1394,
    lng: 3.3375,
    popularPickup: true,
  },
  {
    id: 'oke-ilewo',
    name: 'Oke-Ilewo Business District',
    area: 'Oke-Ilewo',
    category: 'hub',
    lat: 7.1362,
    lng: 3.3446,
    popularPickup: true,
  },
  {
    id: 'kuto',
    name: 'Kuto Market & Motor Park',
    area: 'Kuto',
    category: 'market',
    lat: 7.1456,
    lng: 3.3568,
    popularPickup: true,
  },
  {
    id: 'funaab',
    name: 'FUNAAB Main Gate',
    area: 'Alabata Road',
    category: 'campus',
    lat: 7.2248,
    lng: 3.4372,
    popularPickup: true,
  },
  {
    id: 'lafenwa',
    name: 'Lafenwa Market & Bridge',
    area: 'Lafenwa',
    category: 'market',
    lat: 7.1578,
    lng: 3.3264,
    popularPickup: true,
  },
  {
    id: 'camp-junction',
    name: 'Camp Junction',
    area: 'Osiele / Alabata',
    category: 'junction',
    lat: 7.1852,
    lng: 3.4188,
    popularPickup: true,
  },
  {
    id: 'adatan',
    name: 'Adatan Roundabout',
    area: 'Adatan',
    category: 'junction',
    lat: 7.1631,
    lng: 3.3674,
  },
  {
    id: 'ita-oshin',
    name: 'Ita-Oshin Junction',
    area: 'Ita-Oshin',
    category: 'junction',
    lat: 7.1422,
    lng: 3.3078,
  },
  {
    id: 'olumo-rock',
    name: 'Olumo Rock Tourist Gate',
    area: 'Ikija / Abeokuta North',
    category: 'landmark',
    lat: 7.1687,
    lng: 3.3418,
  },
  {
    id: 'asero',
    name: 'Asero Estate Junction',
    area: 'Asero',
    category: 'junction',
    lat: 7.1674,
    lng: 3.3889,
  },
  {
    id: 'idi-aba',
    name: 'FMC Idi-Aba Gate',
    area: 'Idi-Aba',
    category: 'hub',
    lat: 7.1318,
    lng: 3.3742,
  },
  {
    id: 'sapon',
    name: 'Sapon Central Market',
    area: 'Sapon',
    category: 'market',
    lat: 7.1544,
    lng: 3.3461,
  },
];

/**
 * Generates a realistic multi-waypoint curve between two landmarks
 * so the route polyline and live bike movement look natural on the Abeokuta street grid.
 */
export function buildRouteWaypoints(start: Coordinates, end: Coordinates): [number, number][] {
  const steps = 16;
  const points: [number, number][] = [];
  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;
  // Subtle perpendicular road bend
  const perpLat = -dLng * 0.08;
  const perpLng = dLat * 0.08;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const curve = Math.sin(t * Math.PI);
    points.push([
      start.lat + dLat * t + perpLat * curve,
      start.lng + dLng * t + perpLng * curve,
    ]);
  }
  return points;
}

export function interpolateAlongWaypoints(
  waypoints: [number, number][],
  progress: number
): Coordinates {
  if (waypoints.length === 0) return ABEOKUTA_CENTER;
  if (progress <= 0) return { lat: waypoints[0][0], lng: waypoints[0][1] };
  if (progress >= 1) {
    const last = waypoints[waypoints.length - 1];
    return { lat: last[0], lng: last[1] };
  }
  const scaled = progress * (waypoints.length - 1);
  const idx = Math.floor(scaled);
  const frac = scaled - idx;
  const p1 = waypoints[idx];
  const p2 = waypoints[Math.min(idx + 1, waypoints.length - 1)];
  return {
    lat: p1[0] + (p2[0] - p1[0]) * frac,
    lng: p1[1] + (p2[1] - p1[1]) * frac,
  };
}
