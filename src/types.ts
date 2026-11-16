export type AppRole = 'passenger' | 'driver' | 'admin';

export type PaymentMethod = 'cash' | 'paystack';

export type RideStatus =
  | 'idle'
  | 'searching'
  | 'matched'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type KycStatus = 'pending' | 'approved' | 'rejected';

export interface Landmark {
  id: string;
  name: string;
  area: string;
  category: 'junction' | 'market' | 'campus' | 'hub' | 'landmark';
  lat: number;
  lng: number;
  popularPickup?: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
  rating: number;
  totalTrips: number;
  bikeModel: string;
  plateNumber: string;
  twoHelmetsVerified: boolean;
  kycStatus: KycStatus;
  nin: string;
  ridersPermitId: string;
  helmetPhotoUrl: string;
  isOnline: boolean;
  walletBalance: number;
  virtualAccountNumber: string;
  virtualBankName: string;
  lat: number;
  lng: number;
  headingDeg: number;
  submittedAt: string;
}

export interface RideRecord {
  id: string;
  passengerPhone: string;
  passengerName: string;
  pickup: Landmark;
  destination: Landmark;
  distanceKm: number;
  etaMinutes: number;
  fareNaira: number;
  commissionNaira: number;
  paymentMethod: PaymentMethod;
  status: RideStatus;
  driverId: string | null;
  helmetProvided: boolean | null;
  rating: number | null;
  ratingNote: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  routeProgress: number; // 0 to 1
}

export interface SosAlert {
  id: string;
  rideId: string;
  passengerPhone: string;
  driverName: string;
  plateNumber: string;
  pickupName: string;
  destinationName: string;
  lat: number;
  lng: number;
  triggeredAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface LedgerEntry {
  id: string;
  rideId: string;
  driverId: string;
  driverName: string;
  plateNumber: string;
  routeSummary: string;
  paymentMethod: PaymentMethod;
  grossFareNaira: number;
  commissionNaira: number;
  driverNetNaira: number;
  type: 'trip_commission' | 'paystack_payout' | 'wallet_topup';
  createdAt: string;
}

export interface QueuedOfflineAction {
  id: string;
  action: 'ARRIVE' | 'START_TRIP' | 'COMPLETE_TRIP' | 'TOGGLE_ONLINE';
  rideId?: string;
  payload?: Record<string, unknown>;
  queuedAt: string;
}
