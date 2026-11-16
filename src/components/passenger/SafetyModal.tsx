import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageCircle, ShieldAlert, X } from 'lucide-react';
import { DriverProfile, RideRecord } from '../../types';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: RideRecord | null;
  driver: DriverProfile | null;
  onTriggerSos: () => void;
  sosTriggered: boolean;
}

const HOLD_DURATION_MS = 2000;

export const SafetyModal: React.FC<SafetyModalProps> = ({
  isOpen,
  onClose,
  ride,
  driver,
  onTriggerSos,
  sosTriggered,
}) => {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const startHold = () => {
    if (sosTriggered) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / HOLD_DURATION_MS) * 100));
      setHoldProgress(pct);
      if (pct >= 100) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        setIsHolding(false);
        onTriggerSos();
      }
    }, 30);
  };

  const stopHold = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  const shareText = ride
    ? `OkadaGo Live Trip Safety Share:%0AFrom: ${ride.pickup.name}%0ATo: ${ride.destination.name}%0ARider: ${driver?.name ?? 'Assigning'} (${driver?.plateNumber ?? 'Pending'})%0ATrack Live: ${window.location.origin}/?track=${ride.id}`
    : `OkadaGo Safety Check-in from Abeokuta: ${window.location.origin}`;

  const whatsappUrl = `https://wa.me/?text=${shareText}`;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center bg-gray-950/65 p-0 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-toolkit-title"
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="safety-toolkit-title" className="text-lg font-bold text-gray-900">
                Trip Safety Toolkit
              </h2>
              <p className="text-xs text-gray-500">Abeokuta Rapid Response · 24/7 Ops Desk</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer"
            aria-label="Close safety toolkit"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* WhatsApp Live Share */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[52px] flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>Share Live Trip on WhatsApp</span>
          </a>

          {ride && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Route</span>
                <span>
                  {ride.pickup.name} → {ride.destination.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Rider &amp; Plate</span>
                <span className="font-mono font-semibold text-gray-900">
                  {driver ? `${driver.name} · ${driver.plateNumber}` : 'Matching nearby bike'}
                </span>
              </div>
            </div>
          )}

          {/* 2-second hold SOS button */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Emergency Distress Signal (hold for 2 seconds to alert Admin Ops)
            </p>
            {sosTriggered ? (
              <div className="w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                <span>SOS Active — Ops Dispatch Alerted</span>
              </div>
            ) : (
              <button
                type="button"
                onPointerDown={startHold}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                onPointerCancel={stopHold}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') startHold();
                }}
                onKeyUp={stopHold}
                className="relative w-full min-h-[56px] overflow-hidden rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white select-none cursor-pointer active:scale-[0.99] transition-transform"
              >
                <span
                  className="absolute inset-y-0 left-0 bg-red-800/70 transition-[width] duration-75"
                  style={{ width: `${holdProgress}%` }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {isHolding
                      ? `Holding SOS (${Math.ceil((100 - holdProgress) / 50)}s)...`
                      : 'Hold 2s for Emergency SOS'}
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
