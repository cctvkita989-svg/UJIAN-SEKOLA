import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CheckCircle2,
  Monitor,
  PenTool,
  Stethoscope,
  Mail,
  UserX,
} from 'lucide-react';
import { User, AttendanceStatus } from '../../types/cbt';

interface AttendanceStatusModalProps {
  isOpen: boolean;
  student: User | null;
  initialChoice?: AttendanceStatus;
  initialScore?: number;
  initialNotes?: string;
  onClose: () => void;
  onSave: (choice: AttendanceStatus, score?: number, notes?: string) => void;
}

export const AttendanceStatusModal: React.FC<AttendanceStatusModalProps> = ({
  isOpen,
  student,
  initialChoice = 'cbt',
  initialScore = 75,
  initialNotes = '',
  onClose,
  onSave,
}) => {
  const [choice, setChoice] = useState<AttendanceStatus>(initialChoice);
  const [score, setScore] = useState<number>(initialScore);
  const [notes, setNotes] = useState<string>(initialNotes);

  useEffect(() => {
    if (isOpen && student) {
      setChoice(initialChoice);
      setScore(initialScore);
      setNotes(initialNotes);
    }
  }, [isOpen, student, initialChoice, initialScore, initialNotes]);

  if (!isOpen || !student) return null;

  const attendanceOptions: Array<{
    id: AttendanceStatus;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accentClass: string;
    iconBgClass: string;
  }> = [
    {
      id: 'cbt',
      title: 'Ujian Online CBT (Normal)',
      subtitle: 'Mengerjakan ujian secara mandiri di gawai/komputer aplikasi CBT.',
      icon: Monitor,
      accentClass: 'border-blue-600 ring-1 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20',
      iconBgClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
    },
    {
      id: 'tertulis',
      title: 'Ujian Tertulis (Manual Paper)',
      subtitle: 'Mengerjakan lembar fisik kertas karena kendala perangkat gawai/jaringan.',
      icon: PenTool,
      accentClass: 'border-indigo-600 ring-1 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20',
      iconBgClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
    },
    {
      id: 'sakit',
      title: 'Sakit (Surat Dokter / Izin Medis)',
      subtitle: 'Tidak dapat hadir karena sakit, berhak mengikuti jadwal ujian susulan.',
      icon: Stethoscope,
      accentClass: 'border-amber-600 ring-1 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20',
      iconBgClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    },
    {
      id: 'izin',
      title: 'Izin Resmi (Dispensasi Sekolah)',
      subtitle: 'Mendapat izin resmi dari madrasah/sekolah untuk keperluan khusus.',
      icon: Mail,
      accentClass: 'border-sky-600 ring-1 ring-sky-500/20 bg-sky-50/40 dark:bg-sky-950/20',
      iconBgClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
    },
    {
      id: 'absen',
      title: 'Absen / Alpa (Tanpa Keterangan)',
      subtitle: 'Siswa tidak hadir tanpa kabar atau konfirmasi resmi pihak sekolah.',
      icon: UserX,
      accentClass: 'border-rose-600 ring-1 ring-rose-500/20 bg-rose-50/40 dark:bg-rose-950/20',
      iconBgClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
    },
  ];

  const handleSave = () => {
    onSave(choice, choice === 'tertulis' ? score : undefined, notes.trim());
    onClose();
  };

  const scorePresets = [60, 70, 75, 80, 85, 90, 100];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg my-auto bg-[#fdfdfc] dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-stone-200/80 dark:border-stone-800 flex items-start justify-between bg-white dark:bg-stone-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 tracking-tight">
                Ubah Status Kehadiran Siswa
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[200px]">
                  {student.name}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>Kelas {student.kelas}</span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="font-mono text-[11px]">NISN: {student.nisn || '-'}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors shrink-0"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
            Pilih Status Kehadiran Siswa:
          </label>

          <div className="space-y-2">
            {attendanceOptions.map(opt => {
              const isSelected = choice === opt.id;
              const IconComp = opt.icon;

              return (
                <div key={opt.id}>
                  <div
                    onClick={() => setChoice(opt.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? opt.accentClass
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50/70 dark:hover:bg-stone-850'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${opt.iconBgClass}`}>
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {opt.title}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-stone-300 dark:border-stone-600'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                        {opt.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Manual Score Input when 'tertulis' is active */}
                  {opt.id === 'tertulis' && isSelected && (
                    <div className="mt-2 ml-4 p-3.5 bg-stone-100/70 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                          Input Nilai Lembar Jawaban Tertulis:
                        </label>
                        <span className="font-mono font-bold text-xs text-indigo-700 dark:text-indigo-400">
                          Skor: {score} / 100
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={score}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setScore(Math.min(100, Math.max(0, isNaN(val) ? 0 : val)));
                          }}
                          className="w-24 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm font-bold font-mono text-stone-900 dark:text-stone-100 text-center outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                        />
                        <div className="flex flex-wrap items-center gap-1">
                          {scorePresets.map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setScore(preset)}
                              className={`px-2 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors ${
                                score === preset
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Nilai tertulis otomatis disinkronkan ke rekapitulasi nilai kelas & leger.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Notes field */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
              Catatan Proktor / Pengawas (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Surat dokter terlampir, tes susulan dijadwalkan Rabu"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
