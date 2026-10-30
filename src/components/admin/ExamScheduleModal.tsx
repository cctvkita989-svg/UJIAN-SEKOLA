import React, { useState, useEffect, useMemo } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  X,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  KeyRound,
  Play,
  Square,
  Layers,
  ShieldAlert,
  Users,
  UserCheck,
  Shuffle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Exam, RoomProctorAssignment } from '../../types/cbt';

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

  // 1. Guru Mata Pelajaran (1 Guru Mapel per jadwal ujian)
  const [selectedGuruMapel, setSelectedGuruMapel] = useState('');

  // 2. Pemilihan Kelas Target (Bisa pilih beberapa kelas sendiri)
  const [selectedTingkat, setSelectedTingkat] = useState<'VII' | 'VIII' | 'IX'>('IX');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['IX-1', 'IX-2', 'IX-3']);

  // 3. Guru Pengawas Ruangan (Terpisah dari Guru Mapel, bisa acak per ruang kelas)
  const [proctorAssignmentMode, setProctorAssignmentMode] = useState<'acak_ruang' | 'pengawas_tunggal'>('acak_ruang');
  const [singleProctorName, setSingleProctorName] = useState('');
  const [roomProctors, setRoomProctors] = useState<RoomProctorAssignment[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    examCategory: 'PAS' as 'PTS' | 'PAS' | 'US',
    subject: '',
    gradeLevel: 'Kelas IX (IX-1 s/d IX-3)',
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

  // Helper untuk mendapatkan ringkasan nama kelas yang dipilih
  const getClassesSummary = (classList: string[]): string => {
    if (!classList || classList.length === 0) return 'Belum ada kelas';
    if (classList.length === 1) return `Kelas ${classList[0]}`;
    // Jika berurutan
    const sorted = [...classList].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return `Kelas ${sorted[0]} s/d ${sorted[sorted.length - 1]} (${sorted.length} Kelas)`;
  };

  // Helper untuk toggle pilihan kelas
  const handleToggleClass = (className: string) => {
    let updated: string[];
    if (selectedClasses.includes(className)) {
      if (selectedClasses.length === 1) return; // minimal 1 kelas
      updated = selectedClasses.filter(c => c !== className);
    } else {
      updated = [...selectedClasses, className].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }
    setSelectedClasses(updated);

    // Auto-update judul dan proctors
    const summary = getClassesSummary(updated);
    const shortLabel = updated.length <= 4 ? updated.join(', ') : `${updated[0]} - ${updated[updated.length - 1]}`;
    setFormData(prev => ({
      ...prev,
      gradeLevel: summary,
      title: `${prev.examCategory} - ${prev.subject || 'Ujian'} (${shortLabel})`,
    }));

    handleRandomizeProctors(updated, selectedGuruMapel ? [selectedGuruMapel] : []);
  };

  // Preset Cepat Pemilihan Kelas
  const handleApplyClassPreset = (preset: '1-3' | '4-6' | '7-10' | 'ALL') => {
    const tingkatPrefix = selectedTingkat;
    const available = classes
      .map(c => c.name)
      .filter(n => n.startsWith(`${tingkatPrefix}-`))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    let newClasses: string[] = [];
    if (preset === '1-3') {
      newClasses = available.filter(n => {
        const num = parseInt(n.split('-')[1] || '0', 10);
        return num >= 1 && num <= 3;
      });
    } else if (preset === '4-6') {
      newClasses = available.filter(n => {
        const num = parseInt(n.split('-')[1] || '0', 10);
        return num >= 4 && num <= 6;
      });
    } else if (preset === '7-10') {
      newClasses = available.filter(n => {
        const num = parseInt(n.split('-')[1] || '0', 10);
        return num >= 7 && num <= 10;
      });
    } else {
      newClasses = available;
    }

    if (newClasses.length === 0) newClasses = available.slice(0, 3);
    setSelectedClasses(newClasses);

    const summary = getClassesSummary(newClasses);
    const shortLabel = newClasses.length <= 4 ? newClasses.join(', ') : `${newClasses[0]} - ${newClasses[newClasses.length - 1]}`;
    setFormData(prev => ({
      ...prev,
      gradeLevel: summary,
      title: `${prev.examCategory} - ${prev.subject || 'Ujian'} (${shortLabel})`,
    }));

    handleRandomizeProctors(newClasses, selectedGuruMapel ? [selectedGuruMapel] : []);
  };

  // Helper untuk mengacak penugasan pengawas ke masing-masing kelas yang dipilih
  const handleRandomizeProctors = (classListToUse?: string[], currentMapelTeachers: string[] = []) => {
    const targetClassNames = classListToUse && classListToUse.length > 0 ? classListToUse : selectedClasses;
    const targetClassList = classes.filter(c => targetClassNames.includes(c.name));
    const effectiveList = targetClassList.length > 0 ? targetClassList : targetClassNames.map(name => ({ name, ruangLab: `Ruang Kelas ${name}` }));

    // Hindari menugaskan Guru Mapel pembuat soal sebagai pengawas di ruangan jika ada guru lain
    const excludedMapel = currentMapelTeachers.length > 0 ? currentMapelTeachers : (selectedGuruMapel ? [selectedGuruMapel] : []);
    const candidateTeachers = teachers.filter(t => !excludedMapel.includes(t.name));
    const pool = candidateTeachers.length > 0 ? candidateTeachers : (teachers.length > 0 ? teachers : [{ name: 'Bpk. Hendra Saputra, M.Pd' }]);

    // Acak pool pengawas
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    const assignments: RoomProctorAssignment[] = effectiveList.map((cls, idx) => {
      const assignedTeacher = shuffled[idx % shuffled.length];
      return {
        room: (cls as any).ruangLab || `Ruang Kelas ${cls.name}`,
        proctorName: assignedTeacher?.name || 'Bpk. Hendra Saputra, M.Pd (Pengawas)',
      };
    });

    setRoomProctors(assignments);
  };

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

      // Populate Guru Mapel (1 Guru Mapel)
      const mapelName = examToEdit.subjectTeachers && examToEdit.subjectTeachers.length > 0
        ? examToEdit.subjectTeachers[0]
        : examToEdit.teacherName ? examToEdit.teacherName.split(',')[0].trim() : (teachers[0]?.name || 'Admin CBT');
      setSelectedGuruMapel(mapelName);

      // Populate Target Classes
      let initClasses: string[] = [];
      if (examToEdit.targetClasses && examToEdit.targetClasses.length > 0) {
        initClasses = examToEdit.targetClasses;
      } else if (examToEdit.gradeLevel.includes('IX')) {
        initClasses = ['IX-1', 'IX-2', 'IX-3'];
      } else if (examToEdit.gradeLevel.includes('VIII')) {
        initClasses = ['VIII-1', 'VIII-2', 'VIII-3'];
      } else {
        initClasses = ['VII-1', 'VII-2', 'VII-3'];
      }
      setSelectedClasses(initClasses);

      if (initClasses[0]?.startsWith('IX')) setSelectedTingkat('IX');
      else if (initClasses[0]?.startsWith('VIII')) setSelectedTingkat('VIII');
      else setSelectedTingkat('VII');

      // Populate Pengawas
      if (examToEdit.roomProctors && examToEdit.roomProctors.length > 0) {
        setProctorAssignmentMode('acak_ruang');
        setRoomProctors(examToEdit.roomProctors);
        setSingleProctorName(examToEdit.guruPengawas || teachers[1]?.name || 'Admin CBT');
      } else {
        setProctorAssignmentMode('pengawas_tunggal');
        setSingleProctorName(examToEdit.guruPengawas || teachers[1]?.name || teachers[0]?.name || 'Admin CBT');
        handleRandomizeProctors(initClasses, [mapelName]);
      }
    } else {
      // Default initial for new exam
      const defaultSub = subjects[0]?.name || 'Ilmu Pengetahuan Alam (IPA)';
      const defaultTeacher = teachers.find(t => t.mapel?.includes(defaultSub))?.name || teachers[0]?.name || 'Ibu Rina Melati, S.Si';

      setSelectedGuruMapel(defaultTeacher);
      setSelectedTingkat('IX');
      const defaultInitClasses = ['IX-1', 'IX-2', 'IX-3'];
      setSelectedClasses(defaultInitClasses);

      setProctorAssignmentMode('acak_ruang');
      setSingleProctorName(teachers.length > 1 ? teachers[1]?.name : 'Bpk. Hendra Saputra, M.Pd');

      const initialTitle = `PAS - ${defaultSub} (IX-1, IX-2, IX-3)`;

      setFormData({
        title: initialTitle,
        examCategory: 'PAS',
        subject: defaultSub,
        gradeLevel: 'Kelas IX (IX-1 s/d IX-3)',
        requiredAgama: '',
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

      handleRandomizeProctors(defaultInitClasses, [defaultTeacher]);
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

    const shortLabel = selectedClasses.length <= 4 ? selectedClasses.join(', ') : `${selectedClasses[0]} - ${selectedClasses[selectedClasses.length - 1]}`;
    const autoTitle = `${formData.examCategory} - ${newSubject} (${shortLabel})`;

    // Auto find subject's assigned teacher if any
    const foundSub = subjects.find(s => s.name === newSubject);
    if (foundSub && foundSub.guruPengampu) {
      setSelectedGuruMapel(foundSub.guruPengampu);
    }

    setFormData(prev => ({
      ...prev,
      subject: newSubject,
      requiredAgama: religion,
      title: autoTitle,
    }));
  };

  const handleCategoryChange = (cat: 'PTS' | 'PAS' | 'US') => {
    const shortLabel = selectedClasses.length <= 4 ? selectedClasses.join(', ') : `${selectedClasses[0]} - ${selectedClasses[selectedClasses.length - 1]}`;
    const autoTitle = `${cat} - ${formData.subject || 'Ujian'} (${shortLabel})`;
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

    // 1 Guru Mapel per jadwal ujian
    const finalGuruMapel = selectedGuruMapel.trim() || 'Admin CBT';

    // Tentukan pengawas
    const primaryProctor = proctorAssignmentMode === 'acak_ruang'
      ? (roomProctors[0]?.proctorName || singleProctorName || 'Pengawas Ruang Terjadwal')
      : (singleProctorName || 'Admin CBT');

    const finalRoomProctors = proctorAssignmentMode === 'acak_ruang' && roomProctors.length > 0
      ? roomProctors
      : undefined;

    const summaryGrade = getClassesSummary(selectedClasses);

    if (examToEdit) {
      updateExam(examToEdit.id, {
        title: formData.title.trim(),
        examCategory: formData.examCategory,
        subject: formData.subject,
        gradeLevel: summaryGrade,
        targetClasses: selectedClasses,
        requiredAgama: formData.requiredAgama || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationMinutes: Number(formData.durationMinutes) || 90,
        kkm: Number(formData.kkm) || 75,
        totalQuestions: Number(formData.totalQuestions) || 40,
        status: formData.status,
        teacherName: finalGuruMapel,
        subjectTeachers: [finalGuruMapel],
        guruPengawas: primaryProctor,
        roomProctors: finalRoomProctors,
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
        gradeLevel: summaryGrade,
        targetClasses: selectedClasses,
        requiredAgama: formData.requiredAgama || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationMinutes: Number(formData.durationMinutes) || 90,
        kkm: Number(formData.kkm) || 75,
        totalQuestions: Number(formData.totalQuestions) || 40,
        status: formData.status,
        createdByTeacherId: teachers.find(t => t.name === finalGuruMapel)?.id || teachers[0]?.id || 'admin-01',
        teacherName: finalGuruMapel,
        subjectTeachers: [finalGuruMapel],
        guruPengawas: primaryProctor,
        roomProctors: finalRoomProctors,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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

            {/* SEKSI GURU MAPEL (HANYA 1 GURU MAPEL PER JADWAL ROMBEL) */}
            <div className="pt-2 border-t border-purple-200/70 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-700" />
                  <span>Guru Mata Pelajaran (Pembuat / Pengampu)</span>
                </label>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  1 Guru Mapel per Jadwal Rombel
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pilih 1 Guru Mapel penanggung jawab soal untuk rombel kelas yang dipilih di bawah. Jika 1 mapel diajar guru berbeda (misal IPA IX-1 s/d IX-3 oleh Guru A, IX-4 s/d IX-6 oleh Guru B), buat jadwal baru terpisah.
              </p>

              <div>
                <select
                  value={selectedGuruMapel}
                  onChange={e => {
                    const newTeacher = e.target.value;
                    setSelectedGuruMapel(newTeacher);
                    handleRandomizeProctors(selectedClasses, [newTeacher]);
                  }}
                  className="w-full px-3 py-2 text-xs border border-purple-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold text-slate-800 shadow-2xs"
                >
                  <option value="">-- Pilih Guru Mapel --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.mapel || 'Guru Mata Pelajaran'})
                    </option>
                  ))}
                  <option value="Admin CBT">Admin CBT</option>
                </select>
              </div>
            </div>

            {/* SEKSI PILIH BEBERAPA KELAS TARGET (CUSTOM MULTI-KELAS) */}
            <div className="pt-3 border-t border-purple-200/70 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Pilih Rombel / Kelas Target Ujian</span>
                </label>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                  {selectedClasses.length} Kelas Dipilih
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pilih sendiri kombinasi kelas untuk guru ini. Siswa di luar kelas yang dipilih tidak akan melihat ujian ini.
              </p>

              {/* Tingkat Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
                {(['VII', 'VIII', 'IX'] as const).map(tingkat => (
                  <button
                    key={tingkat}
                    type="button"
                    onClick={() => {
                      setSelectedTingkat(tingkat);
                      // Jika kelas yang dipilih belum ada di tingkat ini, auto apply preset 1-3
                      const hasClassInTingkat = selectedClasses.some(c => c.startsWith(`${tingkat}-`));
                      if (!hasClassInTingkat) {
                        const available = classes
                          .map(c => c.name)
                          .filter(n => n.startsWith(`${tingkat}-`))
                          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
                        const defaultThree = available.slice(0, 3);
                        if (defaultThree.length > 0) {
                          setSelectedClasses(defaultThree);
                          const summary = getClassesSummary(defaultThree);
                          const shortLabel = defaultThree.join(', ');
                          setFormData(prev => ({
                            ...prev,
                            gradeLevel: summary,
                            title: `${prev.examCategory} - ${prev.subject || 'Ujian'} (${shortLabel})`,
                          }));
                          handleRandomizeProctors(defaultThree, selectedGuruMapel ? [selectedGuruMapel] : []);
                        }
                      }
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      selectedTingkat === tingkat
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kelas {tingkat}
                  </button>
                ))}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-slate-500 mr-1">Preset Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleApplyClassPreset('1-3')}
                  className="px-2 py-1 text-[11px] font-semibold rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs"
                >
                  📌 {selectedTingkat}-1 s/d {selectedTingkat}-3
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyClassPreset('4-6')}
                  className="px-2 py-1 text-[11px] font-semibold rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs"
                >
                  📌 {selectedTingkat}-4 s/d {selectedTingkat}-6
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyClassPreset('7-10')}
                  className="px-2 py-1 text-[11px] font-semibold rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs"
                >
                  📌 {selectedTingkat}-7 s/d {selectedTingkat === 'VII' ? 'VII-8' : `${selectedTingkat}-10`}
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyClassPreset('ALL')}
                  className="px-2 py-1 text-[11px] font-semibold rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer shadow-2xs"
                >
                  ✓ Semua Kelas {selectedTingkat}
                </button>
              </div>

              {/* Class Buttons Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 pt-1">
                {classes
                  .filter(c => c.name.startsWith(`${selectedTingkat}-`))
                  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                  .map(cls => {
                    const isSelected = selectedClasses.includes(cls.name);
                    return (
                      <button
                        key={cls.id || cls.name}
                        type="button"
                        onClick={() => handleToggleClass(cls.name)}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{cls.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
              </div>

              {/* Ringkasan Kelas Terpilih */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-indigo-900">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Kelas Terpilih ({selectedClasses.length}):{' '}
                    <strong className="font-bold text-indigo-950">
                      {selectedClasses.length > 0 ? selectedClasses.join(', ') : 'Belum memilih kelas'}
                    </strong>
                  </span>
                </div>
                <span className="text-[11px] text-indigo-700 font-semibold">
                  {selectedClasses.length} Ruang Ujian
                </span>
              </div>
            </div>

            {/* SEKSI GURU PENGAWAS RUANGAN (BISA ACAK PER KELAS / RUANG) */}
            <div className="pt-3 border-t border-purple-200/70 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Guru Pengawas Ruangan Ujian</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setProctorAssignmentMode('acak_ruang')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      proctorAssignmentMode === 'acak_ruang'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🎲 Acak per Ruang Kelas
                  </button>
                  <button
                    type="button"
                    onClick={() => setProctorAssignmentMode('pengawas_tunggal')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      proctorAssignmentMode === 'pengawas_tunggal'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    👤 Pengawas Tunggal
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Pengawas ruangan ditugaskan terpisah dari Guru Mapel dan ditempatkan di kelas-kelas ujian.
              </p>

              {proctorAssignmentMode === 'acak_ruang' ? (
                <div className="bg-white border border-emerald-200/80 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Penugasan Pengawas per Ruang Kelas ({roomProctors.length} Ruang)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRandomizeProctors()}
                      className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                      title="Acak ulang penugasan guru pengawas ke seluruh kelas"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>🎲 Acak Ulang Pengawas</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {roomProctors.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="font-semibold text-slate-700 shrink-0 text-[11px]">
                          {item.room}
                        </span>
                        <select
                          value={item.proctorName}
                          onChange={e => {
                            const newProctor = e.target.value;
                            setRoomProctors(prev =>
                              prev.map((r, i) => (i === idx ? { ...r, proctorName: newProctor } : r))
                            );
                          }}
                          className="px-2 py-1 text-[11px] border border-slate-300 rounded bg-white text-slate-800 font-medium outline-none truncate max-w-[150px]"
                        >
                          {teachers.map(t => (
                            <option key={t.id} value={t.name}>
                              {t.name}
                            </option>
                          ))}
                          <option value="Admin CBT">Admin CBT</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Pilih Guru Pengawas Utama:
                  </label>
                  <select
                    value={singleProctorName}
                    onChange={e => setSingleProctorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  >
                    <option value="">-- Pilih Guru Pengawas --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.mapel || 'Guru'})
                      </option>
                    ))}
                    <option value="Admin CBT">Admin CBT</option>
                  </select>
                </div>
              )}
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
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
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
