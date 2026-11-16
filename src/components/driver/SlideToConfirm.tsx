import React, { useRef, useState } from 'react';
import { ChevronsRight } from 'lucide-react';

interface SlideToConfirmProps {
  label: string;
  onConfirm: () => void;
  variant?: 'emerald' | 'amber' | 'charcoal';
}

export const SlideToConfirm: React.FC<SlideToConfirmProps> = ({
  label,
  onConfirm,
  variant = 'emerald',
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragPct, setDragPct] = useState(0);
  const [dragging, setDragging] = useState(false);

  const bgClasses =
    variant === 'emerald'
      ? 'bg-emerald-600'
      : variant === 'amber'
      ? 'bg-amber-600'
      : 'bg-gray-900';

  const updateProgress = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const usable = rect.width - 56;
    const raw = (clientX - rect.left - 28) / Math.max(1, usable);
    const pct = Math.max(0, Math.min(1, raw));
    setDragPct(pct);
    return pct;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateProgress(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    updateProgress(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const finalPct = updateProgress(e.clientX);
    setDragging(false);
    if (finalPct >= 0.72) {
      setDragPct(0);
      onConfirm();
    } else {
      setDragPct(0);
    }
  };

  return (
    <div className="space-y-1.5">
      <div
        ref={trackRef}
        className={`relative h-[60px] w-full rounded-2xl ${bgClasses} p-1.5 select-none overflow-hidden shadow-md`}
      >
        <div
          className="absolute inset-y-0 left-0 bg-white/15 transition-[width] duration-75"
          style={{ width: `${Math.round(dragPct * 100)}%` }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-16">
          <span className="text-sm font-extrabold tracking-wide text-white uppercase whitespace-nowrap">
            {label}
          </span>
        </div>

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            setDragging(false);
            setDragPct(0);
          }}
          onDoubleClick={onConfirm}
          aria-label={label}
          className="relative z-10 h-12 w-12 rounded-xl bg-white text-gray-900 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          style={{
            transform: `translateX(${dragPct * 220}px)`,
            transition: dragging ? 'none' : 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <ChevronsRight className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Direct tap button fallback for quick one-hand or keyboard confirmation */}
      <button
        type="button"
        onClick={onConfirm}
        className="w-full min-h-[44px] rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50 cursor-pointer"
      >
        Tap to Confirm: {label}
      </button>
    </div>
  );
};
