import React, { useState, useEffect } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  CheckCircle2,
  ArrowLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  Check,
  Award,
  Calendar,
  Clock,
  User,
  BookOpen,
  Info
} from 'lucide-react';

interface ExamResultViewProps {
  onBackToDashboard: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({ onBackToDashboard }) => {
  const {
    activeExamTaking,
    questions,
    isOnline,
    pendingOfflineSyncCount,
    syncPendingOfflineData,
  } = useCBT();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!activeExamTaking || !activeExamTaking.session) return null;

  const { exam, session } = activeExamTaking;
  const examQuestions = questions[exam.id] || [];
  const isPendingSync = session.isOfflineSynced === false || pendingOfflineSyncCount > 0;

  // Auto-sync when entering this screen if online and pending
  useEffect(() => {
    if (isOnline && isPendingSync && !isSyncing) {
      handleManualSync();
    }
  }, [isOnline]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncPendingOfflineData();
      if (res.success) {
        setSyncMessage({ type: 'success', text: res.message });
      } else {
        setSyncMessage({ type: 'error', text: res.message });
      }
    } catch {
      setSyncMessage({ type: 'error', text: 'Terjadi kesalahan saat menyinkronkan data ke server.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Siswa</span>
        </button>

        {/* Network & Sync indicator badge */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Wifi className="w-3.5 h-3.5" /> Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              <WifiOff className="w-3.5 h-3.5" /> Offline
            </span>
          )}

          {isPendingSync ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Menunggu Sinkronisasi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersinkron ke Server
            </span>
          )}
        </div>
      </div>

      {/* OFFLINE / PENDING SYNC ACTION CARD */}
      {isPendingSync && (
        <div className="p-4 bg-amber-50/90 border-2 border-amber-300 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <span>Jawaban Tersimpan di Perangkat Ini (Mode Offline)</span>
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Seluruh {examQuestions.length} butir jawaban Anda telah tersimpan secara aman di penyimpanan perangkat ini.
                {isOnline
                  ? ' Koneksi internet sudah aktif kembali, silakan klik tombol sinkronkan untuk mengirim jawaban ke server pengawas.'
                  : ' Begitu perangkat Anda terhubung kembali ke internet, jawaban akan langsung terkirim otomatis atau Anda dapat menekan tombol sinkronkan di samping.'}
              </p>
              {syncMessage && (
                <p className={`text-[11px] font-semibold mt-1.5 ${syncMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {syncMessage.text}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Jawaban ke Server'}</span>
          </button>
        </div>
      )}

      {/* Main Congratulations Card */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 text-center shadow-sm space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-50 flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/80 inline-block">
            Konfirmasi Pengumpulan Ujian
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Selamat, Anda Telah Menyelesaikan Ujian!
          </h1>
          <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Seluruh lembar jawaban untuk mata pelajaran <strong className="text-stone-900">{exam.subject}</strong> telah berhasil dikumpulkan dan tersimpan aman di sistem.
          </p>
        </div>

        {/* Exam Information Details Box */}
        <div className="max-w-md mx-auto p-5 bg-stone-50/80 border border-stone-200/80 rounded-2xl space-y-3 text-xs text-left">
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/60">
            <span className="text-stone-500 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-stone-400" />
              Mata Pelajaran
            </span>
            <span className="font-bold text-stone-900">{exam.subject}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/60">
            <span className="text-stone-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-stone-400" />
              Nama Peserta
            </span>
            <span className="font-semibold text-stone-800">{session.studentName}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/60">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-stone-400" />
              Waktu Pengumpulan
            </span>
            <span className="font-mono font-bold text-stone-800">
              {session.finishedAt || new Date().toLocaleTimeString('id-ID') + ' WIB'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Status Jawaban
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
              Tersimpan & Terverifikasi
            </span>
          </div>
        </div>

        {/* Notice for Answer Key & Score Publication */}
        <div className="max-w-lg mx-auto p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-start gap-3 text-left">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-indigo-950">
              Pemberitahuan Hasil & Kunci Jawaban
            </h4>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Untuk mengetahui perolehan nilai serta pembahasan jawaban yang benar dan salah, admin akan mempublikasikannya melalui <strong>Menu Nilai & Hasil</strong> setelah seluruh rangkaian asesmen selesai dilaksanakan.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xs mx-auto">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="w-full py-3 px-6 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Siswa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
