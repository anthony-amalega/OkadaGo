import React, { useState } from 'react';
import { Check, Copy, Lock, PlusCircle, Power, Wallet } from 'lucide-react';
import { DriverProfile } from '../../types';
import { formatNaira, MIN_DRIVER_WALLET_THRESHOLD } from '../../utils/pricing';

interface WalletCardProps {
  driver: DriverProfile;
  onToggleOnline: () => void;
  onTopUp: (amount: number) => void;
  lockError: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  driver,
  onToggleOnline,
  onTopUp,
  lockError,
}) => {
  const [copied, setCopied] = useState(false);
  const isLocked = driver.walletBalance < MIN_DRIVER_WALLET_THRESHOLD;

  const copyAccount = () => {
    void navigator.clipboard?.writeText(driver.virtualAccountNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      {/* Master Online/Offline Toggle */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-xs font-semibold text-gray-500">Duty Status</p>
          <p className="mt-0.5 text-lg font-extrabold text-gray-900">
            {driver.isOnline ? 'ONLINE · Ready for Trips' : 'OFFLINE · Not Receiving'}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleOnline}
          disabled={isLocked && !driver.isOnline}
          className={`min-h-[56px] min-w-[144px] flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition-colors cursor-pointer disabled:cursor-not-allowed ${
            driver.isOnline
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : isLocked
              ? 'bg-gray-200 text-gray-500'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isLocked && !driver.isOnline ? (
            <Lock className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Power className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{driver.isOnline ? 'GO OFFLINE' : 'GO ONLINE'}</span>
        </button>
      </div>

      {lockError && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
          {lockError}
        </div>
      )}

      {isLocked && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs font-semibold text-red-800">
          Account auto-locked: Wallet balance ({formatNaira(driver.walletBalance)}) dropped below -₦200. Top up to unlock dispatch.
        </div>
      )}

      {/* Wallet Balance & Virtual Bank Account */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Wallet className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span>Rider Wallet Balance</span>
          </div>
          <p
            className={`mt-1 text-3xl font-extrabold font-mono tabular-nums ${
              driver.walletBalance < 0 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {formatNaira(driver.walletBalance)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            15% commission auto-deducted on cash rides
          </p>
        </div>

        <div className="rounded-xl bg-gray-900 p-3.5 text-white space-y-2">
          <p className="text-[11px] font-medium text-gray-400">
            {driver.virtualBankName}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-base font-bold tracking-wider tabular-nums">
              {driver.virtualAccountNumber}
            </span>
            <button
              type="button"
              onClick={copyAccount}
              className="min-h-[36px] inline-flex items-center gap-1 rounded-lg bg-gray-800 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-gray-700 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => onTopUp(1000)}
            className="w-full min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Simulate ₦1,000 Top-Up</span>
          </button>
        </div>
      </div>
    </div>
  );
};
