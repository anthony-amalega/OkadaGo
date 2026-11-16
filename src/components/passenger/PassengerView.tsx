import React, { useState } from 'react';
import { ShieldAlert, UserCheck } from 'lucide-react';
import { ABEOKUTA_LANDMARKS } from '../../data/landmarks';
import { OkadaGoState, rideService } from '../../services/rideService';
import { Landmark, PaymentMethod } from '../../types';
import { BottomSheet, SheetSnap } from './BottomSheet';
import { MapCanvas } from './MapCanvas';
import { PhoneAuthModal } from './PhoneAuthModal';
import { RideStatusCard } from './RideStatusCard';
import { SafetyModal } from './SafetyModal';

interface PassengerViewProps {
  state: OkadaGoState;
}

export const PassengerView: React.FC<PassengerViewProps> = ({ state }) => {
  const [pickup, setPickup] = useState<Landmark | null>(ABEOKUTA_LANDMARKS[0]); // Panseke Junction
  const [destination, setDestination] = useState<Landmark | null>(ABEOKUTA_LANDMARKS[2]); // Kuto Market
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>('half');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);

  const activeRide =
    state.activeRideId
      ? state.rides.find((r) => r.id === state.activeRideId) ?? null
      : null;

  const matchedDriver =
    activeRide?.driverId
      ? state.drivers.find((d) => d.id === activeRide.driverId) ?? null
      : null;

  const onlineDriverCount = state.drivers.filter(
    (d) => d.isOnline && d.kycStatus === 'approved'
  ).length;

  const hasOpenSos = Boolean(
    activeRide &&
      state.sosAlerts.some((alert) => alert.rideId === activeRide.id && !alert.resolved)
  );

  const handleRequestRide = () => {
    if (!pickup || !destination || pickup.id === destination.id) return;
    if (!state.passengerSession?.authenticated) {
      setAuthModalOpen(true);
      return;
    }
    rideService.setPausedAutoMatch(false);
    rideService.requestRide(pickup, destination, paymentMethod);
  };

  const handleMapLandmarkClick = (landmark: Landmark) => {
    if (activeRide) return;
    if (!pickup) {
      setPickup(landmark);
    } else if (!destination || destination.id === landmark.id) {
      setDestination(landmark);
    } else {
      setDestination(landmark);
    }
  };

  return (
    <div className="relative h-[calc(100dvh-56px)] w-full flex flex-col lg:flex-row overflow-hidden bg-gray-100">
      {/* Left Desktop Panel / Mobile Bottom Sheet */}
      {activeRide ? (
        <RideStatusCard
          ride={activeRide}
          driver={matchedDriver}
          onCancel={() => rideService.cancelRide(activeRide.id)}
          onHelmetCheck={(provided) =>
            rideService.submitHelmetCompliance(activeRide.id, provided)
          }
          onSubmitRating={(stars, note) =>
            rideService.submitRideRating(activeRide.id, stars, note)
          }
          onBookAnother={() => rideService.resetPassengerRide()}
          onOpenSafety={() => setSafetyModalOpen(true)}
        />
      ) : (
        <BottomSheet
          snap={sheetSnap}
          onSnapChange={setSheetSnap}
          pickup={pickup}
          destination={destination}
          onSelectPickup={setPickup}
          onSelectDestination={setDestination}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          onRequestRide={handleRequestRide}
          onlineDriverCount={onlineDriverCount}
        />
      )}

      {/* Interactive Map Canvas */}
      <div className="relative flex-1 h-full w-full order-first lg:order-last">
        <MapCanvas
          pickup={pickup}
          destination={destination}
          drivers={state.drivers}
          activeRide={activeRide}
          sosAlerts={state.sosAlerts}
          onSelectLandmark={handleMapLandmarkClick}
        />

        {/* Floating Top Status / SOS Pill (compact, single line, <=15% cap) */}
        <div className="pointer-events-none absolute top-3 left-3 right-3 z-[400] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="pointer-events-auto min-h-[40px] inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-gray-900 shadow-md border border-gray-200 hover:bg-white cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <span className="truncate max-w-[160px]">
              {state.passengerSession?.authenticated
                ? state.passengerSession.phone
                : 'Sign in (+234)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSafetyModalOpen(true)}
            className={`pointer-events-auto min-h-[40px] inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold shadow-md cursor-pointer transition-colors ${
              hasOpenSos
                ? 'bg-red-600 text-white'
                : 'bg-gray-900/95 text-white hover:bg-gray-800'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span>{hasOpenSos ? 'SOS Active' : 'SOS / Share'}</span>
          </button>
        </div>
      </div>

      {/* Phone OTP Modal */}
      <PhoneAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={(phone, name) => {
          rideService.loginPassenger(phone, name);
        }}
      />

      {/* Safety Toolkit Modal */}
      <SafetyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        ride={activeRide}
        driver={matchedDriver}
        sosTriggered={hasOpenSos}
        onTriggerSos={() => {
          if (activeRide) {
            rideService.triggerSosAlert(activeRide.id);
          } else {
            // Create an instant check-in SOS alert if no active trip is running
            const fallbackRide = rideService.requestRide(
              pickup ?? ABEOKUTA_LANDMARKS[0],
              destination ?? ABEOKUTA_LANDMARKS[1],
              paymentMethod
            );
            rideService.triggerSosAlert(fallbackRide.id);
          }
        }}
      />
    </div>
  );
};
