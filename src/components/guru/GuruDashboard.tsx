import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  BookOpen,
  CheckCircle2,
  Users,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Unlock,
  KeyRound,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { QuestionEditorModal } from './QuestionEditorModal';
import { CreateExamModal } from './CreateExamModal';
import { Exam, Question } from '../../types/cbt';

export const GuruDashboard: React.FC = () => {
  const {
    currentUser,
    exams,
    questions,
    examSessions,
    disciplineNotes,
    deleteQuestion,
    generateNewToken,
    toggleTokenActive,
    resetStudentSession,
    unlockStudent,
    deleteExam,
  } = useCBT();

  const [activeTab, setActiveTab] = useState<'bank' | 'proctor' | 'analysis' | 'discipline'>('bank');
  const [selectedExamId, setSelectedExamId] = useState<string>(
    exams.find(e => e.createdByTeacherId === currentUser.id)?.id || exams[0]?.id || ''
  );

  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);

  // Filter discipline notes for this teacher's subject
  const guruDisciplineNotes = disciplineNotes.filter(
    n =>
      !currentUser.mapel ||
      n.subject.toLowerCase().includes((currentUser.mapel || '').toLowerCase()) ||
      currentUser.role === 'admin'
  );

  // Filter exams for this teacher (or all exams if admin/demo)
  const teacherExams = exams.filter(
    e => e.createdByTeacherId === currentUser.id || currentUser.role === 'admin'
  );

  const currentExam = exams.find(e => e.id === selectedExamId) || teacherExams[0] || exams[0];
  const currentQuestions = currentExam ? questions[currentExam.id] || [] : [];

  // Proctoring stats for current exam
  const sessionsForCurrentExam = currentExam
    ? examSessions.filter(s => s.examId === currentExam.id)
    : [];
  const inProgressCount = sessionsForCurrentExam.filter(s => s.status === 'in_progress').length;
  const submittedCount = sessionsForCurrentExam.filter(s => s.status === 'submitted').length;
  const blockedCount = sessionsForCurrentExam.filter(s => s.status === 'blocked').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome & Teacher Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Panel Tenaga Pendidik
            </h1>
            <span className="text-xs font-semibold text-blue-700">
              · Guru {currentUser.mapel || 'Mata Pelajaran'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan butir soal, pengaturan paket penilaian, dan pengawasan langsung di ruang ujian
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateExamOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Buat Paket Ujian Baru
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Paket Ujian Saya</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {teacherExams.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Bank soal aktif tersimpan</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Butir Soal</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {currentQuestions.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Pada paket terpilih</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Siswa Sedang Tes</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700">
            {inProgressCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Pantauan real-time aktif</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sudah Mengumpulkan</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700">
            {submittedCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Lembar jawaban terkirim</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('bank')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'bank'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Bank Soal & Butir Ujian
        </button>
        <button
          onClick={() => setActiveTab('proctor')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'proctor'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Pengawasan Real-Time ({inProgressCount} Aktif)
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'analysis'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Analisis Hasil & Rekap Nilai
        </button>
        <button
          onClick={() => setActiveTab('discipline')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'discipline'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Log Integritas Mapel ({guruDisciplineNotes.length})
        </button>
      </div>

      {/* TAB 1: BANK SOAL */}
      {activeTab === 'bank' && currentExam && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: List of Teacher's Exams */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pilih Paket Ujian
            </h3>
            <div className="space-y-2">
              {teacherExams.map(ex => {
                const isSelected = ex.id === currentExam.id;
                const qCount = questions[ex.id]?.length || 0;
                return (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExamId(ex.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">
                        {ex.gradeLevel}
                      </span>
                      <span className="text-[11px] font-mono text-indigo-700 font-bold">
                        {ex.token}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                      {ex.subject}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                      <span>{qCount} Butir Soal</span>
                      <span>{ex.durationMinutes} Menit</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Exam Details & Question List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Header of selected Exam */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{currentExam.title}</h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                    KKM {currentExam.kkm}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Mata Pelajaran: {currentExam.subject} · {currentExam.gradeLevel} · Durasi {currentExam.durationMinutes} Menit
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingQuestion(null);
                    setIsQuestionEditorOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Butir Soal
                </button>
              </div>
            </div>

            {/* Question list cards */}
            <div className="space-y-3">
              {currentQuestions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-slate-900">Belum Ada Butir Soal</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Paket ujian ini masih kosong. Klik tombol di bawah untuk menambahkan soal pilihan ganda pertama Anda.
                  </p>
                  <button
                    onClick={() => {
                      setEditingQuestion(null);
                      setIsQuestionEditorOpen(true);
                    }}
                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Soal Sekarang
                  </button>
                </div>
              ) : (
                currentQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          Bobot: {q.points} Poin
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setIsQuestionEditorOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Butir Soal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(currentExam.id, q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                          title="Hapus Butir Soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-slate-900 whitespace-pre-line leading-relaxed font-sans">
                      {q.questionText}
                    </div>

                    {/* Options */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map(opt => {
                        const isCorrect = opt.id === q.correctAnswer;
                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                              isCorrect
                                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-600'
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="flex-1 mt-0.5">{opt.text}</span>
                            {isCorrect && (
                              <span className="text-[10px] text-emerald-700 font-bold shrink-0 self-center">
                                KUNCI
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Pembahasan: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENGAWASAN REAL-TIME */}
      {activeTab === 'proctor' && currentExam && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Monitoring Ruang Ujian: {currentExam.subject}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono font-bold">
                  TOKEN: {currentExam.token}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Memantau secara langsung status pengerjaan, sisa waktu, dan deteksi kecurangan siswa
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-800 rounded font-medium">
                {inProgressCount} Sedang Mengerjakan
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium">
                {submittedCount} Selesai
              </span>
              {blockedCount > 0 && (
                <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded font-medium">
                  {blockedCount} Terkunci
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Peserta & NISN</th>
                  <th className="py-3 px-4">Kelas / Ruang</th>
                  <th className="py-3 px-4">Kemajuan Soal</th>
                  <th className="py-3 px-4">Sisa Waktu</th>
                  <th className="py-3 px-4">Pelanggaran Layar</th>
                  <th className="py-3 px-4">Status & Keaktifan</th>
                  <th className="py-3 px-4 text-right">Aksi Pengawas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sessionsForCurrentExam.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Belum ada siswa yang masuk mengerjakan ujian ini.
                    </td>
                  </tr>
                ) : (
                  sessionsForCurrentExam.map(session => {
                    const answeredCount = Object.keys(session.answers).length;
                    const doubtCount = Object.values(session.answers).filter(a => a.isDoubtful).length;
                    const mins = Math.floor(session.remainingSeconds / 60);
                    const secs = session.remainingSeconds % 60;

                    return (
                      <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{session.studentName}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            NISN: {session.studentNisn}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{session.studentClass}</span>
                          <div className="text-[11px] text-slate-400">{session.studentRoom}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-slate-900">
                              {answeredCount} / {currentQuestions.length || currentExam.totalQuestions}
                            </span>
                            {doubtCount > 0 && (
                              <span className="text-[11px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                {doubtCount} ragu
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {mins}:{secs < 10 ? `0${secs}` : secs}
                        </td>
                        <td className="py-3 px-4">
                          {session.violationsCount === 0 ? (
                            <span className="text-slate-400">0x (Aman)</span>
                          ) : (
                            <span
                              className={`font-semibold px-2 py-0.5 rounded ${
                                session.violationsCount >= currentExam.maxViolationsAllowed
                                  ? 'bg-rose-100 text-rose-800 font-bold'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {session.violationsCount}x Pindah Tab
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {session.status === 'blocked' ? (
                            <span className="text-rose-600 font-bold">Terkunci Otomatis</span>
                          ) : session.status === 'submitted' ? (
                            <span className="text-emerald-700 font-semibold">Telah Mengumpulkan</span>
                          ) : session.status === 'in_progress' ? (
                            <span className="text-sky-700 font-semibold">Sedang Mengerjakan</span>
                          ) : (
                            <span className="text-slate-400">Belum Memulai</span>
                          )}
                          <div className="text-[11px] text-slate-400">{session.lastActive}</div>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          {session.status === 'blocked' ? (
                            <button
                              onClick={() => unlockStudent(session.studentId)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
                              title="Buka Kunci Layar Siswa"
                            >
                              Buka Kunci
                            </button>
                          ) : (
                            <button
                              onClick={() => resetStudentSession(session.studentId)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                              title="Reset Sesi (Bila Laptop Hang)"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANALISIS HASIL */}
      {activeTab === 'analysis' && currentExam && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">
              Analisis Daya Serap & Hasil: {currentExam.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Statistik ketuntasan siswa terhadap KKM ({currentExam.kkm})
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-500">Nilai Tertinggi</span>
                <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                  {Math.max(
                    ...sessionsForCurrentExam
                      .filter(s => s.score !== undefined)
                      .map(s => s.score as number),
                    0
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-500">Nilai Terendah</span>
                <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
                  {Math.min(
                    ...sessionsForCurrentExam
                      .filter(s => s.score !== undefined)
                      .map(s => s.score as number),
                    0
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-500">Ketuntasan Klasikal</span>
                <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">
                  {sessionsForCurrentExam.length > 0
                    ? Math.round(
                        (sessionsForCurrentExam.filter(s => (s.score || 0) >= currentExam.kkm).length /
                          sessionsForCurrentExam.length) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* List of Student Scores */}
            <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Nama Siswa</th>
                    <th className="py-2.5 px-4">Kelas</th>
                    <th className="py-2.5 px-4">Benar / Salah</th>
                    <th className="py-2.5 px-4">Nilai Akhir</th>
                    <th className="py-2.5 px-4 text-right">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sessionsForCurrentExam.map(s => {
                    const isPassed = (s.score ?? 0) >= currentExam.kkm;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{s.studentName}</td>
                        <td className="py-2.5 px-4">{s.studentClass}</td>
                        <td className="py-2.5 px-4 font-mono">
                          {s.correctCount !== undefined ? `${s.correctCount} benar · ${s.wrongCount} salah` : '-'}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-sm">
                          {s.score !== undefined ? s.score : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {s.score !== undefined ? (
                            <span
                              className={`font-semibold ${
                                isPassed ? 'text-emerald-700' : 'text-rose-600'
                              }`}
                            >
                              {isPassed ? 'TUNTAS' : 'REMEDIAL'}
                            </span>
                          ) : (
                            <span className="text-slate-400">Belum Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOG INTEGRITAS MAPEL OTOMATIS */}
      {activeTab === 'discipline' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Rekam Jejak & Audit Kedisiplinan Siswa ({currentUser.mapel || 'Semua Mapel'})
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Otomatis Terdeteksi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan otomatis oleh sistem saat siswa memulai tes terlambat atau berpindah jendela ujian.
              </p>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Tersinkronisasi ke Dasbor Guru Pengampu</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {guruDisciplineNotes.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada catatan keterlambatan atau insiden ujian pada mata pelajaran ini.
              </div>
            ) : (
              guruDisciplineNotes.map(note => {
                const isLate = note.type === 'terlambat';
                const isCheat = note.type === 'kecurangan';

                return (
                  <div
                    key={note.id}
                    className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-4 ${
                      isCheat
                        ? 'bg-rose-50/50 border-rose-200'
                        : isLate
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                            isCheat
                              ? 'bg-rose-600 text-white font-bold'
                              : isLate
                              ? 'bg-amber-500 text-white font-bold'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {note.type.toUpperCase()}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{note.title}</span>
                      </div>

                      <div className="text-slate-700 font-medium pt-0.5">
                        Siswa: <strong>{note.studentName || 'Peserta'}</strong> ({note.studentClass || '-'}) · NISN: {note.studentNisn || '-'}
                      </div>

                      <p className="text-slate-600 leading-relaxed pt-0.5">
                        {note.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-slate-400 text-[11px]">{note.timestamp}</div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Otomatis Sistem</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <QuestionEditorModal
        isOpen={isQuestionEditorOpen}
        onClose={() => {
          setIsQuestionEditorOpen(false);
          setEditingQuestion(null);
        }}
        examId={currentExam?.id || ''}
        initialQuestion={editingQuestion}
      />
      <CreateExamModal
        isOpen={isCreateExamOpen}
        onClose={() => setIsCreateExamOpen(false)}
      />
    </div>
  );
};
