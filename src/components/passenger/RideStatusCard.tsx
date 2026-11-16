import React, { useState } from 'react';
import {
  CheckCircle2,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Star,
  XCircle,
} from 'lucide-react';
import { DriverProfile, RideRecord } from '../../types';
import { formatNaira } from '../../utils/pricing';
import { AvatarImg } from '../common/AvatarImg';

interface RideStatusCardProps {
  ride: RideRecord;
  driver: DriverProfile | null;
  onCancel: () => void;
  onHelmetCheck: (provided: boolean) => void;
  onSubmitRating: (rating: number, note: string) => void;
  onBookAnother: () => void;
  onOpenSafety: () => void;
}

export const RideStatusCard: React.FC<RideStatusCardProps> = ({
  ride,
  driver,
  onCancel,
  onHelmetCheck,
  onSubmitRating,
  onBookAnother,
  onOpenSafety,
}) => {
  const [selectedStars, setSelectedStars] = useState(5);
  const [ratingNote, setRatingNote] = useState('');
  const [ratingSaved, setRatingSaved] = useState(false);

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRating(selectedStars, ratingNote);
    setRatingSaved(true);
  };

  return (
    <section
      aria-label="Live trip status"
      className="fixed bottom-0 left-0 right-0 z-[500] bg-white rounded-t-3xl shadow-[0_-8px_32px_rgba(17,24,39,0.18)] border-t border-gray-200 lg:static lg:h-full lg:w-[420px] lg:shrink-0 lg:rounded-none lg:border-t-0 lg:border-r lg:shadow-none flex flex-col max-h-[82dvh] lg:max-h-full"
    >
      <div className="p-5 lg:p-6 overflow-y-auto space-y-5 flex-1">
        {/* SEARCHING RADAR STATE */}
        {ride.status === 'searching' && (
          <div className="py-4 text-center space-y-4">
            <div className="relative mx-auto h-24 w-24 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-radar-ring" />
              <span className="relative h-14 w-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md font-mono text-xs font-bold">
                1.5km
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Finding verified Okada riders...</h2>
              <p className="mt-1 text-sm text-gray-600">
                {ride.pickup.name} → {ride.destination.name}
              </p>
              <p className="mt-1 text-xs font-mono font-semibold text-emerald-700 tabular-nums">
                {formatNaira(ride.fareNaira)} · {ride.paymentMethod === 'cash' ? 'Cash' : 'Paystack'}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="w-full min-h-[48px] rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel Ride Request
            </button>
          </div>
        )}

        {/* MATCHED / ARRIVED / IN_PROGRESS DRIVER CARD */}
        {(ride.status === 'matched' ||
          ride.status === 'arrived' ||
          ride.status === 'in_progress') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  {ride.status === 'matched' && 'Rider en route to pickup'}
                  {ride.status === 'arrived' && 'Rider has arrived at pickup'}
                  {ride.status === 'in_progress' && 'Trip in progress'}
                </p>
                <h2 className="text-lg font-bold text-gray-900">
                  {ride.status === 'arrived'
                    ? 'Confirm helmet & hop on'
                    : `${ride.etaMinutes} min · ${ride.distanceKm.toFixed(1)} km`}
                </h2>
              </div>
              <span className="text-lg font-extrabold font-mono tabular-nums text-gray-900">
                {formatNaira(ride.fareNaira)}
              </span>
            </div>

            {driver && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3.5">
                <div className="flex items-center gap-3.5">
                  <AvatarImg
                    src={driver.photoUrl}
                    alt={driver.name}
                    className="h-14 w-14 rounded-xl border border-gray-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-bold text-gray-900 truncate">{driver.name}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 tabular-nums">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                        {driver.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {driver.bikeModel} · {driver.totalTrips} trips
                    </p>
                    <div className="mt-1.5 flex items-center flex-wrap gap-2">
                      <span className="rounded-md bg-gray-900 px-2 py-0.5 font-mono text-xs font-bold text-white tracking-wide">
                        {driver.plateNumber}
                      </span>
                      {driver.twoHelmetsVerified && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          2 Helmets Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`tel:${driver.phone}`}
                    className="min-h-[46px] flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span>Call Rider</span>
                  </a>
                  <button
                    type="button"
                    onClick={onOpenSafety}
                    className="min-h-[46px] flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                    <span>Safety &amp; SOS</span>
                  </button>
                </div>
              </div>
            )}

            {/* Helmet Compliance Check upon arrival */}
            {ride.status === 'arrived' && ride.helmetProvided === null && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-amber-900">Mandatory Safety Check</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    Did your rider provide a clean spare helmet?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onHelmetCheck(true)}
                    className="min-h-[46px] flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>Yes, Provided</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onHelmetCheck(false)}
                    className="min-h-[46px] flex items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    <span>No Helmet</span>
                  </button>
                </div>
              </div>
            )}

            {ride.helmetProvided !== null && (
              <p className="text-xs font-medium text-gray-600">
                Helmet compliance logged:{' '}
                <span className={ride.helmetProvided ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
                  {ride.helmetProvided ? 'Clean spare helmet verified' : 'Missing helmet reported to Ops'}
                </span>
              </p>
            )}

            {/* Trip progress bar */}
            {ride.status === 'in_progress' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                  <span>{ride.pickup.name}</span>
                  <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                    {Math.round(ride.routeProgress * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-[width] duration-500"
                    style={{ width: `${Math.max(8, Math.round(ride.routeProgress * 100))}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-right">{ride.destination.name}</p>
              </div>
            )}

            {ride.status === 'matched' && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full min-h-[44px] rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel Ride
              </button>
            )}
          </div>
        )}

        {/* POST-TRIP RECEIPT & 5-STAR RATING */}
        {ride.status === 'completed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <p className="text-xs font-semibold text-emerald-700">Trip Completed</p>
                <h2 className="text-xl font-bold text-gray-900">Your OkadaGo Receipt</h2>
              </div>
              <span className="text-2xl font-extrabold font-mono tabular-nums text-gray-900">
                {formatNaira(ride.fareNaira)}
              </span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">Route</span>
                <span className="font-semibold text-gray-900 text-right">
                  {ride.pickup.name} → {ride.destination.name}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">Distance &amp; Payment</span>
                <span className="font-mono font-semibold text-gray-900 tabular-nums">
                  {ride.distanceKm.toFixed(2)} km · {ride.paymentMethod === 'cash' ? 'Cash' : 'Paystack'}
                </span>
              </div>
              {driver && (
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Rider</span>
                  <span className="font-semibold text-gray-900">
                    {driver.name} ({driver.plateNumber})
                  </span>
                </div>
              )}
            </div>

            {!ratingSaved && ride.rating === null ? (
              <form onSubmit={handleRatingSubmit} className="space-y-3">
                <p className="text-sm font-semibold text-gray-900 text-center">
                  Rate {driver?.name ?? 'your rider'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStars(star)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-amber-50 cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= selectedStars
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={ratingNote}
                  onChange={(e) => setRatingNote(e.target.value)}
                  placeholder="Optional feedback (e.g. smooth riding, clean helmet)"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 cursor-pointer"
                >
                  Submit Rating
                </button>
              </form>
            ) : (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs font-semibold text-emerald-800">
                Thank you for rating your trip!
              </div>
            )}

            <button
              type="button"
              onClick={onBookAnother}
              className="w-full min-h-[48px] rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 cursor-pointer"
            >
              Book Another Ride
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
