import React, { useState, useMemo } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  History,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Printer,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  BookOpen,
  QrCode,
  Share2,
  Info
} from 'lucide-react';
import { Exam, ExamSession, Question, StudentSubjectGrade } from '../../types/cbt';

export interface MergedExamHistoryItem {
  id: string;
  examId?: string;
  title: string;
  subject: string;
  code: string;
  category: 'PAS' | 'PTS' | 'US';
  score: number;
  kkm: number;
  status: 'Tuntas' | 'Remedial' | 'Belum Ujian';
  completedDate: string;
  startedAt?: string;
  finishedAt?: string;
  durationMinutes?: number;
  timeSpentMinutes?: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  violationsCount: number;
  teacherName?: string;
  session?: ExamSession;
  questions?: Question[];
}

export const StudentExamHistoryView: React.FC = () => {
  const {
    currentUser,
    exams,
    examSessions,
    studentGrades,
    questions,
    schoolProfile,
  } = useCBT();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PAS' | 'PTS' | 'US'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'Tuntas' | 'Remedial'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'score_high' | 'score_low'>('newest');

  // Modal States
  const [reviewModalItem, setReviewModalItem] = useState<MergedExamHistoryItem | null>(null);
  const [receiptModalItem, setReceiptModalItem] = useState<MergedExamHistoryItem | null>(null);

  // 1. Merge submitted sessions and student grades into a unified exam history list
  const historyItems: MergedExamHistoryItem[] = useMemo(() => {
    const studentId = currentUser.id || 'usr-siswa-1';
    const myGrades: StudentSubjectGrade[] = studentGrades[studentId] || studentGrades['usr-siswa-1'] || [];
    const mySessions = examSessions.filter(
      s => s.studentId === studentId && s.status === 'submitted'
    );

    const items: MergedExamHistoryItem[] = [];
    const processedSubjectCodes = new Set<string>();

    // A. First add real completed CBT exam sessions
    mySessions.forEach(ses => {
      const exam = exams.find(e => e.id === ses.examId);
      const examQList = exam ? (questions[exam.id] || []) : [];
      const category = (exam?.examCategory || 'PAS') as 'PAS' | 'PTS' | 'US';
      const kkm = exam?.kkm || 75;
      const score = ses.score ?? 0;
      const totalQ = exam?.totalQuestions || examQList.length || 10;
      const correct = ses.correctCount ?? Math.round((score / 100) * totalQ);
      const wrong = ses.wrongCount ?? (totalQ - correct);

      const item: MergedExamHistoryItem = {
        id: `ses-${ses.id}`,
        examId: ses.examId,
        title: exam?.title || `Ujian CBT - ${exam?.subject || 'Mata Pelajaran'}`,
        subject: exam?.subject || 'Mata Pelajaran',
        code: exam?.id.toUpperCase() || 'CBT',
        category,
        score,
        kkm,
        status: score >= kkm ? 'Tuntas' : 'Remedial',
        completedDate: ses.finishedAt || 'Hari ini',
        startedAt: ses.startedAt || '07:30 WIB',
        finishedAt: ses.finishedAt || 'Selesai',
        durationMinutes: exam?.durationMinutes || 90,
        timeSpentMinutes: exam ? Math.max(15, exam.durationMinutes - Math.round(ses.remainingSeconds / 60)) : 75,
        totalQuestions: totalQ,
        correctCount: correct,
        wrongCount: wrong,
        violationsCount: ses.violationsCount || 0,
        teacherName: exam?.teacherName || 'Guru Pengampu CBT',
        session: ses,
        questions: examQList,
      };

      items.push(item);
      processedSubjectCodes.add((item.subject || '').toLowerCase());
      processedSubjectCodes.add((item.code || '').toLowerCase());
    });

    // B. Then add completed historical subject grades
    myGrades.forEach(g => {
      if (g.status === 'Belum Ujian') return; // Skip upcoming/untested
      if (processedSubjectCodes.has(g.subject.toLowerCase())) return; // Avoid duplicates

      let category: 'PAS' | 'PTS' | 'US' = 'PAS';
      if (g.examTitle.toUpperCase().includes('PTS') || g.examTitle.toUpperCase().includes('TENGAH')) {
        category = 'PTS';
      } else if (g.examTitle.toUpperCase().includes('US') || g.examTitle.toUpperCase().includes('SATUAN PENDIDIKAN')) {
        category = 'US';
      }

      // Check if there is an associated exam
      const matchedExam = exams.find(
        e => e.subject.toLowerCase() === g.subject.toLowerCase()
      );
      const examQList = matchedExam ? (questions[matchedExam.id] || []) : [];
      const totalQ = matchedExam?.totalQuestions || (g.score > 0 ? 10 : 8);
      const correct = Math.round((g.score / 100) * totalQ);
      const wrong = totalQ - correct;

      items.push({
        id: `grade-${g.code}`,
        examId: matchedExam?.id,
        title: g.examTitle,
        subject: g.subject,
        code: g.code,
        category,
        score: g.score,
        kkm: g.kkm,
        status: g.status,
        completedDate: g.completedDate || '08 Okt 2026',
        startedAt: '07:30 WIB',
        finishedAt: g.completedDate ? g.completedDate.split(' ')[3] + ' WIB' : '09:00 WIB',
        durationMinutes: matchedExam?.durationMinutes || 90,
        timeSpentMinutes: Math.round((matchedExam?.durationMinutes || 90) * 0.85),
        totalQuestions: totalQ,
        correctCount: correct,
        wrongCount: wrong,
        violationsCount: g.violationsCount || 0,
        teacherName: matchedExam?.teacherName || 'Bpk/Ibu Guru Mata Pelajaran',
        questions: examQList.length > 0 ? examQList : undefined,
      });

      processedSubjectCodes.add(g.subject.toLowerCase());
    });

    return items;
  }, [currentUser.id, studentGrades, examSessions, exams, questions]);

  // 2. Filter & Sort
  const filteredItems = useMemo(() => {
    let result = [...historyItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.subject.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.teacherName && item.teacherName.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter(item => item.status === selectedStatus);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'score_high') {
        return b.score - a.score;
      }
      if (sortBy === 'score_low') {
        return a.score - b.score;
      }
      // 'newest': sort by date/id
      return b.id.localeCompare(a.id);
    });

    return result;
  }, [historyItems, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Overall Statistics KPI
  const stats = useMemo(() => {
    const total = historyItems.length;
    if (total === 0) {
      return { total: 0, avg: 0, passed: 0, remedial: 0, cleanIntegrity: 0 };
    }
    const sum = historyItems.reduce((acc, curr) => acc + curr.score, 0);
    const avg = (sum / total).toFixed(1);
    const passed = historyItems.filter(h => h.status === 'Tuntas').length;
    const remedial = historyItems.filter(h => h.status === 'Remedial').length;
    const cleanIntegrity = historyItems.filter(h => h.violationsCount === 0).length;

    return { total, avg, passed, remedial, cleanIntegrity };
  }, [historyItems]);

  const handlePrintAllHistory = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('window.print error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Hero Section */}
      <div className="bg-[#fdfdfc] border border-stone-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-xl font-bold tracking-tight text-stone-900">
                Riwayat & Arsip Hasil Asesmen CBT
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                {historyItems.length} Ujian Terdata
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Catatan lengkap hasil pengerjaan ujian, skor kelulusan KKM, timestamp pelaksanaan, serta ulasan butir soal Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintAllHistory}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="Cetak Seluruh Rekap Riwayat Ujian"
            >
              <Printer className="w-4 h-4 text-stone-500" />
              <span>Cetak Rekap Riwayat</span>
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Total Ujian Selesai
              </span>
              <FileText className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
              {stats.total}
            </div>
            <span className="text-[11px] text-stone-500">Paket soal diselesaikan</span>
          </div>

          <div className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Rata-Rata Nilai
              </span>
              <Award className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
              {stats.avg}
            </div>
            <span className="text-[11px] text-stone-500">Skala 0 - 100</span>
          </div>

          <div className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Ketuntasan KKM
              </span>
              <CheckCircle2 className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
              {stats.passed} <span className="text-xs font-normal text-stone-500 font-sans">Tuntas</span>
            </div>
            <span className="text-[11px] text-rose-700">
              {stats.remedial} mapel remedial (&lt; 75)
            </span>
          </div>

          <div className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Integritas CBT
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
              {stats.total > 0 ? `${Math.round((stats.cleanIntegrity / stats.total) * 100)}%` : '100%'}
            </div>
            <span className="text-[11px] text-stone-500">Sesi tertib tanpa tab-blur</span>
          </div>
        </div>
      </div>

      {/* 2. Search, Category, and Sorting Controls */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama mata pelajaran, kode, atau guru pengampu..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-stone-400 text-stone-800 placeholder-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-stone-400" />
            <span className="text-xs text-stone-500 whitespace-nowrap">Urutkan:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl text-stone-700 focus:outline-hidden focus:border-stone-400 cursor-pointer"
            >
              <option value="newest">Terbaru / Terakhir Selesai</option>
              <option value="score_high">Nilai Tertinggi</option>
              <option value="score_low">Nilai Terendah</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
              Kategori:
            </span>
            {(['ALL', 'PAS', 'PTS', 'US'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {(['ALL', 'Tuntas', 'Remedial'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? st === 'Tuntas'
                      ? 'bg-emerald-800 text-white font-semibold'
                      : st === 'Remedial'
                      ? 'bg-rose-800 text-white font-semibold'
                      : 'bg-stone-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                {st === 'ALL' ? 'Semua Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Exam History Cards List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">Tidak Ada Riwayat Ujian Ditemukan</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Tidak ada data yang sesuai dengan kata kunci pencarian atau filter yang dipilih. Coba reset filter pencarian Anda.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
            }}
            className="mt-4 px-4 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => {
            const isPassed = item.score >= item.kkm;
            const diffScore = item.score - item.kkm;

            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200/90 hover:border-stone-300 rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info, Subject & Timestamps */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-stone-100 text-stone-700 border border-stone-200">
                        {item.category} · {item.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 ${
                          isPassed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                            : 'bg-rose-50 text-rose-800 border border-rose-200/80'
                        }`}
                      >
                        {isPassed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>TUNTAS KKM ({item.kkm})</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-700" />
                            <span>REMEDIAL (KKM: {item.kkm})</span>
                          </>
                        )}
                      </span>

                      {item.violationsCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-700" />
                          <span>{item.violationsCount}x Tab-Blur</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-stone-400">
                          Tertib (0 Pelanggaran)
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">
                        {item.subject}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">{item.title}</p>
                    </div>

                    {/* Metadata Timestamps Bar */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500 pt-1">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{item.completedDate}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          Durasi: <strong className="text-stone-700">{item.timeSpentMinutes || 75}m</strong> / {item.durationMinutes}m
                        </span>
                      </div>

                      {item.teacherName && (
                        <div className="text-[11px] text-stone-400">
                          Guru: <span className="text-stone-600 font-medium">{item.teacherName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Score Box & Action Buttons */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-100 gap-3">
                    <div className="flex items-baseline gap-2 text-right">
                      <div className="flex flex-col items-start lg:items-end">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                          Nilai Akhir
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-3xl font-bold font-mono tracking-tight ${
                              isPassed ? 'text-emerald-800' : 'text-rose-700'
                            }`}
                          >
                            {item.score}
                          </span>
                          <span className="text-xs text-stone-400 font-mono">/ 100</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-medium ${
                            diffScore >= 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {diffScore >= 0 ? `+${diffScore} dari KKM` : `${diffScore} di bawah KKM`}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReceiptModalItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-colors cursor-pointer"
                        title="Lihat & Cetak Tanda Bukti Hasil Asesmen"
                      >
                        <Printer className="w-3.5 h-3.5 text-stone-500" />
                        <span>Cetak Bukti</span>
                      </button>

                      <button
                        onClick={() => setReviewModalItem(item)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
                        title="Lihat Pembahasan & Kunci Jawaban"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Review Jawaban</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Counts Strip */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
                  <div className="flex items-center gap-4">
                    <span>
                      Total Soal: <strong className="text-stone-700 font-mono">{item.totalQuestions}</strong>
                    </span>
                    <span className="text-emerald-700">
                      Benar: <strong className="font-mono">{item.correctCount}</strong>
                    </span>
                    <span className="text-rose-700">
                      Salah: <strong className="font-mono">{item.wrongCount}</strong>
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-stone-400">
                    Akurasi:{' '}
                    <strong className="text-stone-700">
                      {Math.round((item.correctCount / item.totalQuestions) * 100)}%
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: REVIEW JAWABAN & PEMBAHASAN SOAL                    */}
      {/* ============================================================ */}
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-stone-300">
                    {reviewModalItem.category} · {reviewModalItem.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      reviewModalItem.score >= reviewModalItem.kkm
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                        : 'bg-rose-900/60 text-rose-300 border border-rose-700/60'
                    }`}
                  >
                    {reviewModalItem.score >= reviewModalItem.kkm ? 'Tuntas KKM' : 'Remedial'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Ulasan Jawaban & Pembahasan: {reviewModalItem.subject}
                </h3>
                <p className="text-xs text-stone-400">
                  {currentUser.name} · Nilai: <strong className="text-white font-mono">{reviewModalItem.score}</strong> (KKM: {reviewModalItem.kkm}) · Selesai: {reviewModalItem.completedDate}
                </p>
              </div>
              <button
                onClick={() => setReviewModalItem(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Strip */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-stone-50 border-b border-stone-200 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-400 block uppercase">Skor Akhir</span>
                <span className="text-lg font-bold font-mono text-stone-900">{reviewModalItem.score}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-400 block uppercase">Benar</span>
                <span className="text-lg font-bold font-mono text-emerald-700">{reviewModalItem.correctCount}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-400 block uppercase">Salah</span>
                <span className="text-lg font-bold font-mono text-rose-600">{reviewModalItem.wrongCount}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-400 block uppercase">Waktu</span>
                <span className="text-lg font-bold font-mono text-stone-700">{reviewModalItem.timeSpentMinutes || 75}m</span>
              </div>
            </div>

            {/* Questions Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {reviewModalItem.questions && reviewModalItem.questions.length > 0 ? (
                reviewModalItem.questions.map((q, qIndex) => {
                  const studentAns = reviewModalItem.session?.answers[q.id]?.selectedOption;
                  const isCorrect =
                    studentAns &&
                    studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase();

                  return (
                    <div
                      key={q.id}
                      className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center">
                            {qIndex + 1}
                          </span>
                          <span className="text-xs font-semibold text-stone-700 uppercase">
                            Soal {q.type === 'pg' ? 'Pilihan Ganda' : q.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {studentAns ? (
                            isCorrect ? (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Benar (+{q.points} poin)
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Salah (0 poin)
                              </span>
                            )
                          ) : (
                            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                              Jawaban Tersimpan: Skor {reviewModalItem.score >= reviewModalItem.kkm ? 'Tuntas' : 'Remedial'}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed whitespace-pre-line">
                        {q.questionText}
                      </p>

                      {/* Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {q.options.map(opt => {
                            const isChosenByStudent = studentAns === opt.id;
                            const isKeyAnswer = q.correctAnswer.includes(opt.id);

                            let optStyle = 'border-stone-200 bg-white text-stone-700';
                            if (isKeyAnswer) {
                              optStyle = 'border-emerald-300 bg-emerald-50/60 text-emerald-900 font-semibold';
                            } else if (isChosenByStudent && !isKeyAnswer) {
                              optStyle = 'border-rose-300 bg-rose-50/60 text-rose-900 font-medium';
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${optStyle}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded font-mono font-bold flex items-center justify-center bg-stone-100 text-stone-800 text-[11px]">
                                    {opt.id}
                                  </span>
                                  <span>{opt.text}</span>
                                </div>

                                <div className="flex items-center gap-1 text-[11px]">
                                  {isChosenByStudent && (
                                    <span className="text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                      Jawaban Anda
                                    </span>
                                  )}
                                  {isKeyAnswer && (
                                    <span className="text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" /> Kunci Jawaban
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Pembahasan */}
                      {q.explanation && (
                        <div className="p-3 bg-stone-100/80 border border-stone-200 rounded-lg text-xs space-y-1 text-stone-700">
                          <span className="font-bold text-stone-900 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-stone-600" />
                            Pembahasan & Penjelasan Guru:
                          </span>
                          <p className="leading-relaxed text-stone-600">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 space-y-2">
                  <BookOpen className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-600 font-medium">
                    Rekap lembar jawaban untuk mata pelajaran <strong>{reviewModalItem.subject}</strong> telah tercatat pada arsip rapor nilai semester dengan capaian skor <strong>{reviewModalItem.score}</strong>.
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Guru Pengampu: {reviewModalItem.teacherName || 'Bpk/Ibu Guru Mata Pelajaran'}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs">
              <span className="text-stone-500">
                Pencatatan resmi Asesmen CBT · SMP Negeri 1 Pandan
              </span>
              <button
                onClick={() => setReviewModalItem(null)}
                className="px-4 py-2 bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                Tutup Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CETAK BUKTI HASIL UJIAN (OFFICIAL RECEIPT / CERT)   */}
      {/* ============================================================ */}
      {receiptModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[92vh] print:m-0 print:border-none print:shadow-none print:max-h-none">
            {/* Action Bar (Hidden on print) */}
            <div className="shrink-0 p-4 bg-stone-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-tight">Pratinjau Lembar Bukti Hasil Asesmen CBT</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.print();
                    } catch (e) {
                      console.warn('print error:', e);
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setReceiptModalItem(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Printable Certificate Document */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-stone-900 bg-white print:overflow-visible">
              {/* School Header / Kop Surat */}
              <div className="border-b-2 border-stone-900 pb-4 text-center space-y-1">
                <h4 className="text-xs uppercase tracking-widest text-stone-600 font-semibold">
                  PEMERINTAH KABUPATEN TAPANULI TENGAH · DINAS PENDIDIKAN
                </h4>
                <h2 className="text-lg font-black tracking-tight text-stone-900 uppercase">
                  {schoolProfile.name || 'SMP NEGERI 1 PANDAN'}
                </h2>
                <p className="text-[11px] text-stone-500">
                  {schoolProfile.address || 'Jl. Dr. F.L. Tobing No. 12, Pandan'} · NPSN: {schoolProfile.npsn || '10204921'}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-0.5 bg-stone-100 text-stone-900 text-[11px] font-bold uppercase tracking-wider rounded border border-stone-300">
                    TANDA BUKTI HASIL ASESMEN BERBASIS KOMPUTER (CBT)
                  </span>
                </div>
              </div>

              {/* Student & Exam Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Nama Siswa:</span>
                    <strong className="text-stone-900">{currentUser.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">NISN / No. Peserta:</span>
                    <span className="font-mono font-semibold text-stone-800">
                      {currentUser.nisn} / {currentUser.nomorPeserta || 'U-24-001'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Kelas / Ruang:</span>
                    <span className="text-stone-800">{currentUser.kelas} ({currentUser.ruangUjian || 'Lab 01'})</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Mata Pelajaran:</span>
                    <strong className="text-stone-900">{receiptModalItem.subject}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Kategori Ujian:</span>
                    <span className="font-mono text-stone-800">{receiptModalItem.category} ({receiptModalItem.code})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Waktu Selesai:</span>
                    <span className="font-mono text-stone-800">{receiptModalItem.completedDate}</span>
                  </div>
                </div>
              </div>

              {/* Score Box */}
              <div className="border border-stone-300 rounded-xl p-5 bg-stone-50/60 text-center space-y-2">
                <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
                  HASIL PEROLEHAN NILAI AKHIR
                </span>
                <div className="text-5xl font-mono font-bold text-stone-900 tracking-tight">
                  {receiptModalItem.score}
                </div>
                <div className="flex items-center justify-center gap-3 text-xs pt-1">
                  <span>Standar KKM: <strong className="font-mono">{receiptModalItem.kkm}</strong></span>
                  <span>·</span>
                  <span
                    className={`font-bold ${
                      receiptModalItem.score >= receiptModalItem.kkm
                        ? 'text-emerald-800'
                        : 'text-rose-700'
                    }`}
                  >
                    STATUS: {receiptModalItem.score >= receiptModalItem.kkm ? 'TUNTAS' : 'REMEDIAL'}
                  </span>
                </div>
              </div>

              {/* Competency & Integrity Breakdown */}
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">Parameter Asesmen</th>
                      <th className="p-2.5 text-center">Capaian</th>
                      <th className="p-2.5 text-right">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-700">
                    <tr>
                      <td className="p-2.5">Jumlah Butir Soal Terjawab</td>
                      <td className="p-2.5 text-center font-mono">{receiptModalItem.totalQuestions} Soal</td>
                      <td className="p-2.5 text-right text-emerald-800 font-medium">100% Lengkap</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Jawaban Benar</td>
                      <td className="p-2.5 text-center font-mono text-emerald-800 font-bold">{receiptModalItem.correctCount} Soal</td>
                      <td className="p-2.5 text-right font-mono">Bobot Poin Penuh</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Durasi Pengerjaan</td>
                      <td className="p-2.5 text-center font-mono">{receiptModalItem.timeSpentMinutes || 75} Menit</td>
                      <td className="p-2.5 text-right text-stone-500">Tepat Waktu</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Integritas Sensor Keamanan</td>
                      <td className="p-2.5 text-center font-mono">
                        {receiptModalItem.violationsCount > 0 ? `${receiptModalItem.violationsCount}x Pelanggaran` : 'Tertib'}
                      </td>
                      <td className="p-2.5 text-right text-emerald-800 font-medium">Tervalidasi Sistem</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Digital Authentication & Signatures */}
              <div className="pt-6 border-t border-stone-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 border border-stone-300 rounded p-1 flex items-center justify-center bg-stone-50">
                    <QrCode className="w-12 h-12 text-stone-800" />
                  </div>
                  <div className="text-[10px] text-stone-400 space-y-0.5">
                    <p className="font-mono text-stone-600 font-semibold">VERIFIKASI DIGITAL CBT</p>
                    <p>Kode Validasi: CBT-{currentUser.nisn}-{receiptModalItem.code}</p>
                    <p>Dicetak Otomatis oleh Sistem Asesmen</p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-[11px] text-stone-500">Pandan, {receiptModalItem.completedDate.split(' ')[0]} {receiptModalItem.completedDate.split(' ')[1] || 'Okt'} 2026</p>
                  <p className="font-semibold text-stone-800">Proktor / Pengawas Ruangan</p>
                  <div className="h-10"></div>
                  <p className="font-bold text-stone-900 border-t border-stone-400 pt-1">
                    ( Bpk. Budi Hermanto, S.Kom )
                  </p>
                </div>
              </div>
            </div>

            {/* Footer close */}
            <div className="shrink-0 p-4 bg-stone-50 border-t border-stone-200 text-right print:hidden">
              <button
                onClick={() => setReceiptModalItem(null)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
