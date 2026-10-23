import React, { useState, useEffect, useMemo } from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, Calendar, Clock, BookOpen, GraduationCap, KeyRound, Play, Square, Layers, ShieldAlert } from 'lucide-react';
import { Exam } from '../../types/cbt';

interface ExamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  examToEdit?: Exam | null; // null for creating new schedule
}

export const ExamScheduleModal: React.FC<ExamScheduleModalProps> = ({
  isOpen,
  onClose,
  examToEdit,
}) => {
  const { addExam, updateExam, subjects, classes, users } = useCBT();
  const teachers = useMemo(() => users.filter(u => u.role === 'guru'), [users]);

  const [formData, setFormData] = useState({
    title: '',
    examCategory: 'PAS' as 'PTS' | 'PAS' | 'US',
    subject: '',
    gradeLevel: 'Kelas VII',
    requiredAgama: '' as '' | 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu',
    startTime: '07:30',
    endTime: '09:00',
    durationMinutes: 90,
    kkm: 75,
    totalQuestions: 40,
    status: 'published' as 'draft' | 'published' | 'ongoing' | 'completed',
    teacherName: '',
    randomizeQuestions: true,
    randomizeOptions: true,
    maxViolationsAllowed: 3,
    token: 'PAS' + Math.floor(100 + Math.random() * 900),
  });

  // Populate form if editing or when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (examToEdit) {
      setFormData({
        title: examToEdit.title,
        examCategory: examToEdit.examCategory || 'PAS',
        subject: examToEdit.subject,
        gradeLevel: examToEdit.gradeLevel,
        requiredAgama: examToEdit.requiredAgama || '',
        startTime: examToEdit.startTime,
        endTime: examToEdit.endTime,
        durationMinutes: examToEdit.durationMinutes,
        kkm: examToEdit.kkm,
        totalQuestions: examToEdit.totalQuestions,
        status: examToEdit.status,
        teacherName: examToEdit.teacherName,
        randomizeQuestions: examToEdit.randomizeQuestions,
        randomizeOptions: examToEdit.randomizeOptions,
        maxViolationsAllowed: examToEdit.maxViolationsAllowed,
        token: examToEdit.token,
      });
    } else {
      // Default initial for new exam
      const defaultSub = subjects[0]?.name || 'Matematika';
      const defaultTeacher = teachers[0]?.name || 'Admin CBT';
      setFormData({
        title: `PAS Ganjil - ${defaultSub} VII`,
        examCategory: 'PAS',
        subject: defaultSub,
        gradeLevel: 'Kelas VII',
        requiredAgama: defaultSub.includes('Agama Islam')
          ? 'Islam'
          : defaultSub.includes('Agama Kristen')
          ? 'Kristen'
          : defaultSub.includes('Agama Katolik')
          ? 'Katolik'
          : defaultSub.includes('Agama Hindu')
          ? 'Hindu'
          : defaultSub.includes('Agama Buddha')
          ? 'Buddha'
          : defaultSub.includes('Agama Konghucu')
          ? 'Konghucu'
          : '',
        startTime: '07:30',
        endTime: '09:00',
        durationMinutes: 90,
        kkm: 75,
        totalQuestions: 40,
        status: 'published',
        teacherName: defaultTeacher,
        randomizeQuestions: true,
        randomizeOptions: true,
        maxViolationsAllowed: 3,
        token: 'PAS' + Math.floor(100 + Math.random() * 900),
      });
    }
  }, [isOpen, examToEdit]);

  // When subject changes, auto-adjust title and religion filter
  const handleSubjectChange = (newSubject: string) => {
    let religion: '' | 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu' = '';
    if (newSubject.includes('Islam')) religion = 'Islam';
    else if (newSubject.includes('Kristen')) religion = 'Kristen';
    else if (newSubject.includes('Katolik')) religion = 'Katolik';
    else if (newSubject.includes('Hindu')) religion = 'Hindu';
    else if (newSubject.includes('Buddha')) religion = 'Buddha';
    else if (newSubject.includes('Konghucu')) religion = 'Konghucu';

    const shortGrade = formData.gradeLevel.replace('Kelas ', '');
    const autoTitle = `${formData.examCategory} - ${newSubject} ${shortGrade}`;

    setFormData(prev => ({
      ...prev,
      subject: newSubject,
      requiredAgama: religion,
      title: autoTitle,
    }));
  };

  const handleCategoryChange = (cat: 'PTS' | 'PAS' | 'US') => {
    const shortGrade = formData.gradeLevel.replace('Kelas ', '');
    const autoTitle = `${cat} - ${formData.subject || 'Ujian'} ${shortGrade}`;
    const autoToken = cat + Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({
      ...prev,
      examCategory: cat,
      title: autoTitle,
      token: autoToken,
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) return;

    if (examToEdit) {
      updateExam(examToEdit.id, {
        title: formData.title.trim(),
        examCategory: formData.examCategory,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        requiredAgama: formData.requiredAgama || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationMinutes: Number(formData.durationMinutes) || 90,
        kkm: Number(formData.kkm) || 75,
        totalQuestions: Number(formData.totalQuestions) || 40,
        status: formData.status,
        teacherName: formData.teacherName || 'Admin CBT',
        randomizeQuestions: formData.randomizeQuestions,
        randomizeOptions: formData.randomizeOptions,
        maxViolationsAllowed: Number(formData.maxViolationsAllowed) || 3,
        token: formData.token.toUpperCase().trim(),
      });
    } else {
      addExam({
        title: formData.title.trim(),
        examCategory: formData.examCategory,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        requiredAgama: formData.requiredAgama || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationMinutes: Number(formData.durationMinutes) || 90,
        kkm: Number(formData.kkm) || 75,
        totalQuestions: Number(formData.totalQuestions) || 40,
        status: formData.status,
        createdByTeacherId: teachers[0]?.id || 'admin-01',
        teacherName: formData.teacherName || 'Admin CBT',
        randomizeQuestions: formData.randomizeQuestions,
        randomizeOptions: formData.randomizeOptions,
        showScoreImmediate: true,
        maxViolationsAllowed: Number(formData.maxViolationsAllowed) || 3,
        token: formData.token.toUpperCase().trim(),
        isTokenActive: true,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {examToEdit ? 'Ubah / Ganti Jadwal Ujian' : 'Buat Jadwal Ujian Terbaru'}
              </h3>
              <p className="text-xs text-slate-500">
                {examToEdit
                  ? `Atur waktu, jam pelaksanaan, atau hentikan ujian untuk ${examToEdit.subject}`
                  : '3 Tahapan: 1. Jenis Ujian → 2. Mata Pelajaran → 3. Jam & Durasi Ujian'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Jenis Ujian */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white inline-flex items-center justify-center text-[10px]">1</span>
              Jenis Ujian (PTS / PAS / US)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['PTS', 'PAS', 'US'] as const).map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    formData.examCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'PTS' && 'PTS (Tengah Semester)'}
                  {cat === 'PAS' && 'PAS (Akhir Semester)'}
                  {cat === 'US' && 'US (Ujian Sekolah)'}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Mata Pelajaran & Agama */}
          <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white inline-flex items-center justify-center text-[10px]">2</span>
              Pemilihan Mata Pelajaran & Filter Agama
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                <select
                  value={formData.subject}
                  onChange={e => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-medium"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Khusus Agama (Opsional)
                </label>
                <select
                  value={formData.requiredAgama}
                  onChange={e => setFormData({ ...formData, requiredAgama: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                >
                  <option value="">Semua Siswa (Umum / Non-Agama)</option>
                  <option value="Islam">Hanya Siswa Agama Islam</option>
                  <option value="Kristen">Hanya Siswa Agama Kristen</option>
                  <option value="Katolik">Hanya Siswa Agama Katolik</option>
                  <option value="Hindu">Hanya Siswa Agama Hindu</option>
                  <option value="Buddha">Hanya Siswa Agama Buddha</option>
                  <option value="Konghucu">Hanya Siswa Agama Konghucu</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sasaran Tingkat / Kelas</label>
                <select
                  value={formData.gradeLevel}
                  onChange={e => {
                    const newGrade = e.target.value;
                    const shortGrade = newGrade.replace('Kelas ', '');
                    setFormData(prev => ({
                      ...prev,
                      gradeLevel: newGrade,
                      title: `${prev.examCategory} - ${prev.subject} ${shortGrade}`,
                    }));
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                >
                  <option value="Kelas VII">Semua Kelas VII (VII-1 s/d VII-8)</option>
                  <option value="Kelas VIII">Semua Kelas VIII (VIII-1 s/d VIII-8)</option>
                  <option value="Kelas IX">Semua Kelas IX (IX-1 s/d IX-8)</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>
                      Rombel Spesifik: {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guru Pengawas / Pembuat</label>
                <select
                  value={formData.teacherName}
                  onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                >
                  <option value="Admin CBT">Admin CBT</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.mapel || 'Guru'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Jam, Durasi, dan Jadwal */}
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">3</span>
              Jadwal Waktu & Jam Pelaksanaan
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Mulai</label>
                <input
                  type="text"
                  required
                  placeholder="07:30"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Selesai</label>
                <input
                  type="text"
                  required
                  placeholder="09:00"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi (Menit)</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={240}
                  value={formData.durationMinutes}
                  onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">KKM Kelulusan</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.kkm}
                  onChange={e => setFormData({ ...formData, kkm: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimasi Butir Soal</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={formData.totalQuestions}
                  onChange={e => setFormData({ ...formData, totalQuestions: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Judul & Status Pelaksanaan (Berlangsung / Hentikan) */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Judul Paket Ujian
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Pelaksanaan Ujian
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className={`w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none ${
                    formData.status === 'ongoing'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : formData.status === 'completed'
                      ? 'bg-slate-100 border-slate-300 text-slate-700'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}
                >
                  <option value="published">Terjadwal (Siap diujikan)</option>
                  <option value="ongoing">Sedang Berlangsung (Siswa Buka Soal)</option>
                  <option value="completed">Dihentikan / Selesai</option>
                  <option value="draft">Draft (Disembunyikan)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  * Pilih <b>"Dihentikan / Selesai"</b> untuk menghentikan akses ujian bagi seluruh siswa.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Token Ujian (6 Karakter)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.token}
                    onChange={e => setFormData({ ...formData, token: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold tracking-wider border border-slate-300 rounded-lg outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        token: prev.examCategory + Math.floor(100 + Math.random() * 900),
                      }))
                    }
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
                  >
                    Acak
                  </button>
                </div>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.randomizeQuestions}
                  onChange={e => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Acak urutan nomor butir soal (Anti-Saling Lirik)
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.randomizeOptions}
                  onChange={e => setFormData({ ...formData, randomizeOptions: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Acak pilihan opsi jawaban A, B, C, D
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              {examToEdit ? 'Simpan Perubahan Jadwal' : 'Simpan & Terbitkan Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
