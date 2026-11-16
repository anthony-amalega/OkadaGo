import React, { useState } from 'react';
import { Phone, ShieldCheck, X, ArrowRight } from 'lucide-react';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (phone: string, name: string) => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneDigits, setPhoneDigits] = useState('8034567890');
  const [passengerName, setPassengerName] = useState('Chidi Okonkwo');
  const [otp, setOtp] = useState('482910');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneDigits.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Enter a valid 10-digit Nigerian mobile number.');
      return;
    }
    setError('');
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.replace(/\D/g, '').length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    setError('');
    const formatted = `+234${phoneDigits.replace(/\D/g, '').slice(-10)}`;
    onAuthenticated(formatted, passengerName.trim() || 'OkadaGo Rider');
    onClose();
  };

  const handleDemoBypass = () => {
    onAuthenticated('+2348091124578', passengerName.trim() || 'Chidi Okonkwo');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center bg-gray-950/60 p-0 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-700">Passenger Verification</p>
            <h2 id="auth-modal-title" className="mt-1 text-xl font-bold text-gray-900">
              {step === 'phone' ? 'Sign in with your phone' : 'Enter 6-digit OTP'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer"
            aria-label="Close sign in dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
            <div>
              <label htmlFor="passenger-name" className="block text-xs font-semibold text-gray-700">
                Full Name
              </label>
              <input
                id="passenger-name"
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="e.g. Chidi Okonkwo"
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm font-medium text-gray-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="ng-phone" className="block text-xs font-semibold text-gray-700">
                Nigerian Mobile Number
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-gray-300 focus-within:border-emerald-600 overflow-hidden bg-white">
                <span className="px-3.5 py-3 bg-gray-50 border-r border-gray-200 text-sm font-mono font-semibold text-gray-800 select-none">
                  +234
                </span>
                <input
                  id="ng-phone"
                  type="tel"
                  inputMode="numeric"
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(e.target.value)}
                  placeholder="8034567890"
                  className="w-full px-3.5 py-3 text-sm font-mono font-medium text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>Send Verification Code</span>
            </button>

            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleDemoBypass}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>One-Click Demo Login</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to{' '}
              <span className="font-mono font-semibold text-gray-900">
                +234{phoneDigits.replace(/\D/g, '').slice(-10)}
              </span>
              . Simulated code: <span className="font-mono font-bold text-emerald-700">482910</span>
            </p>

            <div>
              <label htmlFor="otp-code" className="block text-xs font-semibold text-gray-700">
                6-Digit Code
              </label>
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-xl font-mono font-bold tracking-[0.4em] text-gray-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="min-h-[48px] px-4 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <span>Verify &amp; Continue</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
