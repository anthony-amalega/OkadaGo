import React, { useEffect, useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { OkadaGoState, rideService } from '../../services/rideService';
import { calculateHaversineKm, formatNaira } from '../../utils/pricing';
import { AvatarImg } from '../common/AvatarImg';
import { MapCanvas } from '../passenger/MapCanvas';
import { IncomingRequestModal } from './IncomingRequestModal';
import { KycForm } from './KycForm';
import { SlideToConfirm } from './SlideToConfirm';
import { WalletCard } from './WalletCard';

interface DriverCockpitProps {
  state: OkadaGoState;
}

export const DriverCockpit: React.FC<DriverCockpitProps> = ({ state }) => {
  const browserOnline = useOnlineStatus();
  const [subTab, setSubTab] = useState<'cockpit' | 'kyc'>('cockpit');
  const [lockError, setLockError] = useState('');

  const driver =
    state.drivers.find((d) => d.id === state.activeDriverId) ?? state.drivers[0];

  const isOffline = state.simulatedOffline || !browserOnline;

  // Pause auto-match while viewing Driver Cockpit so driver can accept/decline manually
  useEffect(() => {
    rideService.setPausedAutoMatch(true);
    return () => {
      rideService.setPausedAutoMatch(false);
    };
  }, []);

  // Flush offline queue automatically when connectivity returns
  useEffect(() => {
    if (!isOffline && state.offlineQueue.length > 0) {
      rideService.flushOfflineQueue();
    }
  }, [isOffline, state.offlineQueue.length]);

  const searchingRide =
    driver.isOnline && driver.kycStatus === 'approved'
      ? state.rides.find((r) => r.status === 'searching') ?? null
      : null;

  const activeTrip =
    state.rides.find(
      (r) =>
        r.driverId === driver.id &&
        (r.status === 'matched' || r.status === 'arrived' || r.status === 'in_progress')
    ) ?? null;

  const pickupDistanceKm = searchingRide
    ? Math.max(
        0.4,
        calculateHaversineKm(
          driver.lat,
          driver.lng,
          searchingRide.pickup.lat,
          searchingRide.pickup.lng
        )
      )
    : 0.8;

  const handleToggleOnline = () => {
    const res = rideService.toggleDriverOnline(driver.id);
    if (!res.ok && res.reason) {
      setLockError(res.reason);
    } else {
      setLockError('');
    }
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-gray-100 pb-8">
      {/* Sunlit-Readable High-Contrast Cockpit Header */}
      <div className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <AvatarImg
              src={driver.photoUrl}
              alt={driver.name}
              className="h-12 w-12 rounded-xl border border-gray-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold">{driver.name}</h1>
                <span className="rounded bg-gray-800 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                  {driver.plateNumber}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {driver.bikeModel} · {driver.totalTrips} trips · Rating {driver.rating.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Network & Offline Queue Status Control */}
            <button
              type="button"
              onClick={() => rideService.setSimulatedOffline(!state.simulatedOffline)}
              className={`min-h-[44px] inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold cursor-pointer transition-colors ${
                isOffline
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-gray-800 text-emerald-400 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              {isOffline ? (
                <WifiOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Wifi className="h-4 w-4" aria-hidden="true" />
              )}
              <span>
                {isOffline
                  ? `Offline · ${state.offlineQueue.length} Queued (Tap to Sync)`
                  : '3G/4G Online (Tap to Test Offline)'}
              </span>
            </button>

            {/* Cockpit vs KYC sub-navigation */}
            <div className="flex items-center p-1 rounded-xl bg-gray-800 border border-gray-700">
              <button
                type="button"
                onClick={() => setSubTab('cockpit')}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  subTab === 'cockpit'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Cockpit
              </button>
              <button
                type="button"
                onClick={() => setSubTab('kyc')}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  subTab === 'kyc'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                KYC &amp; Docs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Primary Column */}
        <div className="lg:col-span-7 space-y-5">
          {subTab === 'kyc' ? (
            <KycForm
              driver={driver}
              onSubmitKyc={(payload) => rideService.submitDriverKyc(driver.id, payload)}
            />
          ) : (
            <>
              {/* Active Trip State Machine */}
              {activeTrip ? (
                <div className="rounded-2xl border-2 border-gray-900 bg-white p-5 sm:p-6 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700">
                        {activeTrip.status === 'matched' && 'Step 1 · Head to Pickup'}
                        {activeTrip.status === 'arrived' && 'Step 2 · Passenger Boarding'}
                        {activeTrip.status === 'in_progress' && 'Step 3 · Trip in Progress'}
                      </p>
                      <h2 className="mt-0.5 text-xl font-extrabold text-gray-900">
                        {activeTrip.status === 'matched' && activeTrip.pickup.name}
                        {activeTrip.status === 'arrived' && 'Verify Spare Helmet & Start'}
                        {activeTrip.status === 'in_progress' && activeTrip.destination.name}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold font-mono tabular-nums text-gray-900">
                        {formatNaira(activeTrip.fareNaira)}
                      </p>
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        {activeTrip.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Route & Passenger Info */}
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Passenger</p>
                        <p className="text-sm font-bold text-gray-900">
                          {activeTrip.passengerName} ·{' '}
                          <span className="font-mono">{activeTrip.passengerPhone}</span>
                        </p>
                      </div>
                      <a
                        href={`tel:${activeTrip.passengerPhone}`}
                        className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-gray-800"
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        <span>Call</span>
                      </a>
                    </div>

                    <div className="pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-start gap-2">
                        <Navigation className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <span className="text-gray-500">Pickup</span>
                          <p className="font-bold text-gray-900">{activeTrip.pickup.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-900 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <span className="text-gray-500">Dropoff</span>
                          <p className="font-bold text-gray-900">{activeTrip.destination.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-step Slide-to-Confirm Action Bar */}
                  {activeTrip.status === 'matched' && (
                    <SlideToConfirm
                      label="Slide to Arrive at Pickup"
                      variant="charcoal"
                      onConfirm={() => rideService.arriveAtPickup(activeTrip.id)}
                    />
                  )}
                  {activeTrip.status === 'arrived' && (
                    <SlideToConfirm
                      label="Slide to Start Trip"
                      variant="emerald"
                      onConfirm={() => rideService.startTrip(activeTrip.id)}
                    />
                  )}
                  {activeTrip.status === 'in_progress' && (
                    <SlideToConfirm
                      label="Slide to Complete Trip"
                      variant="amber"
                      onConfirm={() => rideService.completeTrip(activeTrip.id)}
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-900">
                        {driver.isOnline ? 'Scanning Abeokuta Hotspots' : 'You Are Currently Offline'}
                      </h2>
                      <p className="text-xs text-gray-600 mt-0.5">
                        High-demand zones: Panseke Junction · Kuto Market · FUNAAB Gate
                      </p>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" aria-hidden="true" />
                  </div>

                  <button
                    type="button"
                    disabled={!driver.isOnline}
                    onClick={() => rideService.simulateIncomingDispatchForDriver()}
                    className="w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <BellRing className="h-5 w-5" aria-hidden="true" />
                    <span>Simulate Incoming Ride Dispatch (20s Timer)</span>
                  </button>
                </div>
              )}

              {/* Wallet & Online Master Switch */}
              <WalletCard
                driver={driver}
                onToggleOnline={handleToggleOnline}
                onTopUp={(amt) => rideService.topUpDriverWallet(driver.id, amt)}
                lockError={lockError}
              />

              {/* Offline Sync Queue Preview if items queued */}
              {state.offlineQueue.length > 0 && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 space-y-2">
                  <p className="text-xs font-extrabold text-amber-900">
                    Offline Queue ({state.offlineQueue.length} pending state updates)
                  </p>
                  <p className="text-xs text-amber-800">
                    Actions saved locally in browser storage and will sync automatically when 3G/4G returns.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Live Cockpit Map & Quick Trip Summary */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">Live Abeokuta Navigation</span>
              <span className="text-xs font-mono text-emerald-700 font-semibold">
                {activeTrip ? `${Math.round(activeTrip.routeProgress * 100)}% Route` : 'Standby'}
              </span>
            </div>
            <div className="h-[340px] lg:h-[420px] w-full">
              <MapCanvas
                pickup={activeTrip?.pickup ?? null}
                destination={activeTrip?.destination ?? null}
                drivers={state.drivers}
                activeRide={activeTrip}
                focusCenter={[driver.lat, driver.lng]}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
            <p className="text-xs font-bold text-gray-700">Recent Completed Payouts</p>
            <div className="divide-y divide-gray-100">
              {state.ledger
                .filter((l) => l.driverId === driver.id)
                .slice(0, 3)
                .map((entry) => (
                  <div key={entry.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{entry.routeSummary}</p>
                      <p className="text-gray-500">
                        {entry.paymentMethod.toUpperCase()} · Fee {formatNaira(entry.commissionNaira)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 tabular-nums shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatNaira(entry.driverNetNaira)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Dispatch Overlay */}
      {searchingRide && !activeTrip && (
        <IncomingRequestModal
          ride={searchingRide}
          pickupDistanceKm={pickupDistanceKm}
          onAccept={() => rideService.acceptRide(searchingRide.id, driver.id)}
          onDecline={() => rideService.declineRide(searchingRide.id)}
        />
      )}
    </div>
  );
};
