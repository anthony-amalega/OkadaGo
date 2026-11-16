import React from 'react';
import { CheckCircle2, ShieldAlert, X, XCircle } from 'lucide-react';
import { DriverProfile } from '../../types';
import { AvatarImg } from '../common/AvatarImg';

interface KycReviewModalProps {
  driver: DriverProfile | null;
  onClose: () => void;
  onApprove: (driverId: string) => void;
  onReject: (driverId: string) => void;
}

export const KycReviewModal: React.FC<KycReviewModalProps> = ({
  driver,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!driver) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kyc-review-title"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <p className="text-xs font-semibold text-gray-500">KYC Verification Packet</p>
            <h2 id="kyc-review-title" className="text-lg font-bold text-gray-900">
              {driver.name} · <span className="font-mono">{driver.plateNumber}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 cursor-pointer"
            aria-label="Close KYC modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Split-Screen Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Left: Visual Evidence */}
          <div className="p-6 space-y-4 bg-gray-50/50">
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Rider Portrait Selfie</p>
              <AvatarImg
                src={driver.photoUrl}
                alt={`${driver.name} selfie`}
                className="h-36 w-36 rounded-xl border border-gray-200"
              />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">
                Dual-Helmet Equipment Photo (2 Helmets Required)
              </p>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <img
                  src={driver.helmetPhotoUrl}
                  alt="Dual safety helmets on motorcycle"
                  referrerPolicy="no-referrer"
                  className="h-44 w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right: Identity & Vehicle Data */}
          <div className="p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-gray-500">11-Digit NIN</p>
                  <p className="mt-1 font-mono text-sm font-bold text-gray-900 tabular-nums">
                    {driver.nin}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-gray-500">Plate Number</p>
                  <p className="mt-1 font-mono text-sm font-bold text-gray-900">
                    {driver.plateNumber}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-gray-500">Ogun Rider Permit</p>
                  <p className="mt-1 font-mono text-xs font-bold text-gray-900">
                    {driver.ridersPermitId}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-gray-500">Motorcycle Model</p>
                  <p className="mt-1 text-xs font-bold text-gray-900">{driver.bikeModel}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-3.5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phone Contact</span>
                  <span className="font-mono font-semibold text-gray-900">{driver.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Current KYC Status</span>
                  <span className="font-bold uppercase text-gray-900">{driver.kycStatus}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onReject(driver.id);
                  onClose();
                }}
                className="min-h-[48px] flex items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 cursor-pointer"
              >
                {driver.kycStatus === 'rejected' ? (
                  <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                )}
                <span>Reject</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onApprove(driver.id);
                  onClose();
                }}
                className="min-h-[48px] flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Approve Rider</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
