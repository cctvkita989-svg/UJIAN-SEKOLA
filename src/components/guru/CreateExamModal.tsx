import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, BookOpen } from 'lucide-react';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, addExam } = useCBT();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(currentUser.mapel || 'Matematika');
  const [gradeLevel, setGradeLevel] = useState('Kelas XII - MIPA');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [kkm, setKkm] = useState(75);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [showScoreImmediate, setShowScoreImmediate] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    addExam({
      title: title.trim(),
      subject: subject.trim(),
      gradeLevel,
      durationMinutes,
      totalQuestions: 0,
      token: Math.random().toString(36).substring(2, 8).toUpperCase(),
      isTokenActive: true,
      startTime: '08:00',
      endTime: '12:00',
      status: 'ongoing',
      createdByTeacherId: currentUser.id,
      teacherName: currentUser.name,
      kkm,
      randomizeQuestions,
      randomizeOptions,
      showScoreImmediate,
      maxViolationsAllowed: 3,
    });

    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Buat Paket Ujian Baru</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Ujian *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Penilaian Harian Bersama - Bab Trigonometri"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mata Pelajaran
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sasaran Kelas
              </label>
              <select
                value={gradeLevel}
                onChange={e => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
              >
                <option value="Kelas XII - MIPA">Kelas XII - MIPA</option>
                <option value="Kelas XII - IPS">Kelas XII - IPS</option>
                <option value="Kelas XI - MIPA & IPS">Kelas XI - MIPA & IPS</option>
                <option value="Kelas X (Fase E)">Kelas X (Fase E)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Durasi Pengerjaan (Menit)
              </label>
              <input
                type="number"
                min={15}
                max={240}
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nilai KKM (Passing Grade)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={kkm}
                onChange={e => setKkm(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={randomizeQuestions}
                onChange={e => setRandomizeQuestions(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span>Acak Urutan Nomor Soal ke Peserta</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={randomizeOptions}
                onChange={e => setRandomizeOptions(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span>Acak Opsi Jawaban (A, B, C, D, E)</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showScoreImmediate}
                onChange={e => setShowScoreImmediate(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span>Tampilkan Skor Langsung ke Siswa setelah Selesai</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Buat Paket Ujian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
