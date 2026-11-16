import React, { useMemo, useState } from 'react';
import {
  Banknote,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ABEOKUTA_LANDMARKS } from '../../data/landmarks';
import { Landmark, PaymentMethod } from '../../types';
import {
  calculateFareNaira,
  calculateHaversineKm,
  estimateEtaMinutes,
  formatNaira,
} from '../../utils/pricing';

export type SheetSnap = 'collapsed' | 'half' | 'full';

interface BottomSheetProps {
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
  pickup: Landmark | null;
  destination: Landmark | null;
  onSelectPickup: (landmark: Landmark) => void;
  onSelectDestination: (landmark: Landmark) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onRequestRide: () => void;
  onlineDriverCount: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  snap,
  onSnapChange,
  pickup,
  destination,
  onSelectPickup,
  onSelectDestination,
  paymentMethod,
  onPaymentMethodChange,
  onRequestRide,
  onlineDriverCount,
}) => {
  const [activeField, setActiveField] = useState<'pickup' | 'destination'>('destination');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLandmarks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ABEOKUTA_LANDMARKS;
    return ABEOKUTA_LANDMARKS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.area.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const estimate = useMemo(() => {
    if (!pickup || !destination || pickup.id === destination.id) return null;
    const distanceKm = calculateHaversineKm(
      pickup.lat,
      pickup.lng,
      destination.lat,
      destination.lng
    );
    const fareNaira = calculateFareNaira(distanceKm);
    const etaMinutes = estimateEtaMinutes(distanceKm);
    return { distanceKm, fareNaira, etaMinutes };
  }, [pickup, destination]);

  const handleLandmarkPick = (landmark: Landmark) => {
    if (activeField === 'pickup') {
      onSelectPickup(landmark);
      setActiveField('destination');
      setSearchQuery('');
      if (!destination) {
        onSnapChange('full');
      }
    } else {
      onSelectDestination(landmark);
      setSearchQuery('');
      onSnapChange('half');
    }
  };

  const cycleSnap = () => {
    if (snap === 'collapsed') onSnapChange('half');
    else if (snap === 'half') onSnapChange('full');
    else onSnapChange('collapsed');
  };

  // Mobile sheet height classes
  const mobileHeightClass =
    snap === 'collapsed'
      ? 'h-[144px]'
      : snap === 'half'
      ? 'h-[54dvh] min-h-[380px]'
      : 'h-[82dvh]';

  return (
    <section
      aria-label="Ride booking sheet"
      className={`fixed bottom-0 left-0 right-0 z-[500] bg-white rounded-t-3xl shadow-[0_-8px_32px_rgba(17,24,39,0.16)] border-t border-gray-200 transition-[height] duration-200 ease-out flex flex-col lg:static lg:h-full lg:w-[420px] lg:shrink-0 lg:rounded-none lg:border-t-0 lg:border-r lg:shadow-none ${mobileHeightClass}`}
    >
      {/* Mobile drag/snap handle */}
      <div className="lg:hidden flex items-center justify-between px-5 pt-2.5 pb-1 shrink-0">
        <span className="text-xs font-medium text-gray-500 tabular-nums">
          {onlineDriverCount} verified riders nearby
        </span>
        <button
          type="button"
          onClick={cycleSnap}
          aria-label="Toggle booking drawer height"
          className="h-8 w-16 flex items-center justify-center cursor-pointer"
        >
          <span className="h-1.5 w-10 rounded-full bg-gray-300" />
        </button>
        <button
          type="button"
          onClick={() => onSnapChange(snap === 'full' ? 'half' : 'full')}
          className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-0.5 cursor-pointer py-1"
        >
          {snap === 'full' ? (
            <>
              <span>Map</span>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          ) : (
            <>
              <span>Expand</span>
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Book an Okada</h2>
          <p className="text-xs text-gray-500">
            Abeokuta Grid · {onlineDriverCount} verified riders active
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Dual Helmet
        </span>
      </div>

      {/* Pickup & Destination Controls */}
      <div className="px-5 lg:px-6 pt-2 pb-3 space-y-2.5 shrink-0">
        <div className="grid grid-cols-1 gap-2">
          {/* Pickup selector */}
          <button
            type="button"
            onClick={() => {
              setActiveField('pickup');
              if (snap === 'collapsed') onSnapChange('full');
            }}
            className={`w-full min-h-[46px] flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
              activeField === 'pickup' && snap === 'full'
                ? 'border-emerald-600 bg-emerald-50/40'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <Navigation className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-gray-500">Pickup Junction</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {pickup ? pickup.name : 'Select pickup landmark'}
              </p>
            </div>
          </button>

          {/* Destination selector */}
          {snap !== 'collapsed' && (
            <button
              type="button"
              onClick={() => {
                setActiveField('destination');
                if (snap !== 'full') onSnapChange('full');
              }}
              className={`w-full min-h-[46px] flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                activeField === 'destination' && snap === 'full'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <MapPin className="h-4 w-4 text-gray-900 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-gray-500">Where to?</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {destination ? destination.name : 'Search Panseke, FUNAAB, Kuto...'}
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Search input when expanded */}
        {(snap === 'full' || !destination) && snap !== 'collapsed' && (
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (snap !== 'full') onSnapChange('full');
              }}
              placeholder={`Search ${activeField === 'pickup' ? 'pickup' : 'destination'} junction in Abeokuta`}
              className="w-full min-h-[44px] rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Scrollable Body: Fare Estimate OR Landmark List */}
      <div className="flex-1 overflow-y-auto px-5 lg:px-6 pb-4 space-y-4">
        {/* Upfront Fare & Payment Selector when route is complete */}
        {estimate && snap !== 'full' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Standard Okada Fare</p>
                  <p className="mt-0.5 text-2xl font-extrabold font-mono tabular-nums text-gray-900">
                    {formatNaira(estimate.fareNaira)}
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="inline-flex items-center justify-end gap-1 text-xs font-semibold text-emerald-700 font-mono tabular-nums">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {estimate.etaMinutes} min ETA
                  </p>
                  <p className="text-xs text-gray-500 font-mono tabular-nums">
                    {estimate.distanceKm.toFixed(2)} km · Base ₦300 + ₦120/km
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Toggle: Cash vs Paystack */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Payment Method</p>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100 border border-gray-200">
                <button
                  type="button"
                  onClick={() => onPaymentMethodChange('cash')}
                  className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    paymentMethod === 'cash'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Banknote className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPaymentMethodChange('paystack')}
                  className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    paymentMethod === 'paystack'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>Paystack / USSD</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Landmark Results */}
        {(snap === 'full' || !estimate) && snap !== 'collapsed' && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              {searchQuery ? 'Matching Junctions' : 'Popular Abeokuta Junctions'}
            </p>
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
              {filteredLandmarks.map((landmark) => {
                const isSelectedPickup = pickup?.id === landmark.id;
                const isSelectedDest = destination?.id === landmark.id;
                return (
                  <button
                    key={landmark.id}
                    type="button"
                    onClick={() => handleLandmarkPick(landmark)}
                    className="w-full min-h-[56px] flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelectedPickup
                            ? 'bg-emerald-600 text-white'
                            : isSelectedDest
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {landmark.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {landmark.area} · {landmark.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 shrink-0">
                      {isSelectedPickup ? 'Pickup' : isSelectedDest ? 'Dropoff' : 'Select'}
                    </span>
                  </button>
                );
              })}
              {filteredLandmarks.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">
                  No matching junction found in Abeokuta. Try Panseke, Kuto, or FUNAAB.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Request CTA */}
      {snap !== 'collapsed' && (
        <div className="p-4 lg:px-6 border-t border-gray-100 bg-white shrink-0">
          {pickup && destination && pickup.id === destination.id ? (
            <p className="text-xs font-medium text-amber-700 text-center py-2">
              Pickup and destination cannot be the same junction.
            </p>
          ) : (
            <button
              type="button"
              disabled={!estimate}
              onClick={onRequestRide}
              className="w-full min-h-[52px] rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {estimate
                ? `Request Okada · ${formatNaira(estimate.fareNaira)}`
                : 'Select Pickup & Destination'}
            </button>
          )}
        </div>
      )}
    </section>
  );
};
