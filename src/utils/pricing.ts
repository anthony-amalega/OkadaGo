const EARTH_RADIUS_KM = 6371;

export const BASE_FARE_NAIRA = 300;
export const PER_KM_RATE_NAIRA = 120;
export const COMMISSION_RATE = 0.15;
export const MIN_DRIVER_WALLET_THRESHOLD = -200;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function calculateHaversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((EARTH_RADIUS_KM * c).toFixed(2));
}

/**
 * Deterministic Naira fare rounded to nearest ₦50:
 * Base ₦300 + ₦120/km
 */
export function calculateFareNaira(distanceKm: number): number {
  const raw = BASE_FARE_NAIRA + distanceKm * PER_KM_RATE_NAIRA;
  const rounded = Math.round(raw / 50) * 50;
  return Math.max(BASE_FARE_NAIRA, rounded);
}

export function estimateEtaMinutes(distanceKm: number): number {
  // Average Abeokuta Okada speed ~26 km/h including junction stops
  return Math.max(3, Math.round((distanceKm / 26) * 60));
}

export function calculateCommissionNaira(fareNaira: number): number {
  return Math.round(fareNaira * COMMISSION_RATE);
}

export function formatNaira(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}₦${Math.abs(amount).toLocaleString('en-NG')}`;
}
