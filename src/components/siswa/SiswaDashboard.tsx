import React, { useState, useEffect } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  BookOpen,
  Award,
  Bell,
  UserCheck,
  KeyRound,
  Printer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  QrCode,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Check,
  TrendingUp,
  FileText,
  History,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  XCircle,
  Info
} from 'lucide-react';
import { CBTExamRoom } from './CBTExamRoom';
import { Exam, StudentSubjectGrade } from '../../types/cbt';
import { StudentCardModal } from '../admin/StudentCardModal';
import { StudentExamHistoryView } from './StudentExamHistoryView';

export const SiswaDashboard: React.FC = () => {
  const {
    currentUser,
    exams,
    examSessions,
    schoolProfile,
    questions,
    activeExamTaking,
    startExamForStudent,
    announcements,
    disciplineNotes,
    studentGrades,
    changePassword,
    viewStudentExamResult,
    isOnline,
    pendingOfflineSyncCount,
    syncPendingOfflineData,
  } = useCBT();

  const [isSyncing, setIsSyncing] = useState(false);
  const [dashboardSyncMsg, setDashboardSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active sub-menu tab: 'ujian' | 'riwayat' | 'nilai' | 'pengumuman' | 'akun'
  const [activeTab, setActiveTab] = useState<'ujian' | 'riwayat' | 'nilai' | 'pengumuman' | 'akun'>('ujian');

  // Selected grade for reviewing correct and incorrect answers in Menu Nilai & Hasil
  const [selectedAnswerReviewGrade, setSelectedAnswerReviewGrade] = useState<StudentSubjectGrade | null>(null);

  // Exam token states
  const [enteredToken, setEnteredToken] = useState<Record<string, string>>({});
  const [tokenError, setTokenError] = useState<Record<string, string>>({});

  // Change password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Student Card Print Modal
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // If student is actively taking an exam, render the full-screen CBT Room!
  if (activeExamTaking) {
    return <CBTExamRoom />;
  }

  const handleStartExam = (exam: Exam) => {
    if (exam.status !== 'ongoing' || !exam.isTokenActive) {
      setTokenError(prev => ({
        ...prev,
        [exam.id]: 'Ujian belum dimulai atau sesi belum dibuka oleh pengawas ruang.',
      }));
      return;
    }

    const token = (enteredToken[exam.id] || '').trim();
    if (!token) {
      setTokenError(prev => ({
        ...prev,
        [exam.id]: 'Harap masukkan token ujian yang diberikan pengawas!',
      }));
      return;
    }

    const res = startExamForStudent(exam.id, token);
    if (!res.success) {
      setTokenError(prev => ({ ...prev, [exam.id]: res.message }));
    } else {
      setTokenError(prev => ({ ...prev, [exam.id]: '' }));
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    if (newPassword.length < 5) {
      setPassMessage({ type: 'error', text: 'Password baru minimal harus 5 karakter.' });
      return;
    }

    const res = changePassword(currentUser.id, oldPassword, newPassword);
    if (res.success) {
      setPassMessage({ type: 'success', text: res.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassMessage({ type: 'error', text: res.message });
    }
  };

  // Student grades data
  const myGrades = studentGrades[currentUser.id] || studentGrades['usr-siswa-1'] || [];
  const completedGrades = myGrades.filter(g => g.status !== 'Belum Ujian');
  const avgScore =
    completedGrades.length > 0
      ? (
          completedGrades.reduce((sum, g) => sum + g.score, 0) / completedGrades.length
        ).toFixed(1)
      : '0';
  const highestGrade =
    completedGrades.length > 0 ? Math.max(...completedGrades.map(g => g.score)) : 0;
  const lowestGrade =
    completedGrades.length > 0 ? Math.min(...completedGrades.map(g => g.score)) : 0;
  const passedCount = myGrades.filter(g => g.status === 'Tuntas').length;

  // Student discipline notes
  const myDisciplineNotes =
    disciplineNotes.filter(n => n.studentId === currentUser.id) ||
    disciplineNotes.filter(n => n.studentId === 'usr-siswa-1');

  // Filter exams specifically relevant for this student (matching student's religion for religious exams)
  const studentAgama = currentUser.agama || 'Islam';
  const relevantExams = exams.filter(e => {
    // If exam has a specific requiredAgama, must match student's agama
    if (e.requiredAgama) {
      return e.requiredAgama === studentAgama;
    }
    // If exam subject has "Agama", check if matching
    if (e.subject.toLowerCase().includes('agama')) {
      return e.subject.toLowerCase().includes(studentAgama.toLowerCase());
    }
    return true;
  });

  // Helper to determine student's personal completion state for an exam
  const getExamStudentState = (examId: string) => {
    let session = examSessions.find(
      s => s.examId === examId && (s.studentId === currentUser.id || s.studentNisn === currentUser.nisn)
    );

    // Fail-safe check: Always inspect local persistent storage for any submitted session
    if (!session || session.status !== 'submitted') {
      try {
        const raw = localStorage.getItem(`educbt_submitted_ses-${currentUser.id}-${examId}`) ||
                    localStorage.getItem(`educbt_submitted_ses-1`) ||
                    localStorage.getItem(`educbt_session_ses-${currentUser.id}-${examId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.status === 'submitted' || parsed.finishedAt)) {
            session = parsed;
          }
        }
      } catch {}
    }

    const grade = myGrades.find(
      g => g.code === examId.toUpperCase() || g.subject.toLowerCase() === exams.find(e => e.id === examId)?.subject.toLowerCase()
    );
    const isSubmitted = session?.status === 'submitted' || (grade && grade.status !== 'Belum Ujian');
    const isPendingSync = session?.isOfflineSynced === false || (session?.status === 'submitted' && pendingOfflineSyncCount > 0);
    return {
      session,
      grade,
      isSubmitted,
      isPendingSync,
    };
  };

  // Helper to compute correct/wrong counts and simple per-question status without fake paragraphs
  const getSimpleGradeAnswerBreakdown = (grade: StudentSubjectGrade) => {
    const matchedExam = exams.find(
      e => e.subject.toLowerCase() === grade.subject.toLowerCase() ||
           e.id.toLowerCase() === grade.code.toLowerCase() ||
           (e.examCategory && grade.examTitle.toLowerCase().includes(e.subject.toLowerCase()))
    );

    const examId = matchedExam?.id || 'exam-mat-01';
    const realQuestions = questions[examId] || [];

    // Find student's completed session if available
    let session = examSessions.find(
      s => (s.examId === examId || s.examId === matchedExam?.id) &&
           (s.studentId === currentUser.id || s.studentNisn === currentUser.nisn) &&
           s.status === 'submitted'
    );

    if (!session) {
      try {
        const raw = localStorage.getItem(`educbt_submitted_ses-${currentUser.id}-${examId}`) ||
                    localStorage.getItem(`educbt_submitted_ses-1`) ||
                    localStorage.getItem(`educbt_session_ses-${currentUser.id}-${examId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.status === 'submitted' || parsed.finishedAt)) {
            session = parsed;
          }
        }
      } catch {}
    }

    const totalQ = realQuestions.length > 0 ? realQuestions.length : 10;
    const correctCount = session?.correctCount ?? Math.max(0, Math.min(totalQ, Math.round((grade.score / 100) * totalQ)));
    const wrongCount = totalQ - correctCount;

    // Direct, concise breakdown: question number and whether it was Benar / Salah
    const items = Array.from({ length: totalQ }, (_, i) => {
      const qNum = i + 1;
      let isCorrect = false;
      let studentChoice = '';
      let correctKey = '';

      if (realQuestions[i]) {
        const q = realQuestions[i];
        correctKey = q.correctAnswer;
        studentChoice = session?.answers ? session.answers[q.id]?.selectedOption || '' : '';
        if (studentChoice) {
          isCorrect = studentChoice.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase();
        } else {
          isCorrect = i < correctCount;
          studentChoice = isCorrect ? q.correctAnswer : (q.options.find(o => o.id !== q.correctAnswer)?.id || 'A');
        }
      } else {
        isCorrect = i < correctCount;
        correctKey = ['A', 'B', 'C', 'D'][i % 4];
        studentChoice = isCorrect ? correctKey : (correctKey === 'A' ? 'B' : 'A');
      }

      return {
        number: qNum,
        isCorrect,
        studentChoice,
        correctKey,
      };
    });

    return {
      matchedExam,
      session,
      totalQuestions: totalQ,
      correctCount,
      wrongCount,
      items,
    };
  };

  // Auto-sync in dashboard when online connectivity is restored
  useEffect(() => {
    if (isOnline && pendingOfflineSyncCount > 0) {
      handleManualSyncInDashboard();
    }
  }, [isOnline]);

  const handleManualSyncInDashboard = async () => {
    setIsSyncing(true);
    setDashboardSyncMsg(null);
    try {
      const res = await syncPendingOfflineData();
      if (res.success) {
        setDashboardSyncMsg({ type: 'success', text: res.message });
      } else {
        setDashboardSyncMsg({ type: 'error', text: res.message });
      }
    } catch {
      setDashboardSyncMsg({ type: 'error', text: 'Gagal terhubung ke database server pengawas.' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter exams into: 1 Sedang Berlangsung & 1 Belum Waktunya (as instructed)
  const ongoingExam = relevantExams.find(e => e.status === 'ongoing') || relevantExams[0];
  const upcomingExam = relevantExams.find(e => e.status === 'published' && e.id !== ongoingExam?.id) || relevantExams.find(e => e.id !== ongoingExam?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. TOP OFFLINE WARNING BANNER */}
      {!isOnline && (
        <div className="p-3.5 bg-amber-500 text-white rounded-2xl text-xs font-medium flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
            <div>
              <span className="font-bold underline decoration-white/60">MODE OFFLINE AKTIF:</span>{' '}
              Koneksi internet Anda saat ini terputus. Lembar soal dan seluruh riwayat hasil ujian Anda tersimpan aman secara lokal di perangkat ini.
            </div>
          </div>
          <span className="hidden sm:inline-block bg-amber-700/80 text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ml-2">
            Offline Mode
          </span>
        </div>
      )}

      {/* 2. TOP PENDING OFFLINE SYNC CARD */}
      {pendingOfflineSyncCount > 0 && (
        <div className="p-4 bg-amber-50/95 border-2 border-amber-300 rounded-2xl text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">
                Terdapat {pendingOfflineSyncCount} Data Ujian Offline Menunggu Sinkronisasi
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isOnline
                  ? 'Internet sudah aktif kembali! Klik tombol sinkronkan untuk mengirim jawaban & nilai Anda ke proktor.'
                  : 'Jawaban tersimpan aman di perangkat ini. Jawaban akan otomatis terkirim saat internet terhubung kembali.'}
              </p>
              {dashboardSyncMsg && (
                <p className={`text-[11px] font-semibold mt-1 ${dashboardSyncMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {dashboardSyncMsg.text}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualSyncInDashboard}
            disabled={isSyncing}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      )}

      {/* Student Welcome Header Banner */}
      <div className="bg-[#fdfdfc] border border-stone-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              PORTAL ASESMEN SISWA CBT
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                {currentUser.name}
              </h1>
              <span className="text-xs font-medium text-stone-500">
                · Agama: {studentAgama}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              NISN: {currentUser.nisn} · Kelas: {currentUser.kelas} ({currentUser.jurusan || 'Reguler'}) · {currentUser.ruangUjian || `Ruang Kelas ${currentUser.kelas}`}
            </p>
          </div>

          {/* Quick Info & Print Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200/90 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>Cetak Kartu Ujian</span>
            </button>
            <div className="hidden sm:flex flex-col text-right text-xs">
              <span className="text-stone-400">Nomor Peserta:</span>
              <span className="font-mono font-bold text-stone-800">
                {currentUser.nomorPeserta || 'U-24-XII-01-001'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Student Navigation Menu Tabs */}
      <div className="flex border-b border-stone-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('ujian')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'ujian'
              ? 'border-emerald-800 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Menu Ujian</span>
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'riwayat'
              ? 'border-emerald-800 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Ujian</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-stone-100 text-stone-700 border border-stone-200">
            {completedGrades.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('nilai')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'nilai'
              ? 'border-emerald-800 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Menu Nilai & Hasil</span>
        </button>

        <button
          onClick={() => setActiveTab('pengumuman')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'pengumuman'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Menu Pengumuman ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('akun')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'akun'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Ganti Password & Kartu Ujian</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. MENU UJIAN (1 SEDANG BERLANGSUNG & 1 BELUM WAKTUNYA)     */}
      {/* ============================================================ */}
      {activeTab === 'ujian' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Jadwal Asesmen Berbasis Komputer</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Satu sesi sedang aktif berlangsung dan satu sesi belum dimulai (menunggu jadwal).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UJIAN 1: SEDANG BERLANGSUNG ATAU SUDAH SELESAI */}
            {ongoingExam && (() => {
              const ongoingState = getExamStudentState(ongoingExam.id);

              if (ongoingState.isSubmitted) {
                return (
                  <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className={`absolute top-0 right-0 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1.5 ${
                      ongoingState.isPendingSync ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}>
                      {ongoingState.isPendingSync ? (
                        <>
                          <WifiOff className="w-3.5 h-3.5" />
                          <span>Selesai (Sync Tertunda)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sudah Selesai Dikerjakan</span>
                        </>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                        SESI 1 · {ongoingExam.gradeLevel} · SELESAI
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {ongoingExam.subject}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{ongoingExam.title}</p>

                      <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Waktu Pengumpulan</span>
                          <span className="font-bold text-emerald-950 font-mono">
                            {ongoingState.session?.finishedAt || ongoingState.grade?.completedDate || 'Telah Dikumpulkan'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Status Lembar Jawaban</span>
                          <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Telah Selesai & Dikumpulkan
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Status Sinkronisasi</span>
                          <span className="font-semibold text-xs">
                            {ongoingState.isPendingSync ? (
                              <span className="text-amber-800 font-bold flex items-center gap-1">
                                <WifiOff className="w-3.5 h-3.5 text-amber-600" /> Tersimpan di Perangkat (Belum Sync)
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Terkirim ke Server Pengawas
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2 mt-1">
                          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <span>
                            Nilai dan pembahasan jawaban benar/salah akan dipublikasikan oleh admin di <strong>Menu Nilai & Hasil</strong>.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
                      {ongoingState.isPendingSync && (
                        <button
                          type="button"
                          onClick={handleManualSyncInDashboard}
                          disabled={isSyncing}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>{isSyncing ? 'Menyinkronkan Jawaban...' : 'Sinkronkan Jawaban ke Server Sekarang'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => viewStudentExamResult(ongoingExam.id)}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Lihat Lembar Hasil Ujian</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-white border-2 border-indigo-500 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    Sedang Berlangsung
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      SESI 1 · {ongoingExam.gradeLevel}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {ongoingExam.subject}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{ongoingExam.title}</p>

                    <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Waktu Pelaksanaan</span>
                        <span className="font-bold text-slate-800">
                          {ongoingExam.startTime} - {ongoingExam.endTime} WIB
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Durasi Pengerjaan</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {ongoingExam.durationMinutes} Menit
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Jumlah Soal</span>
                        <span className="font-semibold text-slate-800">
                          {ongoingExam.totalQuestions} Butir Pilihan Ganda
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Guru Pengampu</span>
                        <span className="text-slate-800">{ongoingExam.teacherName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Token & Start */}
                  <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Masukkan Token Ujian (Dari Pengawas Ruang)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            maxLength={8}
                            value={enteredToken[ongoingExam.id] || ''}
                            onChange={e =>
                              setEnteredToken(prev => ({
                                ...prev,
                                [ongoingExam.id]: e.target.value.toUpperCase(),
                              }))
                            }
                            placeholder="Ketik Token..."
                            className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold tracking-widest uppercase bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
                          />
                        </div>

                        <button
                          onClick={() => handleStartExam(ongoingExam)}
                          className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                        >
                          <span>Mulai Kerjakan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {tokenError[ongoingExam.id] && (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{tokenError[ongoingExam.id]}</span>
                        </p>
                      )}

                      <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                        <span>
                          Token Ujian Aktif: <strong className="font-mono text-indigo-700">{ongoingExam.token}</strong>
                        </span>
                        <span className="text-emerald-700 font-semibold">Siap Dikerjakan</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* UJIAN 2: BELUM BERLANGSUNG / BELUM WAKTUNYA / ATAU SUDAH SELESAI */}
            {upcomingExam && (() => {
              const upcomingState = getExamStudentState(upcomingExam.id);

              if (upcomingState.isSubmitted) {
                return (
                  <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sudah Selesai Dikerjakan</span>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                        SESI 2 · {upcomingExam.gradeLevel} · SELESAI
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {upcomingExam.subject}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{upcomingExam.title}</p>

                      <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Waktu Pengumpulan</span>
                          <span className="font-bold text-emerald-950 font-mono">
                            {upcomingState.session?.finishedAt || upcomingState.grade?.completedDate || 'Telah Dikumpulkan'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Status Lembar Jawaban</span>
                          <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Telah Selesai & Dikumpulkan
                          </span>
                        </div>
                        <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2 mt-1">
                          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <span>
                            Nilai dan pembahasan jawaban benar/salah akan dipublikasikan oleh admin di <strong>Menu Nilai & Hasil</strong>.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => viewStudentExamResult(upcomingExam.id)}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Lihat Lembar Hasil Ujian</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between opacity-95">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        SESI 2 · {upcomingExam.gradeLevel}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-slate-200 text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Belum Waktunya
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mt-2">
                      {upcomingExam.subject}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{upcomingExam.title}</p>

                    <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Jadwal Sesi</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {upcomingExam.startTime} - {upcomingExam.endTime} WIB (Siang)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Durasi Pengerjaan</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {upcomingExam.durationMinutes} Menit
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Jumlah Soal</span>
                        <span className="font-semibold text-slate-800">
                          {upcomingExam.totalQuestions} Butir Soal
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Guru Pengampu</span>
                        <span className="text-slate-800">{upcomingExam.teacherName}</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Sesi ujian ini <strong>belum dapat diakses</strong>. Pengawas ruangan baru akan membuka token dan memulai sesi pada pukul <strong>{upcomingExam.startTime} WIB</strong>.
                      </span>
                    </div>
                  </div>

                  {/* Locked Action */}
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        disabled
                        placeholder="Token belum dirilis..."
                        className="flex-1 px-3 py-2 text-sm font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
                      />
                      <button
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Menunggu Waktu</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. RIWAYAT UJIAN (DETAILED EXAM HISTORY, SCORES, TIMESTAMPS) */}
      {/* ============================================================ */}
      {activeTab === 'riwayat' && (
        <StudentExamHistoryView />
      )}

      {/* ============================================================ */}
      {/* 3. MENU NILAI (HASIL, STATISTIK SEMUA MAPEL, KETERANGAN)     */}
      {/* ============================================================ */}
      {activeTab === 'nilai' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Rekapitulasi Nilai & Catatan Disiplin Siswa</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kumpulan capaian nilai seluruh mata pelajaran beserta rekam jejak kedisiplinan dan status ujian.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('riwayat')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <History className="w-4 h-4 text-stone-500" />
              <span>Buka Riwayat Ujian Detail</span>
            </button>
          </div>

          {/* KPI Statistik Ringkasan Nilai Siswa */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Rata-rata Nilai
              </span>
              <div className="text-3xl font-mono font-bold text-indigo-600 mt-1">
                {avgScore}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Dari {completedGrades.length} mapel selesai</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nilai Tertinggi
              </span>
              <div className="text-3xl font-mono font-bold text-emerald-700 mt-1">
                {highestGrade}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">PABP (Agama Islam)</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nilai Terendah
              </span>
              <div className="text-3xl font-mono font-bold text-rose-600 mt-1">
                {lowestGrade}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Fisika (Remedial)</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ketuntasan KKM
              </span>
              <div className="text-3xl font-mono font-bold text-slate-900 mt-1">
                {passedCount} / {myGrades.length}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Mata Pelajaran Tuntas</span>
            </div>
          </div>

          {/* Tabel Detail Nilai Mapel */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lembar Rekapitulasi Nilai Resmi</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Klik tombol pada kolom keterangan untuk melihat analisis jawaban benar dan salah tiap mata pelajaran.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">Semester Genap 2024/2025</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Kode</th>
                    <th className="py-2.5 px-4">Mata Pelajaran</th>
                    <th className="py-2.5 px-4">Waktu Ujian</th>
                    <th className="py-2.5 px-4">KKM</th>
                    <th className="py-2.5 px-4">Nilai Akhir</th>
                    <th className="py-2.5 px-4 text-right">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {myGrades.map(g => {
                    const matchedExam = exams.find(
                      e => e.subject.toLowerCase() === g.subject.toLowerCase() ||
                           e.id.toLowerCase() === g.code.toLowerCase() ||
                           (e.examCategory && g.examTitle.toLowerCase().includes(e.subject.toLowerCase()))
                    );
                    const isPublished = matchedExam ? matchedExam.publishAnswers !== false : true;
                    const breakdown = getSimpleGradeAnswerBreakdown(g);

                    return (
                      <tr key={g.code} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-slate-500">{g.code}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{g.subject}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono">{g.completedDate}</td>
                        <td className="py-2.5 px-4 font-mono">{g.kkm}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-sm">
                          {g.status === 'Belum Ujian' ? '-' : g.score}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {g.status === 'Belum Ujian' ? (
                            <span className="inline-block text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                              Belum Ujian
                            </span>
                          ) : !isPublished ? (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg"
                              title="Kunci jawaban dan analisis benar/salah belum dipublikasikan oleh admin"
                            >
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Menunggu Publikasi Admin</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedAnswerReviewGrade(g)}
                              className="inline-flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
                              title="Klik untuk melihat nomor soal yang benar dan salah"
                            >
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{breakdown.correctCount} Benar</span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg group-hover:bg-rose-100 transition-colors">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>{breakdown.wrongCount} Salah</span>
                              </span>
                            </button>
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

      {/* ============================================================ */}
      {/* 3. MENU PENGUMUMAN                                           */}
      {/* ============================================================ */}
      {activeTab === 'pengumuman' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pemberitahuan Resmi Panitia Ujian</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Informasi terkini mengenai tata tertib, jadwal susulan, dan pengumuman laboratorium CBT.
            </p>
          </div>

          <div className="space-y-4">
            {announcements.map(item => (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-6 shadow-xs transition-all ${
                  item.isPinned
                    ? 'border-indigo-400 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {item.isPinned && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                        DISEMATKAN
                      </span>
                    )}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {item.title}
                    </h3>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {item.date} · Oleh {item.author}
                  </span>
                </div>

                <div className="pt-3 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MENU GANTI PASSWORD & CETAK KARTU UJIAN                   */}
      {/* ============================================================ */}
      {activeTab === 'akun' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bagian 1: Cetak Kartu Peserta Ujian */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Kartu Peserta Ujian Digital
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Wajib dicetak dan dibawa saat memasuki ruang laboratorium CBT.
              </p>

              {/* Preview Kartu Mini */}
              <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                <div className="text-center border-b border-slate-200 pb-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    KARTU ASESMEN / CBT SEKOLAH
                  </div>
                  <div className="text-sm font-bold text-slate-900">{schoolProfile.name}</div>
                  <div className="text-[10px] text-slate-500">Tahun Pelajaran {schoolProfile.academicYear}</div>
                </div>

                <div className="flex gap-3 text-xs">
                  <div className="w-16 h-20 bg-slate-200 border border-slate-300 rounded flex flex-col items-center justify-center text-[9px] text-slate-400 shrink-0 font-medium">
                    FOTO 3X4
                  </div>
                  <div className="flex-1 space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nama Siswa:</span>
                      <strong className="text-slate-900">{currentUser.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">NISN / No. Peserta:</span>
                      <span className="font-mono text-slate-800">
                        {currentUser.nisn} · {currentUser.nomorPeserta || 'U-24-001'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kelas & Ruang:</span>
                      <span className="text-slate-800">
                        {currentUser.kelas} · {currentUser.ruangUjian}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCardModalOpen(true)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Buka Pratinjau & Cetak Kartu Ujian Resmi</span>
            </button>
          </div>

          {/* Bagian 2: Form Ganti Password Siswa */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Ganti Password Akun CBT
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Ubah kata sandi secara berkala untuk menjaga kerahasiaan lembar jawaban Anda.
            </p>

            {passMessage && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  passMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {passMessage.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{passMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password Lama *
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="Masukkan password saat ini (default: siswa123)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 pr-10 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showOldPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password Baru *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimal 5 karakter..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 pr-10 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Konfirmasi Password Baru *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Simpan Password Baru
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
              <span className="font-bold text-amber-600">💡 Tips:</span>
              <span>
                Jika Anda lupa password lama, hubungi Proktor / Pengawas ruang ujian sekolah untuk mereset akun Anda, atau gunakan fitur <strong>Reset Password (Siswa/Admin)</strong> di halaman login awal.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Kartu Peserta Ujian */}
      <StudentCardModal
        student={isCardModalOpen ? currentUser : null}
        onClose={() => setIsCardModalOpen(false)}
      />

      {/* ============================================================ */}
      {/* MODAL RINCIAN JAWABAN BENAR & SALAH (COMPACT & BERSIH)       */}
      {/* ============================================================ */}
      {selectedAnswerReviewGrade && (() => {
        const breakdown = getSimpleGradeAnswerBreakdown(selectedAnswerReviewGrade);
        const kkm = selectedAnswerReviewGrade.kkm || 75;
        const isPassed = selectedAnswerReviewGrade.score >= kkm;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-lg my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="shrink-0 bg-slate-900 text-white p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-300">
                      {selectedAnswerReviewGrade.code}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isPassed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isPassed ? 'Tuntas KKM' : 'Remedial'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedAnswerReviewGrade.subject}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentUser.name} · NISN: <span className="font-mono text-slate-200">{currentUser.nisn}</span> · {selectedAnswerReviewGrade.completedDate}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAnswerReviewGrade(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Strip */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-center">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nilai Akhir</span>
                  <span className="text-2xl font-bold font-mono text-indigo-600">{selectedAnswerReviewGrade.score}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">KKM: {kkm}</span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Jawaban Benar</span>
                  <span className="text-2xl font-bold font-mono text-emerald-700 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {breakdown.correctCount}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Butir Soal</span>
                </div>
                <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-rose-700 uppercase font-semibold block">Jawaban Salah</span>
                  <span className="text-2xl font-bold font-mono text-rose-700 flex items-center justify-center gap-1">
                    <XCircle className="w-4 h-4" /> {breakdown.wrongCount}
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">Butir Soal</span>
                </div>
              </div>

              {/* Simple Clean Grid of Answers */}
              <div className="p-4 max-h-[50vh] overflow-y-auto">
                <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
                  <span>Daftar Status Jawaban Soal</span>
                  <span className="text-slate-400 text-[11px] font-normal">Total {breakdown.totalQuestions} Butir</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {breakdown.items.map(item => (
                    <div
                      key={item.number}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        item.isCorrect
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/70 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-white border font-mono font-bold text-xs flex items-center justify-center text-slate-700 shrink-0">
                          {item.number}
                        </span>
                        <div>
                          <span className="font-semibold block text-slate-900">
                            Soal No. {item.number}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Jawaban: <strong className={item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{item.studentChoice}</strong>
                            {!item.isCorrect && (
                              <span className="ml-1 text-slate-400">(Kunci: <strong className="text-emerald-700">{item.correctKey}</strong>)</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {item.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Benar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-300">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Salah
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">
                  {schoolProfile.name} · Hasil Resmi Asesmen CBT
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAnswerReviewGrade(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
