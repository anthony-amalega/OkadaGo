import React, { useState } from 'react';
import { Camera, CheckCircle2, Clock, FileCheck2, ShieldAlert } from 'lucide-react';
import { DriverProfile } from '../../types';
import { AvatarImg } from '../common/AvatarImg';

interface KycFormProps {
  driver: DriverProfile;
  onSubmitKyc: (payload: {
    nin: string;
    ridersPermitId: string;
    plateNumber: string;
    bikeModel: string;
    helmetPhotoUrl?: string;
    photoUrl?: string;
  }) => void;
}

export const KycForm: React.FC<KycFormProps> = ({ driver, onSubmitKyc }) => {
  const [nin, setNin] = useState(driver.nin);
  const [permitId, setPermitId] = useState(driver.ridersPermitId);
  const [plateNumber, setPlateNumber] = useState(driver.plateNumber);
  const [bikeModel, setBikeModel] = useState(driver.bikeModel);
  const [selfiePreview, setSelfiePreview] = useState(driver.photoUrl);
  const [helmetPreview, setHelmetPreview] = useState(driver.helmetPhotoUrl);
  const [submittedBanner, setSubmittedBanner] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNin = nin.replace(/\D/g, '');
    if (cleanNin.length !== 11) {
      setError('Nigerian NIN must be exactly 11 digits.');
      return;
    }
    if (!plateNumber.trim() || !permitId.trim()) {
      setError('Plate number and Rider Permit ID are required.');
      return;
    }
    setError('');
    onSubmitKyc({
      nin: cleanNin,
      ridersPermitId: permitId.trim(),
      plateNumber: plateNumber.trim().toUpperCase(),
      bikeModel: bikeModel.trim(),
      helmetPhotoUrl: helmetPreview,
      photoUrl: selfiePreview,
    });
    setSubmittedBanner(true);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Rider Onboarding &amp; KYC</h2>
          <p className="text-xs text-gray-500">
            Ogun State Commercial Okada Verification · Dual-Helmet Compliance
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
            driver.kycStatus === 'approved'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : driver.kycStatus === 'rejected'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {driver.kycStatus === 'approved' && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          {driver.kycStatus === 'pending' && <Clock className="h-4 w-4" aria-hidden="true" />}
          {driver.kycStatus === 'rejected' && <ShieldAlert className="h-4 w-4" aria-hidden="true" />}
          <span>
            {driver.kycStatus === 'approved'
              ? 'Verified'
              : driver.kycStatus === 'rejected'
              ? 'Rejected'
              : 'Pending Ops Review'}
          </span>
        </div>
      </div>

      {submittedBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
          KYC packet submitted! Switch to the Admin Ops Dashboard to inspect and approve this rider.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 p-3.5 space-y-2.5">
            <p className="text-xs font-bold text-gray-700">1. Rider Selfie</p>
            <div className="flex items-center gap-3">
              <AvatarImg
                src={selfiePreview}
                alt="Rider selfie preview"
                className="h-16 w-16 rounded-xl border border-gray-200"
              />
              <label className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-100 cursor-pointer">
                <Camera className="h-4 w-4" aria-hidden="true" />
                <span>Upload Selfie</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setSelfiePreview)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-3.5 space-y-2.5">
            <p className="text-xs font-bold text-gray-700">2. Dual-Helmet Photo</p>
            <div className="flex items-center gap-3">
              <AvatarImg
                src={helmetPreview}
                alt="Dual helmet preview"
                className="h-16 w-20 rounded-xl border border-gray-200"
              />
              <label className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-100 cursor-pointer">
                <Camera className="h-4 w-4" aria-hidden="true" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setHelmetPreview)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kyc-nin" className="block text-xs font-semibold text-gray-700">
              11-Digit NIN
            </label>
            <input
              id="kyc-nin"
              type="text"
              inputMode="numeric"
              maxLength={11}
              value={nin}
              onChange={(e) => setNin(e.target.value)}
              className="mt-1.5 w-full min-h-[46px] rounded-xl border border-gray-300 px-3.5 py-2.5 font-mono text-sm font-semibold text-gray-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="kyc-permit" className="block text-xs font-semibold text-gray-700">
              Ogun Rider&apos;s Permit ID
            </label>
            <input
              id="kyc-permit"
              type="text"
              value={permitId}
              onChange={(e) => setPermitId(e.target.value)}
              className="mt-1.5 w-full min-h-[46px] rounded-xl border border-gray-300 px-3.5 py-2.5 font-mono text-sm font-semibold text-gray-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="kyc-plate" className="block text-xs font-semibold text-gray-700">
              Bike Plate Number
            </label>
            <input
              id="kyc-plate"
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className="mt-1.5 w-full min-h-[46px] rounded-xl border border-gray-300 px-3.5 py-2.5 font-mono text-sm font-bold uppercase text-gray-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="kyc-model" className="block text-xs font-semibold text-gray-700">
              Motorcycle Model
            </label>
            <input
              id="kyc-model"
              type="text"
              value={bikeModel}
              onChange={(e) => setBikeModel(e.target.value)}
              className="mt-1.5 w-full min-h-[46px] rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <FileCheck2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
          <span>Submit KYC for Admin Verification</span>
        </button>
      </form>
    </div>
  );
};
