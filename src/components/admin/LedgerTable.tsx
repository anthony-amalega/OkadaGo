import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { LedgerEntry } from '../../types';
import { formatNaira } from '../../utils/pricing';

interface LedgerTableProps {
  entries: LedgerEntry[];
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ entries }) => {
  const [filter, setFilter] = useState<'all' | 'cash' | 'paystack'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((item) => {
      if (filter !== 'all' && item.paymentMethod !== filter) return false;
      if (!q) return true;
      return (
        item.driverName.toLowerCase().includes(q) ||
        item.plateNumber.toLowerCase().includes(q) ||
        item.routeSummary.toLowerCase().includes(q) ||
        item.rideId.toLowerCase().includes(q)
      );
    });
  }, [entries, filter, query]);

  const exportCsv = () => {
    const headers = ['ID', 'Ride ID', 'Driver', 'Plate', 'Route', 'Method', 'Gross (NGN)', 'Commission 15% (NGN)', 'Net (NGN)', 'Timestamp'];
    const rows = filtered.map((e) => [
      e.id,
      e.rideId,
      e.driverName,
      e.plateNumber,
      `"${e.routeSummary}"`,
      e.paymentMethod,
      e.grossFareNaira,
      e.commissionNaira,
      e.driverNetNaira,
      e.createdAt,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'okadago-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Commission &amp; Wallet Ledger</h3>
          <p className="text-xs text-gray-500">
            15% platform commission splits across Cash and Paystack trips
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rider, plate, route..."
              className="min-h-[38px] rounded-lg border border-gray-300 bg-white pl-8 pr-3 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center p-1 rounded-lg bg-gray-100 border border-gray-200">
            {(['all', 'cash', 'paystack'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer transition-colors ${
                  filter === tab
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Rider &amp; Plate</th>
              <th className="py-3 px-4">Route / Description</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4 text-right">Gross Fare</th>
              <th className="py-3 px-4 text-right">15% Fee</th>
              <th className="py-3 px-4 text-right">Rider Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {filtered.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4 font-mono font-semibold text-gray-600 whitespace-nowrap">
                  {entry.rideId}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <p className="font-semibold text-gray-900">{entry.driverName}</p>
                  <p className="font-mono text-[11px] text-gray-500">{entry.plateNumber}</p>
                </td>
                <td className="py-3 px-4 text-gray-700 max-w-[260px] truncate">
                  {entry.routeSummary}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`font-semibold ${
                      entry.paymentMethod === 'paystack'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {entry.paymentMethod === 'paystack' ? 'Paystack' : 'Cash'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                  {formatNaira(entry.grossFareNaira)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700 tabular-nums whitespace-nowrap">
                  {formatNaira(entry.commissionNaira)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 tabular-nums whitespace-nowrap">
                  {formatNaira(entry.driverNetNaira)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-500">
                  No ledger entries match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
