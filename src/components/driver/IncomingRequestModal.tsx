import React, { useEffect, useState } from 'react';
import { Banknote, CreditCard, MapPin, Navigation } from 'lucide-react';
import { RideRecord } from '../../types';
import { formatNaira } from '../../utils/pricing';

interface IncomingRequestModalProps {
  ride: RideRecord;
  pickupDistanceKm: number;
  onAccept: () => void;
  onDecline: () => void;
}

const COUNTDOWN_SECONDS = 20;

export const IncomingRequestModal: React.FC<IncomingRequestModalProps> = ({
  ride,
  pickupDistanceKm,
  onAccept,
  onDecline,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    setSecondsLeft(COUNTDOWN_SECONDS);
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [ride.id, onDecline]);

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - secondsLeft / COUNTDOWN_SECONDS);

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-gray-950/80 p-3 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incoming-dispatch-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-gray-900 text-white p-6 shadow-2xl border border-gray-800 space-y-5">
        {/* Header + Countdown Ring */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              New Okada Request
            </p>
            <h2 id="incoming-dispatch-title" className="mt-1 text-2xl font-extrabold">
              {formatNaira(ride.fareNaira)}
            </h2>
            <p className="text-xs font-mono text-gray-300 tabular-nums">
              {pickupDistanceKm.toFixed(1)} km away · {ride.distanceKm.toFixed(1)} km trip
            </p>
          </div>

          <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#374151"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#059669"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                className="transition-[stroke-dashoffset] duration-1000 linear"
              />
            </svg>
            <span className="absolute font-mono text-xl font-extrabold tabular-nums">
              {secondsLeft}s
            </span>
          </div>
        </div>

        {/* Route Details */}
        <div className="rounded-2xl bg-gray-800 p-4 space-y-3 border border-gray-700">
          <div className="flex items-start gap-3">
            <Navigation className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-medium text-gray-400">Pickup Landmark</p>
              <p className="text-base font-bold text-white">{ride.pickup.name}</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-3 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-medium text-gray-400">Dropoff Landmark</p>
              <p className="text-base font-bold text-white">{ride.destination.name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-gray-300 px-1">
          <span className="inline-flex items-center gap-1.5">
            {ride.paymentMethod === 'cash' ? (
              <Banknote className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            ) : (
              <CreditCard className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            )}
            {ride.paymentMethod === 'cash' ? 'Collect Cash from Passenger' : 'Paystack Prepaid'}
          </span>
          <span className="font-mono tabular-nums text-gray-400">
            15% Fee: {formatNaira(ride.commissionNaira)}
          </span>
        </div>

        {/* Oversized 56px+ Tap Targets */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onDecline}
            className="min-h-[58px] rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3 text-base font-extrabold text-gray-200 hover:bg-gray-700 cursor-pointer"
          >
            DECLINE
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="min-h-[58px] rounded-2xl bg-emerald-600 px-4 py-3 text-base font-extrabold text-white hover:bg-emerald-500 shadow-lg cursor-pointer"
          >
            ACCEPT
          </button>
        </div>
      </div>
    </div>
  );
};
