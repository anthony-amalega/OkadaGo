import { ABEOKUTA_LANDMARKS, buildRouteWaypoints, interpolateAlongWaypoints } from '../data/landmarks';
import {
  DriverProfile,
  KycStatus,
  Landmark,
  LedgerEntry,
  PaymentMethod,
  QueuedOfflineAction,
  RideRecord,
  SosAlert,
} from '../types';
import {
  calculateCommissionNaira,
  calculateFareNaira,
  calculateHaversineKm,
  estimateEtaMinutes,
  MIN_DRIVER_WALLET_THRESHOLD,
} from '../utils/pricing';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const OFFLINE_QUEUE_KEY = 'okadago_offline_queue_v1';
const AUTH_STORAGE_KEY = 'okadago_passenger_auth_v1';

export interface PassengerSession {
  phone: string;
  name: string;
  authenticated: boolean;
}

export interface OkadaGoState {
  passengerSession: PassengerSession | null;
  drivers: DriverProfile[];
  activeDriverId: string;
  rides: RideRecord[];
  activeRideId: string | null;
  sosAlerts: SosAlert[];
  ledger: LedgerEntry[];
  offlineQueue: QueuedOfflineAction[];
  simulatedOffline: boolean;
  lastSyncedAt: string;
  backendMode: 'supabase' | 'demo';
}

const INITIAL_DRIVERS: DriverProfile[] = [
  {
    id: 'drv-tunde',
    name: 'Tunde Adebayo',
    phone: '+2348034198201',
    photoUrl: '/src/assets/images/driver_tunde_adebayo_1794820030797.jpg',
    rating: 4.9,
    totalTrips: 418,
    bikeModel: 'Bajaj Boxer BM150',
    plateNumber: 'ABK-482QA',
    twoHelmetsVerified: true,
    kycStatus: 'approved',
    nin: '29481039482',
    ridersPermitId: 'OGN-RDR-2026-0841',
    helmetPhotoUrl: '/src/assets/images/okada_dual_helmets_1794820031922.jpg',
    isOnline: true,
    walletBalance: 2450,
    virtualAccountNumber: '9041827364',
    virtualBankName: 'Wema Bank (OkadaGo Virtual)',
    lat: 7.1412,
    lng: 3.3411,
    headingDeg: 45,
    submittedAt: '2026-10-12T09:15:00Z',
  },
  {
    id: 'drv-ibrahim',
    name: 'Ibrahim Musa',
    phone: '+2348059231147',
    photoUrl: '/src/assets/images/driver_ibrahim_musa_1794820031143.jpg',
    rating: 4.8,
    totalTrips: 312,
    bikeModel: 'TVS HLX 125',
    plateNumber: 'OGN-719KC',
    twoHelmetsVerified: true,
    kycStatus: 'approved',
    nin: '48291038471',
    ridersPermitId: 'OGN-RDR-2026-0912',
    helmetPhotoUrl: '/src/assets/images/okada_dual_helmets_1794820031922.jpg',
    isOnline: true,
    walletBalance: 3800,
    virtualAccountNumber: '9041827991',
    virtualBankName: 'Wema Bank (OkadaGo Virtual)',
    lat: 7.1489,
    lng: 3.3541,
    headingDeg: 130,
    submittedAt: '2026-10-18T11:30:00Z',
  },
  {
    id: 'drv-chinedu',
    name: 'Chinedu Okafor',
    phone: '+2348120944812',
    photoUrl: '/src/assets/images/driver_chinedu_okafor_1794820032094.jpg',
    rating: 4.7,
    totalTrips: 0,
    bikeModel: 'Bajaj Boxer X150',
    plateNumber: 'ABK-905XE',
    twoHelmetsVerified: false,
    kycStatus: 'pending',
    nin: '71928374650',
    ridersPermitId: 'OGN-RDR-2026-1409',
    helmetPhotoUrl: '/src/assets/images/okada_dual_helmets_1794820031922.jpg',
    isOnline: false,
    walletBalance: 1000,
    virtualAccountNumber: '9041828104',
    virtualBankName: 'Wema Bank (OkadaGo Virtual)',
    lat: 7.1618,
    lng: 3.3642,
    headingDeg: 210,
    submittedAt: '2026-11-16T07:45:00Z',
  },
  {
    id: 'drv-segun',
    name: 'Segun Balogun',
    phone: '+2347063382910',
    photoUrl: '/src/assets/images/driver_tunde_adebayo_1794820030797.jpg',
    rating: 4.6,
    totalTrips: 0,
    bikeModel: 'Haojue Express 125',
    plateNumber: 'OGN-331LB',
    twoHelmetsVerified: false,
    kycStatus: 'pending',
    nin: '64019283745',
    ridersPermitId: 'OGN-RDR-2026-1433',
    helmetPhotoUrl: '/src/assets/images/okada_dual_helmets_1794820031922.jpg',
    isOnline: false,
    walletBalance: 500,
    virtualAccountNumber: '9041828250',
    virtualBankName: 'Wema Bank (OkadaGo Virtual)',
    lat: 7.1531,
    lng: 3.3322,
    headingDeg: 90,
    submittedAt: '2026-11-16T08:20:00Z',
  },
];

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'led-1001',
    rideId: 'ride-seed-01',
    driverId: 'drv-tunde',
    driverName: 'Tunde Adebayo',
    plateNumber: 'ABK-482QA',
    routeSummary: 'Panseke Junction → Oke-Ilewo Business District',
    paymentMethod: 'cash',
    grossFareNaira: 400,
    commissionNaira: 60,
    driverNetNaira: 340,
    type: 'trip_commission',
    createdAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
  },
  {
    id: 'led-1002',
    rideId: 'ride-seed-02',
    driverId: 'drv-ibrahim',
    driverName: 'Ibrahim Musa',
    plateNumber: 'OGN-719KC',
    routeSummary: 'Kuto Market & Motor Park → FUNAAB Main Gate',
    paymentMethod: 'paystack',
    grossFareNaira: 1750,
    commissionNaira: 263,
    driverNetNaira: 1487,
    type: 'paystack_payout',
    createdAt: new Date(Date.now() - 1000 * 60 * 78).toISOString(),
  },
  {
    id: 'led-1003',
    rideId: 'ride-seed-03',
    driverId: 'drv-tunde',
    driverName: 'Tunde Adebayo',
    plateNumber: 'ABK-482QA',
    routeSummary: 'Lafenwa Market & Bridge → Sapon Central Market',
    paymentMethod: 'paystack',
    grossFareNaira: 550,
    commissionNaira: 83,
    driverNetNaira: 467,
    type: 'paystack_payout',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 'led-1004',
    rideId: 'ride-seed-04',
    driverId: 'drv-ibrahim',
    driverName: 'Ibrahim Musa',
    plateNumber: 'OGN-719KC',
    routeSummary: 'Camp Junction → Adatan Roundabout',
    paymentMethod: 'cash',
    grossFareNaira: 1050,
    commissionNaira: 158,
    driverNetNaira: 892,
    type: 'trip_commission',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
];

const INITIAL_SEED_RIDES: RideRecord[] = [
  {
    id: 'ride-seed-04',
    passengerPhone: '+2348094412018',
    passengerName: 'Amina Bello',
    pickup: ABEOKUTA_LANDMARKS[5], // Camp Junction
    destination: ABEOKUTA_LANDMARKS[6], // Adatan Roundabout
    distanceKm: 6.18,
    etaMinutes: 14,
    fareNaira: 1050,
    commissionNaira: 158,
    paymentMethod: 'cash',
    status: 'completed',
    driverId: 'drv-ibrahim',
    helmetProvided: true,
    rating: 5,
    ratingNote: 'Quick ride and clean helmet.',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    routeProgress: 1,
  },
];

function loadSavedQueue(): QueuedOfflineAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedOfflineAction[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedOfflineAction[]): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore storage quota errors
  }
}

function loadSavedAuth(): PassengerSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PassengerSession) : null;
  } catch {
    return null;
  }
}

function saveAuth(session: PassengerSession | null): void {
  try {
    if (session) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}

type Listener = (state: OkadaGoState) => void;

class RideService {
  private state: OkadaGoState = {
    passengerSession: loadSavedAuth(),
    drivers: INITIAL_DRIVERS,
    activeDriverId: 'drv-tunde',
    rides: INITIAL_SEED_RIDES,
    activeRideId: null,
    sosAlerts: [],
    ledger: INITIAL_LEDGER,
    offlineQueue: loadSavedQueue(),
    simulatedOffline: false,
    lastSyncedAt: new Date().toISOString(),
    backendMode: isSupabaseConfigured ? 'supabase' : 'demo',
  };

  private listeners = new Set<Listener>();
  private autoMatchTimer: number | null = null;
  private gpsInterval: number | null = null;
  private isPausedAutoMatch = false;

  constructor() {
    this.initRealtime();
    this.startAmbientFleetMovement();
  }

  private initRealtime(): void {
    if (supabase) {
      const channel = supabase
        .channel('okadago-ops-sync')
        .on('broadcast', { event: 'ride_update' }, ({ payload }) => {
          if (payload && typeof payload === 'object') {
            this.state = {
              ...this.state,
              ...(payload as Partial<OkadaGoState>),
              lastSyncedAt: new Date().toISOString(),
            };
            this.emit();
          }
        })
        .subscribe();
      void channel;
    }
  }

  private broadcastState(): void {
    if (supabase) {
      void supabase.channel('okadago-ops-sync').send({
        type: 'broadcast',
        event: 'ride_update',
        payload: {
          rides: this.state.rides,
          sosAlerts: this.state.sosAlerts,
        },
      });
    }
  }

  private startAmbientFleetMovement(): void {
    if (typeof window === 'undefined') return;
    this.gpsInterval = window.setInterval(() => {
      const activeRide = this.getActiveRide();
      let changed = false;

      if (activeRide && activeRide.status === 'in_progress' && activeRide.driverId) {
        const nextProgress = Math.min(1, Number((activeRide.routeProgress + 0.08).toFixed(2)));
        const waypoints = buildRouteWaypoints(activeRide.pickup, activeRide.destination);
        const pos = interpolateAlongWaypoints(waypoints, nextProgress);

        this.state = {
          ...this.state,
          rides: this.state.rides.map((r) =>
            r.id === activeRide.id ? { ...r, routeProgress: nextProgress } : r
          ),
          drivers: this.state.drivers.map((d) =>
            d.id === activeRide.driverId ? { ...d, lat: pos.lat, lng: pos.lng } : d
          ),
        };
        changed = true;
      } else {
        // Gentle idle bike movement for online drivers on the map
        this.state = {
          ...this.state,
          drivers: this.state.drivers.map((d, idx) => {
            if (!d.isOnline || d.kycStatus !== 'approved') return d;
            const jitterLat = Math.sin(Date.now() / 4000 + idx) * 0.00022;
            const jitterLng = Math.cos(Date.now() / 4500 + idx) * 0.00022;
            return {
              ...d,
              lat: Number((d.lat + jitterLat).toFixed(5)),
              lng: Number((d.lng + jitterLng).toFixed(5)),
            };
          }),
        };
        changed = true;
      }

      if (changed) {
        this.emit();
      }
    }, 1800);
  }

  private emit(): void {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): OkadaGoState {
    return { ...this.state };
  }

  getActiveRide(): RideRecord | null {
    if (!this.state.activeRideId) return null;
    return this.state.rides.find((r) => r.id === this.state.activeRideId) ?? null;
  }

  getActiveDriver(): DriverProfile {
    return (
      this.state.drivers.find((d) => d.id === this.state.activeDriverId) ??
      this.state.drivers[0]
    );
  }

  setPausedAutoMatch(paused: boolean): void {
    this.isPausedAutoMatch = paused;
  }

  // --- AUTH ---
  loginPassenger(phone: string, name = 'Chidi Okonkwo'): void {
    const formatted = phone.startsWith('+234') ? phone : `+234${phone.replace(/^0+/, '')}`;
    const session: PassengerSession = {
      phone: formatted,
      name,
      authenticated: true,
    };
    saveAuth(session);
    this.state = { ...this.state, passengerSession: session };
    this.emit();
  }

  logoutPassenger(): void {
    saveAuth(null);
    this.state = { ...this.state, passengerSession: null };
    this.emit();
  }

  // --- PASSENGER RIDE FLOW ---
  requestRide(pickup: Landmark, destination: Landmark, paymentMethod: PaymentMethod): RideRecord {
    if (this.autoMatchTimer) {
      window.clearTimeout(this.autoMatchTimer);
      this.autoMatchTimer = null;
    }

    const distanceKm = calculateHaversineKm(
      pickup.lat,
      pickup.lng,
      destination.lat,
      destination.lng
    );
    const fareNaira = calculateFareNaira(distanceKm);
    const etaMinutes = estimateEtaMinutes(distanceKm);
    const commissionNaira = calculateCommissionNaira(fareNaira);

    const session = this.state.passengerSession ?? {
      phone: '+2348091124578',
      name: 'Demo Passenger',
      authenticated: true,
    };

    const newRide: RideRecord = {
      id: `ride-${Date.now().toString().slice(-6)}`,
      passengerPhone: session.phone,
      passengerName: session.name,
      pickup,
      destination,
      distanceKm,
      etaMinutes,
      fareNaira,
      commissionNaira,
      paymentMethod,
      status: 'searching',
      driverId: null,
      helmetProvided: null,
      rating: null,
      ratingNote: '',
      createdAt: new Date().toISOString(),
      routeProgress: 0,
    };

    this.state = {
      ...this.state,
      rides: [newRide, ...this.state.rides],
      activeRideId: newRide.id,
    };
    this.emit();
    this.broadcastState();

    // Auto-match after 4.2s if user remains in Passenger view and hasn't paused in Driver view
    this.autoMatchTimer = window.setTimeout(() => {
      const current = this.state.rides.find((r) => r.id === newRide.id);
      if (current && current.status === 'searching' && !this.isPausedAutoMatch) {
        const eligibleDriver =
          this.state.drivers.find(
            (d) =>
              d.kycStatus === 'approved' &&
              d.isOnline &&
              d.walletBalance >= MIN_DRIVER_WALLET_THRESHOLD
          ) ?? this.state.drivers[0];
        this.acceptRide(newRide.id, eligibleDriver.id);
      }
    }, 4200);

    return newRide;
  }

  cancelRide(rideId: string): void {
    if (this.autoMatchTimer) {
      window.clearTimeout(this.autoMatchTimer);
      this.autoMatchTimer = null;
    }
    this.state = {
      ...this.state,
      rides: this.state.rides.map((r) =>
        r.id === rideId ? { ...r, status: 'cancelled' } : r
      ),
      activeRideId: this.state.activeRideId === rideId ? null : this.state.activeRideId,
    };
    this.emit();
    this.broadcastState();
  }

  resetPassengerRide(): void {
    this.state = {
      ...this.state,
      activeRideId: null,
    };
    this.emit();
  }

  submitHelmetCompliance(rideId: string, provided: boolean): void {
    this.state = {
      ...this.state,
      rides: this.state.rides.map((r) =>
        r.id === rideId ? { ...r, helmetProvided: provided } : r
      ),
    };
    this.emit();
  }

  submitRideRating(rideId: string, rating: number, note: string): void {
    this.state = {
      ...this.state,
      rides: this.state.rides.map((r) =>
        r.id === rideId ? { ...r, rating, ratingNote: note } : r
      ),
    };
    this.emit();
  }

  // --- SAFETY SOS ---
  triggerSosAlert(rideId: string): SosAlert | null {
    const ride = this.state.rides.find((r) => r.id === rideId);
    if (!ride) return null;
    const driver = this.state.drivers.find((d) => d.id === ride.driverId);

    const existingOpen = this.state.sosAlerts.find(
      (a) => a.rideId === rideId && !a.resolved
    );
    if (existingOpen) return existingOpen;

    const waypoints = buildRouteWaypoints(ride.pickup, ride.destination);
    const pos = interpolateAlongWaypoints(waypoints, ride.routeProgress);

    const alert: SosAlert = {
      id: `sos-${Date.now().toString().slice(-5)}`,
      rideId: ride.id,
      passengerPhone: ride.passengerPhone,
      driverName: driver?.name ?? 'Unassigned Rider',
      plateNumber: driver?.plateNumber ?? 'PENDING',
      pickupName: ride.pickup.name,
      destinationName: ride.destination.name,
      lat: pos.lat,
      lng: pos.lng,
      triggeredAt: new Date().toISOString(),
      resolved: false,
    };

    this.state = {
      ...this.state,
      sosAlerts: [alert, ...this.state.sosAlerts],
    };
    this.emit();
    this.broadcastState();
    return alert;
  }

  resolveSosAlert(alertId: string): void {
    this.state = {
      ...this.state,
      sosAlerts: this.state.sosAlerts.map((a) =>
        a.id === alertId
          ? { ...a, resolved: true, resolvedAt: new Date().toISOString() }
          : a
      ),
    };
    this.emit();
    this.broadcastState();
  }

  // --- DRIVER COCKPIT ACTIONS & OFFLINE QUEUE ---
  setSimulatedOffline(offline: boolean): void {
    this.state = { ...this.state, simulatedOffline: offline };
    this.emit();
    if (!offline && navigator.onLine) {
      this.flushOfflineQueue();
    }
  }

  private isCurrentlyOffline(): boolean {
    return this.state.simulatedOffline || (typeof navigator !== 'undefined' && !navigator.onLine);
  }

  private enqueueAction(action: Omit<QueuedOfflineAction, 'id' | 'queuedAt'>): void {
    const entry: QueuedOfflineAction = {
      ...action,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      queuedAt: new Date().toISOString(),
    };
    const nextQueue = [...this.state.offlineQueue, entry];
    saveQueue(nextQueue);
    this.state = { ...this.state, offlineQueue: nextQueue };
    this.emit();
  }

  flushOfflineQueue(): void {
    if (this.state.offlineQueue.length === 0 || this.isCurrentlyOffline()) return;
    const pending = [...this.state.offlineQueue];
    saveQueue([]);
    this.state = {
      ...this.state,
      offlineQueue: [],
      lastSyncedAt: new Date().toISOString(),
    };

    pending.forEach((item) => {
      if (item.action === 'ARRIVE' && item.rideId) {
        this.applyArriveAtPickup(item.rideId);
      } else if (item.action === 'START_TRIP' && item.rideId) {
        this.applyStartTrip(item.rideId);
      } else if (item.action === 'COMPLETE_TRIP' && item.rideId) {
        this.applyCompleteTrip(item.rideId);
      }
    });
    this.emit();
  }

  toggleDriverOnline(driverId: string): { ok: boolean; reason?: string } {
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (!driver) return { ok: false, reason: 'Driver not found' };

    if (!driver.isOnline) {
      if (driver.kycStatus !== 'approved') {
        return { ok: false, reason: 'KYC approval is required before going online.' };
      }
      if (driver.walletBalance < MIN_DRIVER_WALLET_THRESHOLD) {
        return {
          ok: false,
          reason: `Wallet balance (${driver.walletBalance}) is below -₦200 minimum. Top up to go online.`,
        };
      }
    }

    this.state = {
      ...this.state,
      drivers: this.state.drivers.map((d) =>
        d.id === driverId ? { ...d, isOnline: !d.isOnline } : d
      ),
    };
    this.emit();
    return { ok: true };
  }

  topUpDriverWallet(driverId: string, amountNaira: number): void {
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const newLedger: LedgerEntry = {
      id: `led-${Date.now().toString().slice(-5)}`,
      rideId: 'TOPUP',
      driverId: driver.id,
      driverName: driver.name,
      plateNumber: driver.plateNumber,
      routeSummary: 'Wema Virtual Account Top-Up',
      paymentMethod: 'paystack',
      grossFareNaira: amountNaira,
      commissionNaira: 0,
      driverNetNaira: amountNaira,
      type: 'wallet_topup',
      createdAt: new Date().toISOString(),
    };

    this.state = {
      ...this.state,
      drivers: this.state.drivers.map((d) =>
        d.id === driverId
          ? { ...d, walletBalance: d.walletBalance + amountNaira }
          : d
      ),
      ledger: [newLedger, ...this.state.ledger],
    };
    this.emit();
  }

  submitDriverKyc(
    driverId: string,
    payload: {
      nin: string;
      ridersPermitId: string;
      plateNumber: string;
      bikeModel: string;
      helmetPhotoUrl?: string;
      photoUrl?: string;
    }
  ): void {
    this.state = {
      ...this.state,
      drivers: this.state.drivers.map((d) =>
        d.id === driverId
          ? {
              ...d,
              nin: payload.nin,
              ridersPermitId: payload.ridersPermitId,
              plateNumber: payload.plateNumber.toUpperCase(),
              bikeModel: payload.bikeModel,
              helmetPhotoUrl: payload.helmetPhotoUrl || d.helmetPhotoUrl,
              photoUrl: payload.photoUrl || d.photoUrl,
              kycStatus: 'pending',
              isOnline: false,
              submittedAt: new Date().toISOString(),
            }
          : d
      ),
    };
    this.emit();
  }

  simulateIncomingDispatchForDriver(): RideRecord {
    // Creates a realistic passenger ride request near Abeokuta for the driver cockpit to accept/decline
    const pickup = ABEOKUTA_LANDMARKS[0]; // Panseke Junction
    const destination = ABEOKUTA_LANDMARKS[2]; // Kuto Market
    this.isPausedAutoMatch = true;
    return this.requestRide(pickup, destination, 'cash');
  }

  acceptRide(rideId: string, driverId: string): void {
    if (this.autoMatchTimer) {
      window.clearTimeout(this.autoMatchTimer);
      this.autoMatchTimer = null;
    }
    const ride = this.state.rides.find((r) => r.id === rideId);
    if (!ride || ride.status !== 'searching') return;

    this.state = {
      ...this.state,
      rides: this.state.rides.map((r) =>
        r.id === rideId ? { ...r, status: 'matched', driverId } : r
      ),
      drivers: this.state.drivers.map((d) =>
        d.id === driverId
          ? {
              ...d,
              lat: Number((ride.pickup.lat - 0.0028).toFixed(5)),
              lng: Number((ride.pickup.lng - 0.0022).toFixed(5)),
            }
          : d
      ),
    };
    this.emit();
    this.broadcastState();
  }

  declineRide(rideId: string): void {
    if (this.autoMatchTimer) {
      window.clearTimeout(this.autoMatchTimer);
      this.autoMatchTimer = null;
    }
    this.state = {
      ...this.state,
      rides: this.state.rides.map((r) =>
        r.id === rideId ? { ...r, status: 'cancelled' } : r
      ),
      activeRideId: this.state.activeRideId === rideId ? null : this.state.activeRideId,
    };
    this.emit();
  }

  arriveAtPickup(rideId: string): void {
    this.applyArriveAtPickup(rideId);
    if (this.isCurrentlyOffline()) {
      this.enqueueAction({ action: 'ARRIVE', rideId });
    }
  }

  private applyArriveAtPickup(rideId: string): void {
    const ride = this.state.rides.find((r) => r.id === rideId);
    if (!ride) return;
    this.state = {
      ...this.state,
      rides: this.state.rides.map((r) =>
        r.id === rideId ? { ...r, status: 'arrived' } : r
      ),
      drivers: this.state.drivers.map((d) =>
        d.id === ride.driverId
          ? { ...d, lat: ride.pickup.lat, lng: ride.pickup.lng }
          : d
      ),
    };
    this.emit();
    this.broadcastState();
  }

  startTrip(rideId: string): void {
    this.applyStartTrip(rideId);
    if (this.isCurrentlyOffline()) {
      this.enqueueAction({ action: 'START_TRIP', rideId });
    }
  }

  private applyStartTrip(rideId: string): void {
    this.state = {
      ...this.state,
      rides: this.state.rides.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: 'in_progress',
              startedAt: new Date().toISOString(),
              routeProgress: 0.08,
            }
          : r
      ),
    };
    this.emit();
    this.broadcastState();
  }

  completeTrip(rideId: string): void {
    this.applyCompleteTrip(rideId);
    if (this.isCurrentlyOffline()) {
      this.enqueueAction({ action: 'COMPLETE_TRIP', rideId });
    }
  }

  private applyCompleteTrip(rideId: string): void {
    const ride = this.state.rides.find((r) => r.id === rideId);
    if (!ride || ride.status === 'completed') return;

    const driver = this.state.drivers.find((d) => d.id === ride.driverId);
    const driverNet = ride.fareNaira - ride.commissionNaira;
    const walletDelta =
      ride.paymentMethod === 'cash' ? -ride.commissionNaira : driverNet;

    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now().toString().slice(-5)}`,
      rideId: ride.id,
      driverId: driver?.id ?? 'unknown',
      driverName: driver?.name ?? 'Verified Rider',
      plateNumber: driver?.plateNumber ?? 'ABK-000QA',
      routeSummary: `${ride.pickup.name} → ${ride.destination.name}`,
      paymentMethod: ride.paymentMethod,
      grossFareNaira: ride.fareNaira,
      commissionNaira: ride.commissionNaira,
      driverNetNaira: driverNet,
      type: ride.paymentMethod === 'cash' ? 'trip_commission' : 'paystack_payout',
      createdAt: new Date().toISOString(),
    };

    this.state = {
      ...this.state,
      rides: this.state.rides.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: 'completed',
              completedAt: new Date().toISOString(),
              routeProgress: 1,
            }
          : r
      ),
      drivers: this.state.drivers.map((d) => {
        if (d.id !== ride.driverId) return d;
        const nextBalance = d.walletBalance + walletDelta;
        return {
          ...d,
          totalTrips: d.totalTrips + 1,
          walletBalance: nextBalance,
          isOnline: nextBalance < MIN_DRIVER_WALLET_THRESHOLD ? false : d.isOnline,
          lat: ride.destination.lat,
          lng: ride.destination.lng,
        };
      }),
      ledger: [ledgerEntry, ...this.state.ledger],
    };
    this.emit();
    this.broadcastState();
  }

  // --- ADMIN OPS ACTIONS ---
  reviewDriverKyc(driverId: string, status: KycStatus): void {
    this.state = {
      ...this.state,
      drivers: this.state.drivers.map((d) =>
        d.id === driverId
          ? {
              ...d,
              kycStatus: status,
              twoHelmetsVerified: status === 'approved',
              isOnline: status === 'approved' ? true : false,
            }
          : d
      ),
    };
    this.emit();
  }
}

export const rideService = new RideService();
