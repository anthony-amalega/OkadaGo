import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[36px]"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Install PWA</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-100 hover:bg-gray-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[36px]"
        >
          <Share className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <h3 id="ios-install-title" className="text-base font-bold text-gray-900">
                  Install OkadaGo on iPhone
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
                  aria-label="Close install instructions"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-4 space-y-2.5 text-sm text-gray-600">
                <li>
                  1. Tap the <strong className="text-gray-900">Share</strong> button in the Safari toolbar.
                </li>
                <li>
                  2. Scroll down and select <strong className="text-gray-900">Add to Home Screen</strong>.
                </li>
                <li>
                  3. Tap <strong className="text-gray-900">Add</strong> to launch OkadaGo fullscreen.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
