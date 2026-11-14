import React, { useState } from 'react';
import { Smartphone, Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, isExambroOrWebView, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || isExambroOrWebView) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-1.5 text-[11px] sm:text-xs' : 'px-3.5 py-2 text-xs'
        }`}
        title="Pasang Aplikasi CBT di HP atau Komputer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{compact ? 'Install App' : 'Pasang Aplikasi CBT'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            compact ? 'px-2.5 py-1.5 text-[11px] sm:text-xs' : 'px-3.5 py-2 text-xs'
          }`}
          title="Panduan pasang aplikasi di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Pasang Aplikasi di iPhone / iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4 leading-relaxed">
                <li>
                  Ketuk tombol <strong>Bagikan (Share)</strong> pada bilah Safari di bagian bawah/atas layar.
                </li>
                <li>
                  Gulir ke bawah lalu pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
                </li>
                <li>
                  Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
