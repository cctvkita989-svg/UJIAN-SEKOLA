import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg print:hidden">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Mode Offline — Jawaban tersimpan lokal & otomatis sinkron saat terhubung.</span>
    </div>
  );
};
