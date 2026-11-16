import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PWAInstallButton } from './components/common/PWAInstallButton';
import { DriverCockpit } from './components/driver/DriverCockpit';
import { PassengerView } from './components/passenger/PassengerView';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { OkadaGoState, rideService } from './services/rideService';
import { AppRole } from './types';

export default function App() {
  const [role, setRole] = useState<AppRole>('passenger');
  const [state, setState] = useState<OkadaGoState>(() => rideService.getState());
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const unsubscribe = rideService.subscribe(setState);
    return unsubscribe;
  }, []);

  const openSosCount = state.sosAlerts.filter((a) => !a.resolved).length;

  return (
    <div className="min-h-dvh w-full flex flex-col bg-gray-50 text-gray-900">
      {/* Compact 56px Top Role Switcher & Brand Bar */}
      <header className="sticky top-0 z-[900] h-14 w-full bg-[#111827] text-white border-b border-gray-800 px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-8 shrink-0">
        {/* Zone 1: Clean single-line brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setRole('passenger');
          }}
          className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Okada<span className="text-emerald-400">Go</span>
        </a>

        {/* Zone 2: Role Switcher */}
        <nav
          aria-label="Application Role Switcher"
          className="flex items-center gap-1 p-1 rounded-xl bg-gray-800 border border-gray-700 overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => setRole('passenger')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              role === 'passenger'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Passenger
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              role === 'driver'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Driver
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
              role === 'admin'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>Admin Ops</span>
            {openSosCount > 0 && (
              <span className="rounded bg-red-600 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white tabular-nums">
                {openSosCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: PWA Install CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 w-full">
        {role === 'passenger' && <PassengerView state={state} />}
        {role === 'driver' && <DriverCockpit state={state} />}
        {role === 'admin' && <AdminDashboard state={state} />}
      </main>

      {/* Global Offline Connectivity Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-[1300] flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg">
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          <span>Offline Mode — Cached shell &amp; queued actions active</span>
        </div>
      )}
    </div>
  );
}
