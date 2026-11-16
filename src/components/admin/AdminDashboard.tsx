import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { OkadaGoState, rideService } from '../../services/rideService';
import { DriverProfile } from '../../types';
import { formatNaira } from '../../utils/pricing';
import { AvatarImg } from '../common/AvatarImg';
import { MapCanvas } from '../passenger/MapCanvas';
import { KycReviewModal } from './KycReviewModal';
import { LedgerTable } from './LedgerTable';

interface AdminDashboardProps {
  state: OkadaGoState;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ state }) => {
  const [selectedKycDriver, setSelectedKycDriver] = useState<DriverProfile | null>(null);
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const activeRidesCount = state.rides.filter((r) =>
    ['searching', 'matched', 'arrived', 'in_progress'].includes(r.status)
  ).length;

  const onlineVerifiedDriversCount = state.drivers.filter(
    (d) => d.isOnline && d.kycStatus === 'approved'
  ).length;

  const todaysGmv = state.ledger
    .filter((l) => l.type !== 'wallet_topup')
    .reduce((acc, l) => acc + l.grossFareNaira, 0);

  const openSosAlerts = state.sosAlerts.filter((s) => !s.resolved);

  const activeMapRide =
    state.rides.find((r) =>
      ['searching', 'matched', 'arrived', 'in_progress'].includes(r.status)
    ) ?? null;

  const filteredDrivers = state.drivers.filter((d) =>
    kycFilter === 'all' ? true : d.kycStatus === kycFilter
  );

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-gray-50 pb-12">
      {/* Flashing Red SOS Alert Banner when Passenger triggers SOS */}
      {openSosAlerts.length > 0 && (
        <div className="bg-red-600 text-white border-b border-red-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0 animate-bounce" aria-hidden="true" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider">
                  EMERGENCY SOS ALERT ACTIVE ({openSosAlerts.length})
                </p>
                <p className="text-sm font-semibold">
                  {openSosAlerts[0].driverName} ({openSosAlerts[0].plateNumber}) ·{' '}
                  {openSosAlerts[0].pickupName} → {openSosAlerts[0].destinationName} ·{' '}
                  <span className="font-mono">
                    {openSosAlerts[0].lat.toFixed(4)}, {openSosAlerts[0].lng.toFixed(4)}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => rideService.resolveSosAlert(openSosAlerts[0].id)}
              className="min-h-[42px] rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-red-700 hover:bg-red-50 cursor-pointer"
            >
              Dispatch Team &amp; Resolve SOS
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-700">
              Abeokuta Command Center · {state.backendMode === 'supabase' ? 'Supabase Live' : 'Demo Sync Mode'}
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold text-gray-900">
              OkadaGo Operations &amp; Safety Console
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-mono tabular-nums">
            Last sync: {new Date(state.lastSyncedAt).toLocaleTimeString()}
          </p>
        </div>

        {/* 4-Column KPI Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-semibold text-gray-500">Active Rides</p>
            <p className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-gray-900">
              {activeRidesCount}
            </p>
            <p className="mt-1 text-xs text-gray-500">Live dispatches in progress</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-semibold text-gray-500">Online Verified Drivers</p>
            <p className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-emerald-700">
              {onlineVerifiedDriversCount}
            </p>
            <p className="mt-1 text-xs text-gray-500">Dual-helmet compliant</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-semibold text-gray-500">Today&apos;s GMV</p>
            <p className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-gray-900">
              {formatNaira(todaysGmv)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Gross trip volume</p>
          </div>

          <div
            className={`rounded-2xl border p-4 sm:p-5 ${
              openSosAlerts.length > 0
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <p
              className={`text-xs font-semibold ${
                openSosAlerts.length > 0 ? 'text-red-700' : 'text-gray-500'
              }`}
            >
              Active SOS Alerts
            </p>
            <p
              className={`mt-2 text-3xl font-extrabold font-mono tabular-nums ${
                openSosAlerts.length > 0 ? 'text-red-700' : 'text-gray-900'
              }`}
            >
              {openSosAlerts.length}
            </p>
            <p
              className={`mt-1 text-xs ${
                openSosAlerts.length > 0 ? 'text-red-700 font-semibold' : 'text-gray-500'
              }`}
            >
              {openSosAlerts.length > 0 ? 'Immediate action needed' : 'All trips nominal'}
            </p>
          </div>
        </div>

        {/* Live Operations Map & KYC Approval Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Live Operations Map */}
          <div className="lg:col-span-5 rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Live Operations Map</h2>
                <p className="text-xs text-gray-500">
                  Abeokuta Fleet &amp; SOS Beacon Monitor
                </p>
              </div>
              {openSosAlerts.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700">
                  <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                  SOS Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Grid Clear
                </span>
              )}
            </div>
            <div className="h-[360px] lg:flex-1 min-h-[360px] w-full">
              <MapCanvas
                pickup={activeMapRide?.pickup ?? null}
                destination={activeMapRide?.destination ?? null}
                drivers={state.drivers}
                activeRide={activeMapRide}
                sosAlerts={state.sosAlerts}
              />
            </div>
          </div>

          {/* Driver KYC Approval Queue */}
          <div className="lg:col-span-7 rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-700" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-bold text-gray-900">Driver KYC Approval Queue</h2>
                  <p className="text-xs text-gray-500">
                    Inspect NIN, plate numbers, and dual-helmet compliance
                  </p>
                </div>
              </div>

              <div className="flex items-center p-1 rounded-lg bg-gray-100 border border-gray-200">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setKycFilter(status)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer transition-colors ${
                      kycFilter === status
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarImg
                      src={driver.photoUrl}
                      alt={driver.name}
                      className="h-11 w-11 rounded-xl border border-gray-200"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {driver.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {driver.plateNumber} · NIN {driver.nin.slice(0, 4)}••••{driver.nin.slice(-3)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        driver.kycStatus === 'approved'
                          ? 'text-emerald-700'
                          : driver.kycStatus === 'rejected'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {driver.kycStatus === 'approved' && (
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {driver.kycStatus === 'pending' && 'Pending Review'}
                      {driver.kycStatus === 'approved' && 'Verified'}
                      {driver.kycStatus === 'rejected' && 'Rejected'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedKycDriver(driver)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-100 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Inspect KYC</span>
                    </button>
                  </div>
                </div>
              ))}
              {filteredDrivers.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">
                  No riders in this KYC queue state.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Commission & Wallet Ledger Table */}
        <LedgerTable entries={state.ledger} />
      </div>

      {/* Split-Screen KYC Inspection Modal */}
      <KycReviewModal
        driver={selectedKycDriver}
        onClose={() => setSelectedKycDriver(null)}
        onApprove={(id) => rideService.reviewDriverKyc(id, 'approved')}
        onReject={(id) => rideService.reviewDriverKyc(id, 'rejected')}
      />
    </div>
  );
};
