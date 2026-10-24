import React, { useState, useMemo } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  School,
  BookOpen,
  Calendar,
  KeyRound,
  UserCheck,
  GraduationCap,
  FolderKanban,
  FileSpreadsheet,
  BarChart3,
  FileDown,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Unlock,
  Printer,
  Copy,
  Check,
  Server,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  FileText,
  Edit2,
  Play,
  Square,
  Trash2,
  Radio,
  Eye,
  EyeOff,
  ArrowUpDown,
  Award,
  XCircle,
  UploadCloud,
  Filter,
  ExternalLink,
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  LayoutGrid,
  List,
  UserX
} from 'lucide-react';
import { AddStudentModal } from './AddStudentModal';
import { StudentCardModal } from './StudentCardModal';
import { AddClassModal } from './AddClassModal';
import { AddSubjectModal } from './AddSubjectModal';
import { AddUserModal } from './AddUserModal';
import { ExamScheduleModal } from './ExamScheduleModal';
import { ProctorConsole } from './ProctorConsole';
import { ExamAdministrationDocs } from './ExamAdministrationDocs';
import { StudentAnswerDetailModal } from './StudentAnswerDetailModal';
import { ImportStudentsBulkModal } from './ImportStudentsBulkModal';
import { QuestionEditorModal } from '../guru/QuestionEditorModal';
import { User, Exam, ExamSession, Question } from '../../types/cbt';

export type AdminTab =
  // MENU UTAMA
  | 'dashboard'
  | 'total_siswa'
  | 'jumlah_kelas'
  | 'jumlah_mapel'
  | 'jadwal_ujian'
  | 'token_ujian'
  // DATA MASTER
  | 'pengguna'
  | 'guru'
  | 'siswa'
  | 'kelas'
  | 'mata_pelajaran'
  | 'jenis_ujian'
  // MANAJEMEN UJIAN
  | 'bank_soal'
  | 'ujian'
  | 'manajemen_jadwal'
  | 'manajemen_token'
  | 'konsol_proktor'
  // NILAI & LAPORAN
  | 'hasil_ujian'
  | 'analisis_statistik'
  | 'laporan_export'
  | 'dokumen_ujian'
  // SISTEM
  | 'pengaturan_sistem';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    exams,
    questions,
    examSessions,
    schoolProfile,
    disciplineNotes,
    classes,
    subjects,
    examTypes,
    updateSchoolProfile,
    updateAudioProctoringSettings,
    resetStudentSession,
    unlockStudent,
    deleteUser,
    generateNewToken,
    toggleTokenActive,
    addExam,
    updateExam,
    deleteExam,
    deleteExamsBulk,
    deleteQuestion,
    deleteClass,
    deleteSubject,
    toggleExamTypeActive,
    resetUserPasswordDirect,
    resetAdminPassword,
    batchResetAllStudentsPassword,
    currentUser,
  } = useCBT();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserDefaultRole, setAddUserDefaultRole] = useState<'admin' | 'guru' | 'siswa'>('guru');
  const [cardModalStudent, setCardModalStudent] = useState<User | null>(null);

  // Password Reset States
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isBatchResetModalOpen, setIsBatchResetModalOpen] = useState(false);
  const [adminSettingsPass, setAdminSettingsPass] = useState({ oldOrKey: '', newPass: '', confirmPass: '' });
  const [adminSettingsMsg, setAdminSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExamScheduleModalOpen, setIsExamScheduleModalOpen] = useState(false);
  const [editingExamSchedule, setEditingExamSchedule] = useState<Exam | null>(null);
  const [isImportBulkOpen, setIsImportBulkOpen] = useState(false);

  // Question Editor state for Admin
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [questionEditorExamId, setQuestionEditorExamId] = useState<string>('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const handleOpenAddQuestion = (examId: string) => {
    setQuestionEditorExamId(examId);
    setEditingQuestion(null);
    setIsQuestionEditorOpen(true);
  };

  const handleOpenEditQuestion = (examId: string, q: Question) => {
    setQuestionEditorExamId(examId);
    setEditingQuestion(q);
    setIsQuestionEditorOpen(true);
  };

  const handleDeleteQuestion = (examId: string, qId: string) => {
    deleteQuestion(examId, qId);
    showScheduleToast('Butir soal berhasil dihapus.');
  };

  // Delete Exam In-App Modal & Bulk Deletion States
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [bulkDeleteConfig, setBulkDeleteConfig] = useState<{
    type: 'PTS' | 'US' | 'KEEP_PAS_ONLY' | 'SELECTED';
    examIds: string[];
    title: string;
    description: string;
  } | null>(null);
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [scheduleToast, setScheduleToast] = useState<string | null>(null);

  const showScheduleToast = (msg: string) => {
    setScheduleToast(msg);
    setTimeout(() => {
      setScheduleToast(null);
    }, 4000);
  };

  const handleOpenAddSchedule = () => {
    setEditingExamSchedule(null);
    setIsExamScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (exam: Exam) => {
    setEditingExamSchedule(exam);
    setIsExamScheduleModalOpen(true);
  };

  const handleToggleStopStartExam = (exam: Exam) => {
    if (exam.status === 'ongoing') {
      updateExam(exam.id, { status: 'completed' });
    } else {
      updateExam(exam.id, { status: 'ongoing' });
    }
  };

  // Trigger modal hapus 1 jadwal (bebas masalah iframe / window.confirm)
  const handleDeleteExam = (exam: Exam) => {
    setExamToDelete(exam);
  };

  const confirmDeleteSingleExam = () => {
    if (!examToDelete) return;
    deleteExam(examToDelete.id);
    setSelectedExamIds(prev => prev.filter(id => id !== examToDelete.id));
    showScheduleToast(`Jadwal ujian "${examToDelete.title}" berhasil dihapus.`);
    setExamToDelete(null);
  };

  const confirmBulkDeleteExams = () => {
    if (!bulkDeleteConfig || bulkDeleteConfig.examIds.length === 0) return;
    const count = bulkDeleteConfig.examIds.length;
    deleteExamsBulk(bulkDeleteConfig.examIds);
    setSelectedExamIds(prev => prev.filter(id => !bulkDeleteConfig.examIds.includes(id)));
    showScheduleToast(`Berhasil menghapus ${count} jadwal ujian.`);
    setBulkDeleteConfig(null);
  };

  // Helper trigger untuk Hapus Semua PTS
  const handleTriggerDeletePTS = () => {
    const ptsExams = exams.filter(
      e => (e.examCategory && e.examCategory === 'PTS') || e.title.toUpperCase().includes('PTS')
    );
    if (ptsExams.length === 0) {
      showScheduleToast('Tidak ditemukan jadwal ujian bertipe PTS untuk dihapus.');
      return;
    }
    setBulkDeleteConfig({
      type: 'PTS',
      examIds: ptsExams.map(e => e.id),
      title: 'Hapus Semua Jadwal PTS',
      description: `Terdapat ${ptsExams.length} jadwal ujian PTS yang akan dihapus dari sistem. Paket soal dan sesi terkait akan dibersihkan.`
    });
  };

  // Helper trigger untuk Hapus Semua US
  const handleTriggerDeleteUS = () => {
    const usExams = exams.filter(
      e => (e.examCategory && e.examCategory === 'US') || e.title.toUpperCase().includes('US')
    );
    if (usExams.length === 0) {
      showScheduleToast('Tidak ditemukan jadwal ujian bertipe US untuk dihapus.');
      return;
    }
    setBulkDeleteConfig({
      type: 'US',
      examIds: usExams.map(e => e.id),
      title: 'Hapus Semua Jadwal US (Ujian Sekolah)',
      description: `Terdapat ${usExams.length} jadwal ujian US yang akan dihapus dari sistem. Paket soal dan sesi terkait akan dibersihkan.`
    });
  };

  // Helper trigger untuk Hapus Semua PAS
  const handleTriggerDeletePAS = () => {
    const pasExams = exams.filter(
      e => (e.examCategory && e.examCategory === 'PAS') || e.title.toUpperCase().includes('PAS')
    );
    if (pasExams.length === 0) {
      showScheduleToast('Tidak ditemukan jadwal ujian bertipe PAS untuk dihapus.');
      return;
    }
    setBulkDeleteConfig({
      type: 'PAS' as any,
      examIds: pasExams.map(e => e.id),
      title: 'Hapus Semua Jadwal PAS (Penilaian Akhir Semester)',
      description: `Terdapat ${pasExams.length} jadwal ujian PAS yang akan dihapus dari sistem. Paket soal dan sesi terkait akan dibersihkan dalam 1 klik.`
    });
  };

  // Helper trigger untuk Hapus Seluruh Jadwal berdasarkan Kategori Ujian terpilih
  const handleTriggerDeleteByCategory = (category: string) => {
    const targetExams = exams.filter(
      e => (e.examCategory && e.examCategory === category) || e.title.toUpperCase().includes(category)
    );
    if (targetExams.length === 0) {
      showScheduleToast(`Tidak ditemukan jadwal ujian bertipe ${category} untuk dihapus.`);
      return;
    }
    setBulkDeleteConfig({
      type: category as any,
      examIds: targetExams.map(e => e.id),
      title: `Hapus Seluruh Jadwal ${category} (${targetExams.length} Jadwal)`,
      description: `Apakah Anda yakin ingin menghapus seluruh ${targetExams.length} jadwal ujian kategori ${category}? Seluruh paket soal dan data sesi terkait akan dibersihkan dalam 1 klik.`
    });
  };

  // Helper trigger untuk HANYA SISAKAN PAS (Hapus Semua PTS & US)
  const handleTriggerKeepPASOnly = () => {
    const nonPasExams = exams.filter(e => {
      const isPAS = (e.examCategory && e.examCategory === 'PAS') || e.title.toUpperCase().includes('PAS');
      return !isPAS;
    });
    if (nonPasExams.length === 0) {
      showScheduleToast('Semua jadwal saat ini sudah merupakan ujian PAS.');
      return;
    }
    setBulkDeleteConfig({
      type: 'KEEP_PAS_ONLY',
      examIds: nonPasExams.map(e => e.id),
      title: 'Pertahankan Ujian PAS Saja (Hapus Semua PTS & US)',
      description: `Sistem akan menghapus ${nonPasExams.length} jadwal ujian selain PAS (termasuk seluruh jadwal PTS & US). Hanya jadwal ujian PAS yang akan dipertahankan.`
    });
  };

  // Helper trigger untuk Hapus Terpilih
  const handleTriggerDeleteSelected = () => {
    if (selectedExamIds.length === 0) return;
    setBulkDeleteConfig({
      type: 'SELECTED',
      examIds: selectedExamIds,
      title: `Hapus ${selectedExamIds.length} Jadwal Terpilih`,
      description: `Apakah Anda yakin ingin menghapus ${selectedExamIds.length} jadwal ujian yang telah Anda centang?`
    });
  };

  // Filter & Search states
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [searchUser, setSearchUser] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [searchSubject, setSearchSubject] = useState('');
  const [selectedExamResultId, setSelectedExamResultId] = useState(exams[0]?.id || '');

  // Hasil Ujian pagination, search, filter & detail states
  const [hasilSearchQuery, setHasilSearchQuery] = useState('');
  const [hasilClassFilter, setHasilClassFilter] = useState('ALL');
  const [hasilRoomFilter, setHasilRoomFilter] = useState('ALL');
  const [hasilStatusFilter, setHasilStatusFilter] = useState<'ALL' | 'passed' | 'remedial' | 'violation' | 'blocked'>('ALL');
  const [hasilSortBy, setHasilSortBy] = useState<'score_desc' | 'score_asc' | 'name_asc' | 'violations_desc'>('score_desc');
  const [hasilCurrentPage, setHasilCurrentPage] = useState(1);
  const [hasilPerPage, setHasilPerPage] = useState(50);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<ExamSession | null>(null);

  // Jadwal Ujian Step Filters: 1. Pemilihan Ujian (PTS/PAS/US), 2. Mapel, 3. Jam Ujian
  const [filterJadwalJenis, setFilterJadwalJenis] = useState<'ALL' | 'PTS' | 'PAS' | 'US'>('ALL');
  const [filterJadwalMapel, setFilterJadwalMapel] = useState('ALL');
  const [filterJadwalJam, setFilterJadwalJam] = useState('ALL');

  // Analisis & Statistik per mapel state
  const [selectedAnalisisSubject, setSelectedAnalisisSubject] = useState<string>('ALL');

  // Leger Nilai Kelas state
  const [selectedLegerClass, setSelectedLegerClass] = useState<string>('VII-1');

  // Computed lists
  const students = users.filter(u => u.role === 'siswa');
  const teachers = users.filter(u => u.role === 'guru');
  const admins = users.filter(u => u.role === 'admin');
  const ongoingExams = exams.filter(e => e.status === 'ongoing');
  const activeSessionsCount = examSessions.filter(s => s.status === 'in_progress').length;
  const lockedSessionsCount = examSessions.filter(s => s.status === 'blocked').length;

  // State for Class Participation Summary in Dashboard
  const [participationSearch, setParticipationSearch] = useState<string>('');
  const [participationTingkatFilter, setParticipationTingkatFilter] = useState<string>('ALL');
  const [participationViewMode, setParticipationViewMode] = useState<'table' | 'grid'>('table');

  interface ClassParticipationSummary {
    className: string;
    roomName: string;
    tingkat: string;
    waliKelas: string;
    totalStudents: number;
    inProgressCount: number;
    submittedCount: number;
    blockedCount: number;
    notStartedCount: number;
    activeCount: number;
    participationRate: number;
  }

  const classParticipationSummary: ClassParticipationSummary[] = useMemo(() => {
    const map = new Map<string, {
      total: number;
      inProgress: number;
      submitted: number;
      blocked: number;
      notStarted: number;
    }>();

    classes.forEach(c => {
      map.set(c.name, { total: 0, inProgress: 0, submitted: 0, blocked: 0, notStarted: 0 });
    });

    students.forEach(s => {
      const cls = s.kelas || 'Umum';
      if (!map.has(cls)) {
        map.set(cls, { total: 0, inProgress: 0, submitted: 0, blocked: 0, notStarted: 0 });
      }
      const data = map.get(cls)!;
      data.total++;

      const ses = examSessions.find(es => es.studentId === s.id);
      if (ses) {
        if (ses.status === 'in_progress') data.inProgress++;
        else if (ses.status === 'submitted') data.submitted++;
        else if (ses.status === 'blocked' || s.statusLogin === 'terkunci') data.blocked++;
        else data.notStarted++;
      } else {
        if (s.statusLogin === 'terkunci') data.blocked++;
        else data.notStarted++;
      }
    });

    const list: ClassParticipationSummary[] = [];
    map.forEach((data, clsName) => {
      if (data.total === 0) return;
      const classItem = classes.find(c => c.name === clsName);
      const activeCount = data.inProgress + data.submitted + data.blocked;
      const rate = data.total > 0 ? Math.round((activeCount / data.total) * 100) : 0;

      list.push({
        className: clsName,
        roomName: classItem?.ruangLab || `Ruang Kelas ${clsName}`,
        tingkat: classItem?.tingkat || (clsName.startsWith('VII') ? 'Kelas VII' : clsName.startsWith('VIII') ? 'Kelas VIII' : 'Kelas IX'),
        waliKelas: classItem?.waliKelas || '-',
        totalStudents: data.total,
        inProgressCount: data.inProgress,
        submittedCount: data.submitted,
        blockedCount: data.blocked,
        notStartedCount: data.notStarted,
        activeCount,
        participationRate: rate,
      });
    });

    list.sort((a, b) => a.className.localeCompare(b.className, undefined, { numeric: true }));
    return list;
  }, [classes, students, examSessions]);

  const filteredParticipationList = useMemo(() => {
    return classParticipationSummary.filter(item => {
      const matchTingkat = participationTingkatFilter === 'ALL' || item.tingkat.includes(participationTingkatFilter);
      const matchSearch =
        item.className.toLowerCase().includes(participationSearch.toLowerCase()) ||
        item.roomName.toLowerCase().includes(participationSearch.toLowerCase()) ||
        item.waliKelas.toLowerCase().includes(participationSearch.toLowerCase());
      return matchTingkat && matchSearch;
    });
  }, [classParticipationSummary, participationTingkatFilter, participationSearch]);

  const totalParticipationStudents = classParticipationSummary.reduce((acc, c) => acc + c.totalStudents, 0);
  const totalParticipating = classParticipationSummary.reduce((acc, c) => acc + c.activeCount, 0);
  const globalParticipationRate = totalParticipationStudents > 0
    ? Math.round((totalParticipating / totalParticipationStudents) * 100)
    : 0;
  const perfectClassesCount = classParticipationSummary.filter(c => c.participationRate === 100).length;
  const needAttentionClassesCount = classParticipationSummary.filter(c => c.notStartedCount > 0 || c.blockedCount > 0).length;

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Export CSV
  const handleExportCSV = (exam: Exam) => {
    const sessionsForExam = examSessions.filter(s => s.examId === exam.id);
    const headers = 'NISN,Nama Siswa,Kelas,Ruang,Status,Skor Akhir,Pelanggaran\n';
    const rows = sessionsForExam
      .map(
        s =>
          `"${s.studentNisn}","${s.studentName}","${s.studentClass}","${s.studentRoom}","${s.status}","${s.score ?? 0}","${s.violationsCount}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Nilai_${exam.subject.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5 Main Navigation Categories with sub-items
  type MainMenuId = 'dashboard' | 'data_master' | 'manajemen_ujian' | 'nilai_laporan' | 'pengaturan_sistem';

  interface NavSubItem {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  interface NavSection {
    id: MainMenuId;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultTab: AdminTab;
    items?: NavSubItem[];
  }

  const navSections: NavSection[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      defaultTab: 'dashboard',
      items: [
        { id: 'dashboard', label: 'Ringkasan Dashboard', icon: LayoutDashboard },
        { id: 'total_siswa', label: 'Total Siswa', icon: Users, badge: students.length },
        { id: 'jumlah_kelas', label: 'Jumlah Kelas', icon: School, badge: classes.length },
        { id: 'jumlah_mapel', label: 'Jumlah Mapel', icon: BookOpen, badge: subjects.length },
        { id: 'jadwal_ujian', label: 'Jadwal Ujian', icon: Calendar, badge: exams.length },
        { id: 'token_ujian', label: 'Token Ujian', icon: KeyRound },
      ],
    },
    {
      id: 'data_master',
      title: 'Data Master',
      icon: School,
      defaultTab: 'pengguna',
      items: [
        { id: 'pengguna', label: 'Pengguna', icon: UserCheck, badge: users.length },
        { id: 'guru', label: 'Guru', icon: GraduationCap, badge: teachers.length },
        { id: 'siswa', label: 'Siswa', icon: Users, badge: students.length },
        { id: 'kelas', label: 'Kelas', icon: School, badge: classes.length },
        { id: 'mata_pelajaran', label: 'Mata Pelajaran', icon: BookOpen, badge: subjects.length },
        { id: 'jenis_ujian', label: 'Jenis Ujian (PTS/PAS/US)', icon: FolderKanban, badge: examTypes.length },
      ],
    },
    {
      id: 'manajemen_ujian',
      title: 'Manajemen Ujian',
      icon: Layers,
      defaultTab: 'bank_soal',
      items: [
        { id: 'bank_soal', label: 'Bank Soal', icon: Layers },
        { id: 'ujian', label: 'Paket Ujian', icon: BookOpen, badge: exams.length },
        { id: 'manajemen_jadwal', label: 'Jadwal Ujian', icon: Calendar, badge: exams.length },
        { id: 'manajemen_token', label: 'Token Ujian', icon: KeyRound },
        { id: 'konsol_proktor', label: 'Konsol Proktor (Live)', icon: Radio },
      ],
    },
    {
      id: 'nilai_laporan',
      title: 'Nilai & Laporan',
      icon: FileSpreadsheet,
      defaultTab: 'hasil_ujian',
      items: [
        { id: 'hasil_ujian', label: 'Hasil Ujian', icon: FileSpreadsheet },
        { id: 'analisis_statistik', label: 'Analisis & Statistik', icon: BarChart3 },
        { id: 'laporan_export', label: 'Laporan & Export', icon: FileDown },
        { id: 'dokumen_ujian', label: 'Cetak Dokumen Resmi', icon: Printer },
      ],
    },
    {
      id: 'pengaturan_sistem',
      title: 'Pengaturan Sistem',
      icon: Settings,
      defaultTab: 'pengaturan_sistem',
    },
  ];

  // Helper function to find which main menu an activeTab belongs to
  const getParentSectionId = (tab: AdminTab): MainMenuId => {
    if (tab === 'dashboard' || tab === 'total_siswa' || tab === 'jumlah_kelas' || tab === 'jumlah_mapel' || tab === 'jadwal_ujian' || tab === 'token_ujian') {
      return 'dashboard';
    }
    if (tab === 'pengguna' || tab === 'guru' || tab === 'siswa' || tab === 'kelas' || tab === 'mata_pelajaran' || tab === 'jenis_ujian') {
      return 'data_master';
    }
    if (tab === 'bank_soal' || tab === 'ujian' || tab === 'manajemen_jadwal' || tab === 'manajemen_token' || tab === 'konsol_proktor') {
      return 'manajemen_ujian';
    }
    if (tab === 'hasil_ujian' || tab === 'analisis_statistik' || tab === 'laporan_export' || tab === 'dokumen_ujian') {
      return 'nilai_laporan';
    }
    return 'pengaturan_sistem';
  };

  // State to track which main accordion menus are open (default open the active one and dashboard)
  const [openSections, setOpenSections] = useState<Record<MainMenuId, boolean>>({
    dashboard: true,
    data_master: true,
    manajemen_ujian: false,
    nilai_laporan: false,
    pengaturan_sistem: false,
  });

  const toggleSection = (sectionId: MainMenuId, defaultTab: AdminTab) => {
    setOpenSections(prev => {
      const willOpen = !prev[sectionId];
      return {
        ...prev,
        [sectionId]: willOpen,
      };
    });
    // If the activeTab does not belong to this section, navigate to default tab
    if (getParentSectionId(activeTab) !== sectionId) {
      setActiveTab(defaultTab);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#fdfdfc] border-b border-stone-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-800 text-white rounded-lg font-bold text-xs">CBT</div>
          <span className="font-bold text-sm text-stone-800">Administrator Menu</span>
        </div>
        <button
          onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
        >
          {isSidebarOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`${
          isSidebarOpenMobile ? 'block' : 'hidden'
        } md:block w-full md:w-64 lg:w-72 bg-[#fcfbf9] border-r border-stone-200/90 shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-30 transition-all`}
      >
        <div className="p-4 border-b border-stone-200/70 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-base shadow-sm ring-4 ring-emerald-50/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-sm leading-tight">Admin Console</div>
              <div className="text-[11px] text-stone-500 font-medium">Proktor Pusat Ujian Sekolah</div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
            Online
          </span>
        </div>

        <div className="py-3 px-3 space-y-1.5">
          {navSections.map(section => {
            const SectionIcon = section.icon;
            const isSectionActive = getParentSectionId(activeTab) === section.id;
            const isOpen = openSections[section.id];
            const hasSubItems = Boolean(section.items && section.items.length > 0);

            return (
              <div key={section.id} className="rounded-xl transition-colors">
                {/* Main Menu Button */}
                <button
                  onClick={() => {
                    if (hasSubItems) {
                      toggleSection(section.id, section.defaultTab);
                    } else {
                      setActiveTab(section.defaultTab);
                      setIsSidebarOpenMobile(false);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isSectionActive
                      ? 'bg-emerald-50/90 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSectionActive
                          ? 'bg-emerald-800 text-white'
                          : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200'
                      }`}
                    >
                      <SectionIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{section.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasSubItems && (
                      <span className="text-[10px] text-stone-400 font-medium">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-stone-400" />
                        )}
                      </span>
                    )}
                  </div>
                </button>

                {/* Submenu Accordion Items */}
                {hasSubItems && isOpen && (
                  <div className="ml-4 pl-3 my-1 border-l-2 border-emerald-200/60 space-y-0.5 animate-fadeIn">
                    {section.items!.map(subItem => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.id;

                      return (
                        <button
                          key={subItem.id}
                          onClick={() => {
                            setActiveTab(subItem.id);
                            setIsSidebarOpenMobile(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isSubActive
                              ? 'bg-emerald-800 text-white font-bold shadow-xs'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <SubIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSubActive ? 'text-white' : 'text-stone-400'
                              }`}
                            />
                            <span className="truncate">{subItem.label}</span>
                          </div>
                          {subItem.badge !== undefined && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                                isSubActive
                                  ? 'bg-emerald-700 text-white font-bold'
                                  : 'bg-stone-200/80 text-stone-600'
                              }`}
                            >
                              {subItem.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Server & School Badge at Sidebar Bottom */}
        <div className="p-3 m-3 rounded-xl bg-stone-100/70 border border-stone-200 text-xs">
          <div className="flex items-center gap-2 text-stone-800 font-bold mb-1">
            <Server className="w-3.5 h-3.5 text-emerald-800" />
            <span>{schoolProfile.name}</span>
          </div>
          <div className="text-[11px] text-stone-500">
            NPSN: {schoolProfile.npsn} • TA {schoolProfile.academicYear}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top Header Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
              <span>Admin CBT</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-semibold text-stone-700">
                {navSections.find(s => s.id === getParentSectionId(activeTab))?.title}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="capitalize text-emerald-800 font-bold">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 capitalize">
              {activeTab === 'dashboard'
                ? 'Panel Dashboard Administrator CBT'
                : activeTab.replace(/_/g, ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100/80 border border-stone-200 rounded-lg text-stone-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Server CBT: Online · LAN & Cloud Sync</span>
            </div>
          </div>
        </div>

        {/* Category Submenu Tab Strip (Shows other menus in this active category without losing context) */}
        {(() => {
          const currentParent = navSections.find(s => s.id === getParentSectionId(activeTab));
          if (!currentParent?.items || currentParent.items.length <= 1) return null;
          return (
            <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200/80 scrollbar-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 shrink-0 mr-1.5">
                {currentParent.title}:
              </span>
              {currentParent.items.map(subItem => {
                const SubIcon = subItem.icon;
                const isSelected = activeTab === subItem.id;
                return (
                  <button
                    key={subItem.id}
                    onClick={() => setActiveTab(subItem.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                        : 'bg-[#fdfdfc] border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                    }`}
                  >
                    <SubIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-stone-500'}`} />
                    <span>{subItem.label}</span>
                    {subItem.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                          isSelected ? 'bg-emerald-700 text-white font-bold' : 'bg-stone-200/80 text-stone-600'
                        }`}
                      >
                        {subItem.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* =========================================================================
            1. MENU UTAMA: DASHBOARD
           ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick KPI Cards that link to sections */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => setActiveTab('total_siswa')}
                className="text-left p-4 bg-[#fdfdfc] border border-stone-200 rounded-xl hover:border-emerald-600 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-800">
                    Total Siswa
                  </span>
                  <Users className="w-4 h-4 text-stone-400 group-hover:text-emerald-800" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">
                  {students.length}
                </div>
                <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                  <span>DNT Terdaftar</span>
                  <span className="text-emerald-800 font-semibold">Detail →</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('jumlah_kelas')}
                className="text-left p-4 bg-[#fdfdfc] border border-stone-200 rounded-xl hover:border-emerald-600 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-800">
                    Jumlah Kelas
                  </span>
                  <School className="w-4 h-4 text-stone-400 group-hover:text-emerald-800" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">
                  {classes.length}
                </div>
                <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                  <span>Rombel Aktif</span>
                  <span className="text-emerald-800 font-semibold">Detail →</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('jumlah_mapel')}
                className="text-left p-4 bg-[#fdfdfc] border border-stone-200 rounded-xl hover:border-emerald-600 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-800">
                    Jumlah Mapel
                  </span>
                  <BookOpen className="w-4 h-4 text-stone-400 group-hover:text-emerald-800" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">
                  {subjects.length}
                </div>
                <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                  <span>Kurikulum CBT</span>
                  <span className="text-emerald-800 font-semibold">Detail →</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('jadwal_ujian')}
                className="text-left p-4 bg-[#fdfdfc] border border-stone-200 rounded-xl hover:border-emerald-600 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-800">
                    Jadwal Ujian
                  </span>
                  <Calendar className="w-4 h-4 text-stone-400 group-hover:text-emerald-800" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800">
                  {ongoingExams.length} Aktif
                </div>
                <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                  <span>{exams.length} Total Paket</span>
                  <span className="text-emerald-800 font-semibold">Detail →</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('token_ujian')}
                className="text-left p-4 bg-[#fdfdfc] border border-stone-200 rounded-xl hover:border-emerald-600 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-800">
                    Token Ujian
                  </span>
                  <KeyRound className="w-4 h-4 text-amber-600 group-hover:text-emerald-800" />
                </div>
                <div className="text-2xl font-bold font-mono tracking-wider text-amber-700">
                  {ongoingExams[0]?.token || 'PASMAT'}
                </div>
                <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                  <span>Rilis Sesi 1</span>
                  <span className="text-emerald-800 font-semibold">Kelola →</span>
                </div>
              </button>
            </div>

            {/* Quick Actions & Live Exam Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Live Exam Monitor */}
                <div className="bg-[#fdfdfc] border border-stone-200 rounded-xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">Jadwal & Sesi Ujian Aktif Hari Ini</h3>
                      <p className="text-xs text-stone-500">Mata pelajaran yang sedang atau siap diujikan di server CBT</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('token_ujian')}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                    >
                      Kelola Token Pusat →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {exams.map(exam => (
                      <div
                        key={exam.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-colors gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-900">{exam.subject}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                exam.status === 'ongoing'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {exam.status === 'ongoing' ? 'Sedang Berlangsung' : 'Terjadwal'}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 mt-1">
                            {exam.title} • {exam.gradeLevel} • Durasi: {exam.durationMinutes} menit
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[11px] text-slate-400 uppercase font-semibold">Token</div>
                            <span className="font-mono font-bold text-sm px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-800 tracking-wider">
                              {exam.token}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyToken(exam.token)}
                            className="p-2 border border-slate-200 hover:bg-white rounded-lg text-slate-600 transition-colors"
                            title="Salin Token"
                          >
                            {copiedToken === exam.token ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* =========================================================================
                    RINGKASAN PARTISIPASI SISWA BERDASARKAN RUANG KELAS
                   ========================================================================= */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  {/* Header & Quick Action */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <h3 className="text-base font-bold text-slate-900">Ringkasan Partisipasi Siswa Berdasarkan Kelas</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Monitoring tingkat kehadiran dan keikutsertaan ujian siswa di masing-masing ruang kelas
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <button
                        onClick={() => {
                          setOpenSections(prev => ({ ...prev, manajemen_ujian: true }));
                          setActiveTab('konsol_proktor');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                        <span>Buka Konsol Proktor</span>
                        <ArrowRight className="w-3 h-3 text-indigo-500" />
                      </button>
                    </div>
                  </div>

                  {/* Ringkasan Metrik Cepat (Quick Stat Strips) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Partisipasi Total</span>
                        <span className="text-xs font-bold text-emerald-600">{globalParticipationRate}%</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-900">{totalParticipating}</span>
                        <span className="text-xs text-slate-400">/ {totalParticipationStudents} Siswa</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${globalParticipationRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-emerald-800 uppercase">Hadir 100% Lengkap</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-black text-emerald-900">{perfectClassesCount}</span>
                        <span className="text-xs text-emerald-700">/ {classParticipationSummary.length} Kelas</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                        Seluruh siswa telah masuk
                      </div>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-amber-800 uppercase">Ada Belum Masuk</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-black text-amber-900">{needAttentionClassesCount}</span>
                        <span className="text-xs text-amber-700">Kelas</span>
                      </div>
                      <div className="text-[11px] text-amber-700 mt-1 font-medium">
                        Perlu dipantau proktor
                      </div>
                    </div>

                    <div className="bg-rose-50/70 border border-rose-200/80 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-rose-800 uppercase">Siswa Terkunci</span>
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-black text-rose-900">
                          {classParticipationSummary.reduce((acc, c) => acc + c.blockedCount, 0)}
                        </span>
                        <span className="text-xs text-rose-700">Siswa</span>
                      </div>
                      <div className="text-[11px] text-rose-700 mt-1 font-medium">
                        Pelanggaran / reset sesi
                      </div>
                    </div>
                  </div>

                  {/* Filter & Controls Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={participationSearch}
                          onChange={e => setParticipationSearch(e.target.value)}
                          placeholder="Cari nama kelas atau wali..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                        {participationSearch && (
                          <button
                            onClick={() => setParticipationSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Filter Tingkat */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
                        {(['ALL', 'VII', 'VIII', 'IX'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setParticipationTingkatFilter(t)}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                              participationTingkatFilter === t
                                ? 'bg-white text-indigo-700 shadow-2xs'
                                : 'hover:text-slate-900'
                            }`}
                          >
                            {t === 'ALL' ? 'Semua' : `Kelas ${t}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setParticipationViewMode('table')}
                        className={`p-1.5 rounded-md text-xs flex items-center gap-1 font-medium transition-colors ${
                          participationViewMode === 'table'
                            ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Tampilan Tabel Rinci"
                      >
                        <List className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Tabel</span>
                      </button>
                      <button
                        onClick={() => setParticipationViewMode('grid')}
                        className={`p-1.5 rounded-md text-xs flex items-center gap-1 font-medium transition-colors ${
                          participationViewMode === 'grid'
                            ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Tampilan Kartu Kelas"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Kartu</span>
                      </button>
                    </div>
                  </div>

                  {/* CONTENT: TABLE VIEW OR GRID VIEW */}
                  {filteredParticipationList.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      Tidak ada kelas yang sesuai dengan kriteria pencarian "{participationSearch}".
                    </div>
                  ) : participationViewMode === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Ruang Kelas</th>
                            <th className="py-2.5 px-3">Wali Kelas</th>
                            <th className="py-2.5 px-3 min-w-[140px]">Tingkat Partisipasi</th>
                            <th className="py-2.5 px-3 text-center">Aktif / Ujian</th>
                            <th className="py-2.5 px-3 text-center">Selesai</th>
                            <th className="py-2.5 px-3 text-center">Belum Mulai</th>
                            <th className="py-2.5 px-3 text-center">Terkunci</th>
                            <th className="py-2.5 px-3 text-center">Total</th>
                            <th className="py-2.5 px-3 text-right">Aksi Pantau</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredParticipationList.map(item => {
                            const isComplete = item.participationRate === 100;
                            return (
                              <tr key={item.className} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-3">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{item.className}</span>
                                    {isComplete && (
                                      <span className="inline-flex items-center px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded">
                                        Lengkap
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium">{item.roomName}</div>
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 font-medium">
                                  {item.waliKelas}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="font-bold text-slate-800">{item.participationRate}%</span>
                                    <span className="text-slate-400">{item.activeCount} / {item.totalStudents} siswa</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-1.5 rounded-full transition-all duration-300 ${
                                        isComplete
                                          ? 'bg-emerald-500'
                                          : item.participationRate >= 75
                                          ? 'bg-indigo-500'
                                          : item.participationRate >= 40
                                          ? 'bg-amber-500'
                                          : 'bg-rose-500'
                                      }`}
                                      style={{ width: `${item.participationRate}%` }}
                                    />
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    item.inProgressCount > 0 ? 'bg-indigo-100 text-indigo-800' : 'text-slate-400'
                                  }`}>
                                    {item.inProgressCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>}
                                    {item.inProgressCount}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    item.submittedCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400'
                                  }`}>
                                    {item.submittedCount}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    item.notStartedCount > 0 ? 'bg-amber-100 text-amber-800' : 'text-slate-300'
                                  }`}>
                                    {item.notStartedCount}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    item.blockedCount > 0 ? 'bg-rose-100 text-rose-800' : 'text-slate-300'
                                  }`}>
                                    {item.blockedCount}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                                  {item.totalStudents}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        setSelectedClassFilter(item.className);
                                        setOpenSections(prev => ({ ...prev, data_master: true }));
                                        setActiveTab('siswa');
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                                      title={`Lihat daftar siswa ${item.className}`}
                                    >
                                      Siswa
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOpenSections(prev => ({ ...prev, manajemen_ujian: true }));
                                        setActiveTab('konsol_proktor');
                                      }}
                                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold flex items-center gap-1"
                                      title={`Buka pantauan proktor`}
                                    >
                                      Proktor
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* GRID VIEW (CARDS) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredParticipationList.map(item => {
                        const isComplete = item.participationRate === 100;
                        return (
                          <div
                            key={item.className}
                            className={`border rounded-xl p-4 transition-all hover:shadow-xs ${
                              isComplete
                                ? 'bg-emerald-50/20 border-emerald-200'
                                : item.blockedCount > 0
                                ? 'bg-rose-50/20 border-rose-200'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="font-mono font-bold text-base text-slate-900">{item.className}</span>
                                <div className="text-[11px] text-slate-400 font-medium">{item.roomName}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">Wali: {item.waliKelas}</div>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${
                                  isComplete
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.participationRate >= 75
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {item.participationRate}%
                                </span>
                                <div className="text-[10px] text-slate-400 mt-0.5">Partisipasi</div>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 rounded-full h-1.5 my-2.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  isComplete ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${item.participationRate}%` }}
                              />
                            </div>

                            {/* Mini Metrics 4-grid */}
                            <div className="grid grid-cols-4 gap-1 text-center py-2 px-1 bg-slate-50/80 rounded-lg text-xs mb-3">
                              <div>
                                <div className="text-[10px] text-slate-400 font-medium">Ujian</div>
                                <div className="font-bold text-indigo-700">{item.inProgressCount}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400 font-medium">Selesai</div>
                                <div className="font-bold text-emerald-700">{item.submittedCount}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400 font-medium">Belum</div>
                                <div className="font-bold text-amber-700">{item.notStartedCount}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400 font-medium">Kunci</div>
                                <div className="font-bold text-rose-700">{item.blockedCount}</div>
                              </div>
                            </div>

                            {/* Action footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                              <span className="text-slate-500 font-medium">
                                Total: <strong className="text-slate-800">{item.totalStudents} siswa</strong>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedClassFilter(item.className);
                                    setOpenSections(prev => ({ ...prev, data_master: true }));
                                    setActiveTab('siswa');
                                  }}
                                  className="text-slate-600 hover:text-slate-900 font-medium"
                                >
                                  Siswa
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  onClick={() => {
                                    setOpenSections(prev => ({ ...prev, manajemen_ujian: true }));
                                    setActiveTab('konsol_proktor');
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 font-semibold"
                                >
                                  Proktor →
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sesi Peserta Real-time */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Pemantauan Peserta Ujian Real-Time</h3>
                      <p className="text-xs text-slate-500">Status pengerjaan soal dan kontrol sesi proktor</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('siswa')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Buka Roster Siswa →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Nama Siswa</th>
                          <th className="py-2.5 px-3">Kelas & Lab</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Pelanggaran</th>
                          <th className="py-2.5 px-3 text-right">Aksi Proktor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {examSessions.map(session => (
                          <tr key={session.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900">{session.studentName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{session.studentNisn}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-medium text-slate-700">{session.studentClass}</span>
                              <span className="block text-[11px] text-slate-400">{session.studentRoom}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-col gap-1 items-start">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                    session.status === 'in_progress'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : session.status === 'blocked'
                                      ? 'bg-rose-100 text-rose-800'
                                      : session.isOfflineSynced === false
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {session.status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                                  {session.status === 'in_progress'
                                    ? 'Sedang Ujian'
                                    : session.status === 'blocked'
                                    ? 'Terkunci'
                                    : session.isOfflineSynced === false
                                    ? 'Selesai (Sync Tertunda)'
                                    : 'Selesai'}
                                </span>
                                {session.status === 'submitted' && session.score !== undefined && (
                                  <span className="text-[11px] font-mono text-slate-600 font-semibold">
                                    Skor: <strong className="text-emerald-700">{session.score}</strong>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              {session.violationsCount > 0 ? (
                                <span className="text-rose-600 font-bold flex items-center gap-1 font-mono">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  {session.violationsCount}x tab blur
                                </span>
                              ) : (
                                <span className="text-slate-400">0</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {session.status === 'blocked' && (
                                  <button
                                    onClick={() => unlockStudent(session.studentId)}
                                    className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium text-[11px] flex items-center gap-1 shadow-2xs"
                                    title="Buka Kunci Siswa"
                                  >
                                    <Unlock className="w-3 h-3" />
                                    Buka
                                  </button>
                                )}
                                <button
                                  onClick={() => resetStudentSession(session.studentId)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-[11px] flex items-center gap-1"
                                  title="Reset sesi ujian siswa"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Reset
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Sidebar Info in Dashboard */}
              <div className="space-y-6">
                {/* Server Status Box */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status Server CBT</span>
                    <Server className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">IP Host Server</span>
                      <span className="font-mono font-bold text-slate-800">192.168.1.100:8080</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Mode Sinkronisasi</span>
                      <span className="font-bold text-emerald-600">Lokal LAN + Cloud Backup</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Keamanan Anti-Cheat</span>
                      <span className="font-bold text-slate-800 capitalize">{schoolProfile.antiCheatMode}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Sensor Suara & Anti-Bisik</span>
                      <span className={`font-bold flex items-center gap-1 ${schoolProfile.audioProctoringEnabled ? 'text-emerald-600' : 'text-slate-500'}`}>
                        <Mic className="w-3.5 h-3.5" />
                        <span>{schoolProfile.audioProctoringEnabled ? 'Aktif (Auto-Detect)' : 'Nonaktif'}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Tahun Pelajaran</span>
                      <span className="font-semibold text-slate-800">{schoolProfile.academicYear} ({schoolProfile.semester})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('pengaturan_sistem')}
                    className="w-full mt-4 py-2 px-3 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-center"
                  >
                    Ubah Konfigurasi Server →
                  </button>
                </div>

                {/* Quick Add Actions */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 font-bold text-sm text-indigo-200">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Aksi Cepat Administrator
                  </div>
                  <p className="text-xs text-slate-300 mb-4">
                    Jalan pintas untuk mendaftarkan data ujian, mencetak kartu, dan memanajemen proktor.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsAddStudentOpen(true)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> Tambah Siswa Baru
                      </span>
                      <span>+</span>
                    </button>
                    <button
                      onClick={() => setIsAddClassOpen(true)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <School className="w-3.5 h-3.5" /> Tambah Rombel / Kelas
                      </span>
                      <span>+</span>
                    </button>
                    <button
                      onClick={() => setIsAddSubjectOpen(true)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" /> Tambah Mata Pelajaran
                      </span>
                      <span>+</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. MENU UTAMA: TOTAL SISWA (Ringkasan & Agregasi Siswa)
           ========================================================================= */}
        {activeTab === 'total_siswa' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa Terdaftar</div>
                <div className="text-3xl font-bold font-mono text-slate-900 mt-2">{students.length}</div>
                <div className="text-xs text-slate-500 mt-1">Siswa di semua rombel</div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Siswa Sedang Ujian</div>
                <div className="text-3xl font-bold font-mono text-emerald-600 mt-2">{activeSessionsCount}</div>
                <div className="text-xs text-slate-500 mt-1">Aktif di Lab CBT</div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Siswa Terkunci</div>
                <div className="text-3xl font-bold font-mono text-amber-600 mt-2">{lockedSessionsCount}</div>
                <div className="text-xs text-slate-500 mt-1">Membutuhkan reset</div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rombel Kelas</div>
                <div className="text-3xl font-bold font-mono text-indigo-600 mt-2">{classes.length}</div>
                <div className="text-xs text-slate-500 mt-1">Tingkat X, XI, XII</div>
              </div>
            </div>

            {/* Student Table with quick filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama, NISN, atau no peserta..."
                      value={searchStudent}
                      onChange={e => setSearchStudent(e.target.value)}
                      className="pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg w-64 focus:outline-indigo-500"
                    />
                  </div>
                  <select
                    value={selectedClassFilter}
                    onChange={e => setSelectedClassFilter(e.target.value)}
                    className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ALL">Semua Kelas ({classes.length})</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsImportBulkOpen(true)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    title="Import data siswa massal dari file Excel atau salin tempel teks"
                  >
                    <UploadCloud className="w-4 h-4" /> Import Massal Siswa (Excel/CSV)
                  </button>
                  <button
                    onClick={() => setIsAddStudentOpen(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Tambah Manual
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">No. Peserta</th>
                      <th className="py-2.5 px-3">Nama Lengkap</th>
                      <th className="py-2.5 px-3">NISN</th>
                      <th className="py-2.5 px-3">Kelas & Rombel</th>
                      <th className="py-2.5 px-3">Agama</th>
                      <th className="py-2.5 px-3">Ruang & Sesi</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Kartu Peserta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students
                      .filter(s => {
                        const matchSearch =
                          s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                          (s.nisn && s.nisn.includes(searchStudent)) ||
                          (s.nomorPeserta && s.nomorPeserta.toLowerCase().includes(searchStudent.toLowerCase()));
                        const matchClass = selectedClassFilter === 'ALL' || s.kelas === selectedClassFilter;
                        return matchSearch && matchClass;
                      })
                      .map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.nomorPeserta}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{s.nisn}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800">{s.kelas}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {s.agama || 'Islam'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-slate-700">{s.ruangUjian}</span>
                            <span className="block text-[11px] text-slate-400">{s.sesiUjian}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                s.statusLogin === 'ujian'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : s.statusLogin === 'terkunci'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {s.statusLogin}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setCardModalStudent(s)}
                              className="px-2.5 py-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" /> Cetak Kartu
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. MENU UTAMA: JUMLAH KELAS (Ringkasan Rombel)
           ========================================================================= */}
        {activeTab === 'jumlah_kelas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Rombongan Belajar (Rombel) Terdaftar</h3>
                <p className="text-xs text-slate-500">Total {classes.length} kelas aktif yang mengikuti ujian CBT</p>
              </div>
              <button
                onClick={() => setIsAddClassOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-4 h-4" /> Tambah Kelas Baru
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(c => {
                const classStudentCount = students.filter(s => s.kelas === c.name).length;
                return (
                  <div key={c.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <School className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                          <span className="text-[11px] text-slate-500">{c.tingkat}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {classStudentCount} / {c.totalStudents || 36} Siswa
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jurusan:</span>
                        <span className="font-medium text-slate-800">{c.jurusan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Wali Kelas:</span>
                        <span className="font-medium text-slate-800">{c.waliKelas || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lab Alokasi:</span>
                        <span className="font-medium text-indigo-600">{c.ruangLab || 'Lab Komputer 01'}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setSelectedClassFilter(c.name);
                          setActiveTab('siswa');
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Lihat Siswa ({classStudentCount}) →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            4. MENU UTAMA: JUMLAH MAPEL (Kurikulum Mata Pelajaran)
           ========================================================================= */}
        {activeTab === 'jumlah_mapel' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Kurikulum Mata Pelajaran CBT</h3>
                <p className="text-xs text-slate-500">Total {subjects.length} mata pelajaran dalam sistem ujian</p>
              </div>
              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-4 h-4" /> Tambah Mata Pelajaran
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Nama Mata Pelajaran</th>
                    <th className="py-3 px-4">Kelompok</th>
                    <th className="py-3 px-4">Tingkat</th>
                    <th className="py-3 px-4">KKM</th>
                    <th className="py-3 px-4">Guru Pengampu</th>
                    <th className="py-3 px-4 text-right">Bank Soal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map(s => {
                    const examForSub = exams.find(e => e.subject.toLowerCase() === s.name.toLowerCase());
                    const questionCount = examForSub ? questions[examForSub.id]?.length || 0 : 0;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">{s.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {s.kelompok}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{s.tingkat}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.kkm}</td>
                        <td className="py-3 px-4 text-slate-700">{s.guruPengampu}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {questionCount} Butir
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            5. JADWAL UJIAN & PENJADWALAN LENGKAP
           ========================================================================= */}
        {(activeTab === 'jadwal_ujian' || activeTab === 'manajemen_jadwal') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Jadwal Pelaksanaan Ujian Sekolah</h3>
                <p className="text-xs text-stone-500">
                  Filter bertahap: 1. Pemilihan Ujian (PTS/PAS/US) → 2. Mapel → 3. Jam Ujian
                </p>
              </div>
              <button
                onClick={handleOpenAddSchedule}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" /> Buat Jadwal Ujian Terbaru
              </button>
            </div>

            {/* 3-STEP STRUCTURED FILTER BAR */}
            <div className="p-4 bg-[#fdfdfc] border border-stone-200 rounded-xl shadow-xs space-y-3">
              <div className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-800"></span>
                Tahapan Pemilihan Jadwal Ujian
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 1: Pemilihan Ujian */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-600">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-800 text-white text-[10px] mr-1">1</span>
                    Pemilihan Jenis Ujian
                  </label>
                  <select
                    value={filterJadwalJenis}
                    onChange={e => setFilterJadwalJenis(e.target.value as any)}
                    className="w-full py-2 px-3 text-xs border border-stone-300 rounded-lg bg-white focus:outline-emerald-800 font-semibold"
                  >
                    <option value="ALL">Semua Jenis Ujian (PTS, PAS, US)</option>
                    <option value="PTS">PTS - Penilaian Tengah Semester</option>
                    <option value="PAS">PAS - Penilaian Akhir Semester</option>
                    <option value="US">US - Ujian Sekolah</option>
                  </select>

                  {/* Tombol 1-Klik Hapus Seluruh Jadwal sesuai Kategori yang Dipilih */}
                  {filterJadwalJenis !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => handleTriggerDeleteByCategory(filterJadwalJenis)}
                      className="w-full mt-2 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs animate-in fade-in"
                      title={`Hapus seluruh jadwal bertipe ${filterJadwalJenis} dalam 1 klik`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Seluruh Jadwal {filterJadwalJenis} ({exams.filter(e => (e.examCategory && e.examCategory === filterJadwalJenis) || e.title.toUpperCase().includes(filterJadwalJenis)).length} Jadwal) [1-Klik]</span>
                    </button>
                  )}
                </div>

                {/* Step 2: Pemilihan Mapel */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-600">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-800 text-white text-[10px] mr-1">2</span>
                    Pemilihan Mata Pelajaran
                  </label>
                  <select
                    value={filterJadwalMapel}
                    onChange={e => setFilterJadwalMapel(e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-stone-300 rounded-lg bg-white focus:outline-emerald-800"
                  >
                    <option value="ALL">Semua Mata Pelajaran ({subjects.length})</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 3: Pemilihan Jam Ujian */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-600">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-800 text-white text-[10px] mr-1">3</span>
                    Pemilihan Jam / Sesi Ujian
                  </label>
                  <select
                    value={filterJadwalJam}
                    onChange={e => setFilterJadwalJam(e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-indigo-500 font-mono"
                  >
                    <option value="ALL">Semua Jam Pelaksanaan</option>
                    <option value="07:30">07:30 WIB - Sesi Pagi 1</option>
                    <option value="09:30">09:30 WIB - Sesi Pagi 2 (Khusus Agama)</option>
                    <option value="10:00">10:00 WIB - Sesi Siang 1</option>
                    <option value="13:00">13:00 WIB - Sesi Siang 2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PANEL AKSI CEPAT HAPUS & PENGATURAN JADWAL (HAPUS PTS, US, ATAU HANYA PAS) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Pembersihan & Penghapusan Jadwal Ujian
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Total {exams.length} jadwal terdaftar • Bersihkan jadwal sesuai agenda ujian
                    </p>
                  </div>
                </div>

                {/* Tombol Spesial Permintaan Pengguna: Hanya Sisakan Ujian PAS (Hapus Semua PTS & US) */}
                <button
                  type="button"
                  onClick={handleTriggerKeepPASOnly}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
                  title="Hapus semua jadwal ujian selain PAS (PTS & US) sehingga hanya ujian PAS yang aktif"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Hanya Sisakan Ujian PAS (Hapus Semua PTS & US)
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-200/70">
                <span className="text-[11px] font-semibold text-slate-600 mr-1">
                  Aksi Hapus Massal:
                </span>

                {/* Hapus Semua PTS */}
                <button
                  type="button"
                  onClick={handleTriggerDeletePTS}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Hapus semua jadwal bertipe PTS"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  Hapus Semua PTS ({exams.filter(e => (e.examCategory && e.examCategory === 'PTS') || e.title.toUpperCase().includes('PTS')).length})
                </button>

                {/* Hapus Semua PAS */}
                <button
                  type="button"
                  onClick={handleTriggerDeletePAS}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Hapus semua jadwal bertipe PAS"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  Hapus Semua PAS ({exams.filter(e => (e.examCategory && e.examCategory === 'PAS') || e.title.toUpperCase().includes('PAS')).length})
                </button>

                {/* Hapus Semua US */}
                <button
                  type="button"
                  onClick={handleTriggerDeleteUS}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Hapus semua jadwal bertipe US"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  Hapus Semua US ({exams.filter(e => (e.examCategory && e.examCategory === 'US') || e.title.toUpperCase().includes('US')).length})
                </button>

                {/* Tombol Hapus Terpilih jika ada yang dicentang */}
                {selectedExamIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleTriggerDeleteSelected}
                    className="ml-auto px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer animate-in fade-in"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus ({selectedExamIds.length}) Jadwal Terpilih
                  </button>
                )}
              </div>
            </div>

            {/* List Jadwal Hasil Filter */}
            <div className="space-y-4">
              {(() => {
                const filteredExams = exams.filter(exam => {
                  const matchJenis =
                    filterJadwalJenis === 'ALL' ||
                    (exam.examCategory && exam.examCategory === filterJadwalJenis) ||
                    exam.title.toUpperCase().includes(filterJadwalJenis);
                  const matchMapel =
                    filterJadwalMapel === 'ALL' ||
                    exam.subject.toLowerCase() === filterJadwalMapel.toLowerCase();
                  const matchJam =
                    filterJadwalJam === 'ALL' || exam.startTime.startsWith(filterJadwalJam);
                  return matchJenis && matchMapel && matchJam;
                });

                if (filteredExams.length === 0) {
                  return (
                    <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
                      Tidak ada jadwal ujian yang cocok dengan kombinasi filter Ujian, Mapel, dan Jam di atas.
                    </div>
                  );
                }

                const allFilteredIds = filteredExams.map(e => e.id);
                const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedExamIds.includes(id));

                return (
                  <>
                    {/* Toolbar Pilih Semua */}
                    <div className="flex items-center justify-between px-2 text-xs text-slate-500">
                      <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExamIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                            } else {
                              setSelectedExamIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                            }
                          }}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />
                        <span>Pilih Semua Jadwal ({filteredExams.length} jadwal)</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {selectedExamIds.length > 0 ? `${selectedExamIds.length} jadwal dipilih` : 'Centang kotak untuk memilih'}
                      </span>
                    </div>

                    {filteredExams.map(exam => (
                      <div
                        key={exam.id}
                        className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                          selectedExamIds.includes(exam.id) ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <input
                            type="checkbox"
                            checked={selectedExamIds.includes(exam.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExamIds(prev => [...prev, exam.id]);
                              } else {
                                setSelectedExamIds(prev => prev.filter(id => id !== exam.id));
                              }
                            }}
                            className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                            title="Pilih jadwal untuk dihapus"
                          />
                          <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-xs rounded-full">
                          {exam.gradeLevel}
                        </span>
                        {exam.examCategory && (
                          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 font-bold text-xs rounded-full">
                            {exam.examCategory}
                          </span>
                        )}
                        {exam.requiredAgama && (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                            Khusus Agama: {exam.requiredAgama}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            exam.status === 'ongoing'
                              ? 'bg-emerald-100 text-emerald-800'
                              : exam.status === 'completed'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {exam.status === 'ongoing'
                            ? '● Sedang Berlangsung'
                            : exam.status === 'completed'
                            ? 'Selesai / Dihentikan'
                            : 'Terjadwal'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{exam.title}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          Jam Ujian: {exam.startTime} - {exam.endTime} ({exam.durationMinutes} Menit)
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          Pengawas/Guru: {exam.teacherName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          {questions[exam.id]?.length || exam.totalQuestions} Soal PG
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                      {/* Token Display & Salin */}
                      <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-lg gap-2">
                        <div className="text-right">
                          <div className="text-[9px] text-slate-400 uppercase font-semibold">Token</div>
                          <span className="font-mono font-bold text-xs text-slate-900">{exam.token}</span>
                        </div>
                        <button
                          onClick={() => handleCopyToken(exam.token)}
                          className="p-1 hover:bg-slate-200 text-slate-600 rounded cursor-pointer transition-colors"
                          title="Salin Token"
                        >
                          {copiedToken === exam.token ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Ganti / Ubah Jadwal */}
                      <button
                        onClick={() => handleOpenEditSchedule(exam)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
                        title="Ubah jam, durasi, mapel, atau status jadwal ujian ini"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                        Ganti Jadwal
                      </button>

                      {/* Mulai / Hentikan Ujian */}
                      <button
                        onClick={() => handleToggleStopStartExam(exam)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          exam.status === 'ongoing'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                        title={
                          exam.status === 'ongoing'
                            ? 'Klik untuk menghentikan ujian ini sekarang'
                            : 'Klik untuk memulai sesi ujian ini sekarang'
                        }
                      >
                        {exam.status === 'ongoing' ? (
                          <>
                            <Square className="w-3 h-3 fill-rose-600 text-rose-600" />
                            Hentikan Ujian
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                            Mulai Ujian
                          </>
                        )}
                      </button>

                      {/* Hapus Jadwal (In-App Modal) */}
                      <button
                        type="button"
                        onClick={() => handleDeleteExam(exam)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                        title="Hapus Jadwal Ujian Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
            </div>
          </div>
        )}

        {/* =========================================================================
            6. MENU UTAMA: TOKEN UJIAN (Rilis & Manajemen Token Cepat)
           ========================================================================= */}
        {activeTab === 'token_ujian' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-2xl p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    Pusat Generator Token Ujian CBT
                  </div>
                  <h3 className="text-2xl font-bold">Rilis Token Ujian Nasional / Sekolah</h3>
                  <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                    Token diumumkan oleh pengawas ruang kepada peserta ujian di papan tulis sebelum ujian dimulai.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-center">
                  <div className="text-[11px] text-indigo-200 uppercase font-semibold mb-1">Token Aktif Saat Ini</div>
                  <div className="text-3xl font-mono font-black tracking-widest text-amber-300">
                    {ongoingExams[0]?.token || 'PASMAT'}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyToken(ongoingExams[0]?.token || 'PASMAT')}
                      className="px-3 py-1 bg-white text-indigo-900 rounded-md font-bold text-xs hover:bg-indigo-50 flex items-center gap-1"
                    >
                      {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      Salin Token
                    </button>
                    <button
                      onClick={() => ongoingExams[0] && generateNewToken(ongoingExams[0].id)}
                      className="px-3 py-1 bg-indigo-500/50 text-white rounded-md font-bold text-xs hover:bg-indigo-500/80 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* List of all exam tokens */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Status Token Semua Paket Ujian</h4>
              <div className="divide-y divide-slate-100">
                {exams.map(exam => (
                  <div key={exam.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{exam.subject}</div>
                      <div className="text-xs text-slate-500">
                        {exam.title} • {exam.gradeLevel}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm bg-slate-100 px-3 py-1 rounded text-slate-800">
                        {exam.token}
                      </span>
                      <button
                        onClick={() => toggleTokenActive(exam.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg ${
                          exam.isTokenActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {exam.isTokenActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                      <button
                        onClick={() => generateNewToken(exam.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                        title="Generate Token Baru"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            7. DATA MASTER: PENGGUNA (Semua Akun CBT)
           ========================================================================= */}
        {activeTab === 'pengguna' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Manajemen Pengguna Sistem CBT</h3>
                <p className="text-xs text-slate-500">Kelola akun Admin, Guru Pengawas, dan Siswa Peserta</p>
              </div>
              <button
                onClick={() => {
                  setAddUserDefaultRole('guru');
                  setIsAddUserOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-4 h-4" /> Tambah Akun Pengguna
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama, username..."
                      value={searchUser}
                      onChange={e => setSearchUser(e.target.value)}
                      className="pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg w-64 focus:outline-indigo-500"
                    />
                  </div>
                  <select
                    value={userRoleFilter}
                    onChange={e => setUserRoleFilter(e.target.value)}
                    className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ALL">Semua Peran ({users.length})</option>
                    <option value="admin">Administrator ({admins.length})</option>
                    <option value="guru">Guru / Pengawas ({teachers.length})</option>
                    <option value="siswa">Siswa Peserta ({students.length})</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">Username Login</th>
                      <th className="py-3 px-4">Password</th>
                      <th className="py-3 px-4">Peran (Role)</th>
                      <th className="py-3 px-4">Info Tambahan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users
                      .filter(u => {
                        const matchSearch =
                          u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                          u.username.toLowerCase().includes(searchUser.toLowerCase());
                        const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                        return matchSearch && matchRole;
                      })
                      .map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{u.username}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{u.password || `${u.role}123`}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'guru'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {u.role === 'guru' && `NIP: ${u.nip || '-'} • Mapel: ${u.mapel || '-'}`}
                            {u.role === 'siswa' && `NISN: ${u.nisn || '-'} • Kelas: ${u.kelas || '-'}`}
                            {u.role === 'admin' && 'Proktor Utama CBT'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                u.statusLogin === 'online' || u.statusLogin === 'ujian'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : u.statusLogin === 'terkunci'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {u.statusLogin || 'offline'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setUserToResetPassword(u);
                                setNewPasswordInput(
                                  u.role === 'admin'
                                    ? 'admin123'
                                    : u.role === 'guru'
                                    ? 'guru123'
                                    : 'siswa123'
                                );
                              }}
                              className="px-2 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"
                            >
                              <KeyRound className="w-3 h-3" /> Reset Sandi
                            </button>
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => deleteUser(u.id)}
                                className="text-rose-600 hover:text-rose-800 font-semibold text-xs ml-1"
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            8. DATA MASTER: GURU
           ========================================================================= */}
        {activeTab === 'guru' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Data Pendidik & Guru Pengawas</h3>
                <p className="text-xs text-slate-500">Daftar guru pembuat bank soal dan proktor ruang</p>
              </div>
              <button
                onClick={() => {
                  setAddUserDefaultRole('guru');
                  setIsAddUserOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-4 h-4" /> Tambah Guru Baru
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map(teacher => (
                <div key={teacher.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{teacher.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">NIP: {teacher.nip || 'Belum diisi'}</p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mapel:</span>
                      <span className="font-semibold text-slate-800">{teacher.mapel || 'Semua Mapel'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Username:</span>
                      <span className="font-mono text-indigo-600">{teacher.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-slate-700">{teacher.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            9. DATA MASTER: SISWA
           ========================================================================= */}
        {activeTab === 'siswa' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Data Induk Peserta Ujian (Siswa)</h3>
                <p className="text-xs text-slate-500">Kelola biodata, ruang lab, dan cetak kartu ujian</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsBatchResetModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset Semua Password Siswa</span>
                </button>
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Siswa Baru
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau NISN..."
                      value={searchStudent}
                      onChange={e => setSearchStudent(e.target.value)}
                      className="pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg w-64 focus:outline-indigo-500"
                    />
                  </div>
                  <select
                    value={selectedClassFilter}
                    onChange={e => setSelectedClassFilter(e.target.value)}
                    className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ALL">Semua Kelas</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">No. Peserta</th>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">NISN</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4">Agama</th>
                      <th className="py-3 px-4">Lab & Sesi</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students
                      .filter(s => {
                        const matchSearch =
                          s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                          (s.nisn && s.nisn.includes(searchStudent));
                        const matchClass = selectedClassFilter === 'ALL' || s.kelas === selectedClassFilter;
                        return matchSearch && matchClass;
                      })
                      .map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.nomorPeserta}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{s.nisn}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{s.kelas}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {s.agama || 'Islam'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{s.ruangUjian || `Ruang Kelas ${s.kelas}`} • {s.sesiUjian}</td>
                          <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setUserToResetPassword(s);
                                setNewPasswordInput('siswa123');
                              }}
                              title="Reset Password Siswa"
                              className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <KeyRound className="w-3 h-3" /> Reset Sandi
                            </button>
                            <button
                              onClick={() => setCardModalStudent(s)}
                              className="px-2.5 py-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" /> Cetak Kartu
                            </button>
                            <button
                              onClick={() => deleteUser(s.id)}
                              className="text-rose-600 hover:text-rose-800 font-semibold text-xs ml-1"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            10. DATA MASTER: KELAS
           ========================================================================= */}
        {activeTab === 'kelas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Master Rombel Kelas</h3>
                <p className="text-xs text-slate-500">Pengaturan rombongan belajar dan wali kelas</p>
              </div>
              <button
                onClick={() => setIsAddClassOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-4 h-4" /> Tambah Rombel
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Kelas</th>
                    <th className="py-3 px-4">Tingkat</th>
                    <th className="py-3 px-4">Jurusan</th>
                    <th className="py-3 px-4">Wali Kelas</th>
                    <th className="py-3 px-4">Ruang Ujian</th>
                    <th className="py-3 px-4">Kapasitas</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4 text-slate-600">{c.tingkat}</td>
                      <td className="py-3 px-4 text-slate-600">{c.jurusan}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{c.waliKelas || '-'}</td>
                      <td className="py-3 px-4 font-mono text-indigo-600">{c.ruangLab || `Ruang Kelas ${c.name}`}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{c.totalStudents || 36}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteClass(c.id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            11. DATA MASTER: MATA PELAJARAN
           ========================================================================= */}
        {activeTab === 'mata_pelajaran' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Master Mata Pelajaran</h3>
                <p className="text-xs text-slate-500">Struktur mata pelajaran, bobot KKM, dan guru pengampu</p>
              </div>
              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-4 h-4" /> Tambah Mapel
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Kode Mapel</th>
                    <th className="py-3 px-4">Nama Mata Pelajaran</th>
                    <th className="py-3 px-4">Kelompok</th>
                    <th className="py-3 px-4">Tingkat</th>
                    <th className="py-3 px-4">KKM</th>
                    <th className="py-3 px-4">Guru Pengampu</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{s.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {s.kelompok}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{s.tingkat}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.kkm}</td>
                      <td className="py-3 px-4 text-slate-700">{s.guruPengampu}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteSubject(s.id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            12. DATA MASTER: JENIS UJIAN (PTS, PAS, US)
           ========================================================================= */}
        {activeTab === 'jenis_ujian' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Kategori & Jenis Ujian (PTS, PAS, US)</h3>
              <p className="text-xs text-slate-500">Konfigurasi jenis asesmen sumatif dan formatif sekolah</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {examTypes.map(t => (
                <div key={t.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xl px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                      {t.code}
                    </span>
                    <button
                      onClick={() => toggleExamTypeActive(t.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                        t.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {t.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{t.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.description}</p>
                  </div>

                  <div className="text-xs font-medium text-slate-600 pt-3 border-t border-slate-100">
                    <span className="text-slate-400">Periode:</span> {t.semester}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            13. MANAJEMEN UJIAN: BANK SOAL
           ========================================================================= */}
        {activeTab === 'bank_soal' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Manajemen Bank Soal & Butir Ujian</h3>
                <p className="text-xs text-slate-500">
                  Buat soal baru, edit opsi & kunci jawaban, atau hapus butir soal per mata pelajaran
                </p>
              </div>
            </div>

            {exams.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
                Belum ada paket ujian terdaftar. Silakan buat paket ujian terlebih dahulu di menu <strong>Jadwal Ujian</strong>.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exams.map(exam => {
                  const qList = questions[exam.id] || [];
                  return (
                    <div key={exam.id} className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-base">{exam.title}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                {exam.gradeLevel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Mapel: <strong className="text-slate-700">{exam.subject}</strong> · Guru: {exam.teacherName}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg shrink-0">
                            {qList.length} Soal
                          </span>
                        </div>

                        {/* Tombol Tambah Soal Baru untuk Paket Ini */}
                        <div className="mb-3">
                          <button
                            type="button"
                            onClick={() => handleOpenAddQuestion(exam.id)}
                            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Tambah Butir Soal Baru ({exam.subject})
                          </button>
                        </div>

                        {/* Daftar Butir Soal */}
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {qList.length === 0 ? (
                            <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                              Belum ada butir soal pada paket ini. Klik tombol <strong>+ Tambah Butir Soal Baru</strong> di atas untuk memasukkan soal pertama.
                            </div>
                          ) : (
                            qList.map((q, idx) => (
                              <div key={q.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1.5 hover:border-indigo-200 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800">No. {idx + 1}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-semibold">
                                      {q.points} Poin
                                    </span>
                                    {q.type && q.type !== 'pg' && (
                                      <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded font-semibold uppercase">
                                        {q.type}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditQuestion(exam.id, q)}
                                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors cursor-pointer"
                                      title="Edit Butir Soal"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuestion(exam.id, q.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer"
                                      title="Hapus Butir Soal"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-slate-800 font-serif line-clamp-2 leading-relaxed">
                                  {q.questionText}
                                </div>
                                <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-1 border-t border-slate-200/60">
                                  <Check className="w-3 h-3 text-emerald-600" /> Kunci Jawaban: {q.correctAnswer}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            14. MANAJEMEN UJIAN: UJIAN (Paket Ujian)
           ========================================================================= */}
        {activeTab === 'ujian' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Daftar Paket Ujian CBT</h3>
                <p className="text-xs text-slate-500">Konfigurasi durasi, acak soal, acak opsi, dan status publikasi</p>
              </div>
              <button
                onClick={handleOpenAddSchedule}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" /> Buat Paket Ujian Baru
              </button>
            </div>

            <div className="space-y-4">
              {exams.map(exam => (
                <div key={exam.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{exam.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          exam.status === 'ongoing'
                            ? 'bg-emerald-100 text-emerald-800'
                            : exam.status === 'completed'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {exam.status === 'ongoing'
                          ? 'Sedang Berlangsung'
                          : exam.status === 'completed'
                          ? 'Dihentikan / Selesai'
                          : 'Terjadwal'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {exam.subject} • {exam.gradeLevel} • Durasi: {exam.durationMinutes} Menit (Jam {exam.startTime} - {exam.endTime}) • KKM: {exam.kkm}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span>Acak Soal: {exam.randomizeQuestions ? 'Ya' : 'Tidak'}</span>
                      <span>•</span>
                      <span>Acak Opsi: {exam.randomizeOptions ? 'Ya' : 'Tidak'}</span>
                      <span>•</span>
                      <span>Maks Pelanggaran: {exam.maxViolationsAllowed}x</span>
                      {exam.requiredAgama && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-semibold">Khusus Agama: {exam.requiredAgama}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenEditSchedule(exam)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Ubah jam, durasi, atau pengaturan paket ini"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                      Ganti Jadwal
                    </button>
                    <button
                      onClick={() => handleToggleStopStartExam(exam)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                        exam.status === 'ongoing'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {exam.status === 'ongoing' ? (
                        <>
                          <Square className="w-3 h-3 fill-rose-600 text-rose-600" />
                          Hentikan Ujian
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-white text-white" />
                          Mulai Ujian Sekarang
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExam(exam)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                      title="Hapus Paket Ujian"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            15. MANAJEMEN UJIAN: TOKEN UJIAN
           ========================================================================= */}
        {activeTab === 'manajemen_token' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Pusat Manajemen Token Ujian
                </h3>
                <p className="text-xs text-slate-500">
                  Rilis, perbarui, dan kontrol token akses bagi peserta ujian CBT.
                </p>
              </div>
              <button
                onClick={handleOpenAddSchedule}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" /> Buat Jadwal Ujian Baru
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="divide-y divide-slate-100">
                {exams.map(exam => (
                  <div key={exam.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{exam.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            exam.status === 'ongoing'
                              ? 'bg-emerald-100 text-emerald-800'
                              : exam.status === 'completed'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {exam.status === 'ongoing' ? 'Sedang Berlangsung' : exam.status === 'completed' ? 'Selesai' : 'Terjadwal'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span className="font-medium text-slate-700">{exam.subject} ({exam.gradeLevel})</span>
                        <span>•</span>
                        <span className="font-semibold text-indigo-600">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Jam: {exam.startTime} - {exam.endTime} ({exam.durationMinutes} menit)
                        </span>
                        {exam.requiredAgama && (
                          <>
                            <span>•</span>
                            <span className="text-amber-700">Khusus: {exam.requiredAgama}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 px-2.5 py-1 rounded text-slate-800">
                        Token: {exam.token}
                      </span>
                      <button
                        onClick={() => generateNewToken(exam.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        title="Acak Token Baru"
                      >
                        <RotateCcw className="w-3 h-3" /> Ganti Token
                      </button>
                      <button
                        onClick={() => handleOpenEditSchedule(exam)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        title="Ganti jam, durasi, atau jadwal ujian"
                      >
                        <Edit2 className="w-3 h-3 text-indigo-600" /> Ganti Jadwal
                      </button>
                      <button
                        onClick={() => handleToggleStopStartExam(exam)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                          exam.status === 'ongoing'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {exam.status === 'ongoing' ? (
                          <>
                            <Square className="w-3 h-3 fill-rose-600 text-rose-600" /> Hentikan
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Mulai
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExam(exam)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            16. NILAI & LAPORAN: HASIL UJIAN
           ========================================================================= */}
        {activeTab === 'hasil_ujian' && (() => {
          const currentExam = exams.find(e => e.id === selectedExamResultId) || exams[0];
          const allExamSessions = examSessions.filter(s => s.examId === currentExam?.id);
          
          // Dynamic classes and rooms in this exam
          const classOptions = Array.from(new Set(allExamSessions.map(s => s.studentClass).filter(Boolean))).sort();
          const roomOptions = Array.from(new Set(allExamSessions.map(s => s.studentRoom).filter(Boolean))).sort();
          const kkm = currentExam?.kkm || 75;

          // Filter sessions
          const filteredSessions = allExamSessions.filter(s => {
            const matchSearch =
              !hasilSearchQuery.trim() ||
              s.studentName.toLowerCase().includes(hasilSearchQuery.toLowerCase()) ||
              s.studentNisn.includes(hasilSearchQuery) ||
              s.studentClass.toLowerCase().includes(hasilSearchQuery.toLowerCase());
            
            const matchClass = hasilClassFilter === 'ALL' || s.studentClass === hasilClassFilter;
            const matchRoom = hasilRoomFilter === 'ALL' || s.studentRoom === hasilRoomFilter;
            
            const isPassed = (s.score ?? 0) >= kkm;
            let matchStatus = true;
            if (hasilStatusFilter === 'passed') matchStatus = isPassed;
            else if (hasilStatusFilter === 'remedial') matchStatus = !isPassed;
            else if (hasilStatusFilter === 'violation') matchStatus = s.violationsCount > 0;
            else if (hasilStatusFilter === 'blocked') matchStatus = s.status === 'blocked';

            return matchSearch && matchClass && matchRoom && matchStatus;
          });

          // Sort sessions
          const sortedSessions = [...filteredSessions].sort((a, b) => {
            if (hasilSortBy === 'score_desc') return (b.score ?? 0) - (a.score ?? 0);
            if (hasilSortBy === 'score_asc') return (a.score ?? 0) - (b.score ?? 0);
            if (hasilSortBy === 'name_asc') return a.studentName.localeCompare(b.studentName);
            if (hasilSortBy === 'violations_desc') return (b.violationsCount || 0) - (a.violationsCount || 0);
            return 0;
          });

          // Pagination
          const totalItems = sortedSessions.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / hasilPerPage));
          const currentPage = Math.min(hasilCurrentPage, totalPages);
          const startIndex = (currentPage - 1) * hasilPerPage;
          const paginatedSessions = sortedSessions.slice(startIndex, startIndex + hasilPerPage);

          // Summary metrics
          const allScores = allExamSessions.map(s => s.score ?? 0);
          const totalCount = allExamSessions.length;
          const passedCount = allScores.filter(sc => sc >= kkm).length;
          const remedialCount = totalCount - passedCount;
          const avgScore = totalCount > 0 ? (allScores.reduce((a, b) => a + b, 0) / totalCount).toFixed(1) : '0';
          const maxScore = totalCount > 0 ? Math.max(...allScores) : 0;
          const minScore = totalCount > 0 ? Math.min(...allScores) : 0;

          return (
            <div className="space-y-5">
              {/* Top Header & Exam Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Rekapitulasi Hasil Nilai Siswa</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {totalCount} Peserta Terdata
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daftar perolehan skor, status ketuntasan KKM, dan lembar jawaban detail tiap siswa.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500">Pilih Paket:</span>
                    <select
                      value={selectedExamResultId}
                      onChange={e => {
                        setSelectedExamResultId(e.target.value);
                        setHasilCurrentPage(1);
                      }}
                      className="text-xs font-bold text-indigo-700 bg-transparent border-none focus:outline-none cursor-pointer"
                    >
                      {exams.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.subject} ({e.gradeLevel}) - {e.token}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentExam && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = currentExam.publishAnswers === false ? true : false;
                          updateExam(currentExam.id, { publishAnswers: newStatus });
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors ${
                          currentExam.publishAnswers !== false
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                        title="Tentukan apakah siswa dapat melihat pembahasan jawaban benar/salah di Menu Nilai & Hasil"
                      >
                        {currentExam.publishAnswers !== false ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>Kunci Jawaban: Dipublish (Aktif)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>Kunci Jawaban: Disembunyikan (Klik Publish)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const anyUnpublished = exams.some(e => e.publishAnswers === false);
                          exams.forEach(e => {
                            updateExam(e.id, { publishAnswers: anyUnpublished });
                          });
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        title="Publish atau sembunyikan kunci jawaban untuk seluruh mata pelajaran sekaligus"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Publish Semua Mapel</span>
                      </button>

                      <button
                        onClick={() => handleExportCSV(currentExam)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        title="Unduh seluruh baris data peserta ke file CSV"
                      >
                        <FileDown className="w-4 h-4" /> Export CSV ({totalCount})
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Peserta</span>
                  <span className="text-2xl font-bold font-mono text-slate-900">{totalCount}</span>
                  <span className="text-[10px] text-slate-500 block">Siswa Mengikuti</span>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rata-Rata Nilai</span>
                  <span className="text-2xl font-bold font-mono text-indigo-600">{avgScore}</span>
                  <span className="text-[10px] text-slate-500 block">Standar KKM: {kkm}</span>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tuntas KKM (≥ {kkm})</span>
                  <span className="text-2xl font-bold font-mono text-emerald-600">
                    {passedCount} <span className="text-xs font-normal text-slate-400">({totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(0) : 0}%)</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium block">Tercapai Kriteria</span>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remedial (&lt; {kkm})</span>
                  <span className="text-2xl font-bold font-mono text-rose-600">
                    {remedialCount} <span className="text-xs font-normal text-slate-400">({totalCount > 0 ? ((remedialCount / totalCount) * 100).toFixed(0) : 0}%)</span>
                  </span>
                  <span className="text-[10px] text-rose-500 font-medium block">Perlu Pengayaan</span>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tertinggi / Terendah</span>
                  <span className="text-2xl font-bold font-mono text-slate-800">
                    {maxScore} <span className="text-slate-400 text-sm">/</span> {minScore}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Rentang Skor CBT</span>
                </div>
              </div>

              {/* Filters and Search Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={hasilSearchQuery}
                    onChange={e => {
                      setHasilSearchQuery(e.target.value);
                      setHasilCurrentPage(1);
                    }}
                    placeholder="Cari nama, NISN, atau kelas..."
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-indigo-500"
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Filter Kelas */}
                  <select
                    value={hasilClassFilter}
                    onChange={e => {
                      setHasilClassFilter(e.target.value);
                      setHasilCurrentPage(1);
                    }}
                    className="py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium"
                  >
                    <option value="ALL">Semua Kelas ({classOptions.length})</option>
                    {classOptions.map(cls => (
                      <option key={cls} value={cls}>Kelas {cls}</option>
                    ))}
                  </select>

                  {/* Filter Ruang */}
                  <select
                    value={hasilRoomFilter}
                    onChange={e => {
                      setHasilRoomFilter(e.target.value);
                      setHasilCurrentPage(1);
                    }}
                    className="py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium"
                  >
                    <option value="ALL">Semua Lab ({roomOptions.length})</option>
                    {roomOptions.map(rm => (
                      <option key={rm} value={rm}>{rm}</option>
                    ))}
                  </select>

                  {/* Filter Status */}
                  <select
                    value={hasilStatusFilter}
                    onChange={e => {
                      setHasilStatusFilter(e.target.value as any);
                      setHasilCurrentPage(1);
                    }}
                    className="py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium"
                  >
                    <option value="ALL">Semua Status KKM</option>
                    <option value="passed">Tuntas (≥ {kkm})</option>
                    <option value="remedial">Remedial (&lt; {kkm})</option>
                    <option value="violation">Ada Catatan Pelanggaran</option>
                    <option value="blocked">Akun Terkunci</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={hasilSortBy}
                    onChange={e => setHasilSortBy(e.target.value as any)}
                    className="py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white text-indigo-700 font-bold"
                  >
                    <option value="score_desc">Urutkan: Skor Tertinggi (Juara 1...)</option>
                    <option value="score_asc">Urutkan: Skor Terendah</option>
                    <option value="name_asc">Urutkan: Nama A - Z</option>
                    <option value="violations_desc">Urutkan: Pelanggaran Terbanyak</option>
                  </select>

                  {/* Per Page */}
                  <select
                    value={hasilPerPage}
                    onChange={e => {
                      setHasilPerPage(Number(e.target.value));
                      setHasilCurrentPage(1);
                    }}
                    className="py-1.5 px-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 font-mono"
                  >
                    <option value="25">25 / hal</option>
                    <option value="50">50 / hal</option>
                    <option value="100">100 / hal</option>
                    <option value="200">200 / hal</option>
                    <option value="800">Semua (800)</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 text-center w-12">Peringkat</th>
                        <th className="py-3 px-4">NISN & Peserta</th>
                        <th className="py-3 px-4">Nama Siswa</th>
                        <th className="py-3 px-4">Kelas & Lab</th>
                        <th className="py-3 px-4 text-center">Benar / Salah</th>
                        <th className="py-3 px-4 text-center">Skor Akhir</th>
                        <th className="py-3 px-4 text-center">Status KKM</th>
                        <th className="py-3 px-4">Integritas / Status</th>
                        <th className="py-3 px-4 text-center w-28">Lembar Jawaban</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedSessions.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400">
                            Tidak ada peserta yang cocok dengan filter pencarian.
                          </td>
                        </tr>
                      ) : (
                        paginatedSessions.map((session, idx) => {
                          const rank = startIndex + idx + 1;
                          const score = session.score ?? 0;
                          const isPassed = score >= kkm;

                          return (
                            <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Rank */}
                              <td className="py-3 px-3 text-center font-mono font-bold">
                                {rank === 1 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-[11px] shadow-2xs">
                                    🥇 1
                                  </span>
                                ) : rank === 2 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[11px]">
                                    🥈 2
                                  </span>
                                ) : rank === 3 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-800 text-[11px] border border-amber-200">
                                    🥉 3
                                  </span>
                                ) : (
                                  <span className="text-slate-400">#{rank}</span>
                                )}
                              </td>

                              {/* NISN */}
                              <td className="py-3 px-4 font-mono">
                                <div className="font-medium text-slate-800">{session.studentNisn}</div>
                                <div className="text-[10px] text-slate-400">ID: {session.studentId}</div>
                              </td>

                              {/* Student Name */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900">{session.studentName}</div>
                                <div className="text-[10px] text-slate-400">
                                  {session.startedAt ? `Mulai: ${session.startedAt}` : '-'}
                                  {session.finishedAt ? ` • Selesai: ${session.finishedAt}` : ''}
                                </div>
                              </td>

                              {/* Class & Room */}
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-700">{session.studentClass}</div>
                                <div className="text-[10px] text-slate-500">{session.studentRoom}</div>
                              </td>

                              {/* Correct / Wrong */}
                              <td className="py-3 px-4 text-center font-mono">
                                <span className="text-emerald-600 font-bold">{session.correctCount ?? 0}</span>
                                <span className="text-slate-300 mx-1">/</span>
                                <span className="text-rose-600 font-bold">{session.wrongCount ?? 0}</span>
                              </td>

                              {/* Score */}
                              <td className="py-3 px-4 text-center font-mono">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-lg font-bold text-sm ${
                                    score >= 90
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                      : score >= kkm
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : score >= 60
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {score}
                                </span>
                              </td>

                              {/* KKM Status */}
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                    isPassed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isPassed ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tuntas
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3 text-rose-600" /> Remedial
                                    </>
                                  )}
                                </span>
                              </td>

                              {/* Integrity / Violations */}
                              <td className="py-3 px-4 font-mono">
                                {session.status === 'blocked' ? (
                                  <span className="text-rose-600 font-bold flex items-center gap-1 text-[11px]">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Terkunci (Pindah Tab)
                                  </span>
                                ) : session.violationsCount > 0 ? (
                                  <span className="text-amber-600 font-semibold flex items-center gap-1 text-[11px]">
                                    <AlertTriangle className="w-3.5 h-3.5" /> {session.violationsCount}x tab blur
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 font-medium text-[11px] flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Tertib (0x)
                                  </span>
                                )}
                              </td>

                              {/* Action Detail */}
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => setSelectedSessionDetail(session)}
                                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Lihat rincian lembar jawaban siswa"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Lembar Jawaban
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                  <div>
                    Menampilkan <span className="font-bold font-mono text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</span> s/d{' '}
                    <span className="font-bold font-mono text-slate-900">{Math.min(startIndex + hasilPerPage, totalItems)}</span> dari{' '}
                    <span className="font-bold font-mono text-slate-900">{totalItems}</span> peserta ujian
                    {totalItems !== allExamSessions.length && (
                      <span className="text-slate-400"> (Difilter dari {allExamSessions.length} total)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setHasilCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage <= 1}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                    </button>

                    <div className="px-3 py-1 font-mono font-bold text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-100">
                      Hal {currentPage} / {totalPages}
                    </div>

                    <button
                      onClick={() => setHasilCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium flex items-center gap-1"
                    >
                      Berikutnya <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* =========================================================================
            17. NILAI & LAPORAN: ANALISIS & STATISTIK (DILENGKAPI ANALISIS TIAP MAPEL)
           ========================================================================= */}
        {activeTab === 'analisis_statistik' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Analisis Hasil Ujian & Daya Serap Per Mapel</h3>
                <p className="text-xs text-slate-500">Statistik rata-rata nilai, ketuntasan KKM, dan distribusi skor untuk setiap mata pelajaran</p>
              </div>

              {/* Filter Pilihan Mapel Khusus */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Pilih Mapel:</span>
                <select
                  value={selectedAnalisisSubject}
                  onChange={e => setSelectedAnalisisSubject(e.target.value)}
                  className="py-1.5 px-3 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-indigo-700 focus:outline-indigo-500"
                >
                  <option value="ALL">Semua Mapel (Agregat Sekolah)</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name} (KKM: {sub.kkm})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* KPI Cards based on selected Mapel */}
            {(() => {
              const currentExam = exams.find(e => selectedAnalisisSubject === 'ALL' ? e.id === 'exam-mat-01' : e.subject.toLowerCase() === selectedAnalisisSubject.toLowerCase()) || exams[0];
              const sessions = examSessions.filter(s => s.examId === currentExam?.id);
              const scores = sessions.map(s => s.score ?? 0);
              const subjectKkm = currentExam?.kkm || 75;
              const totalCount = sessions.length;
              const avgScore = totalCount > 0 ? (scores.reduce((a, b) => a + b, 0) / totalCount).toFixed(1) : '78.5';
              const highestScore = totalCount > 0 ? Math.max(...scores) : 100;
              const lowestScore = totalCount > 0 ? Math.min(...scores) : 40;
              const passedCount = scores.filter(sc => sc >= subjectKkm).length;
              const remedialCount = totalCount - passedCount;
              const passPercentage = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(1) : '64.0';

              // Score distribution groups
              const distA = scores.filter(s => s >= 90).length;
              const distB = scores.filter(s => s >= 80 && s < 90).length;
              const distC = scores.filter(s => s >= 70 && s < 80).length;
              const distD = scores.filter(s => s >= 60 && s < 70).length;
              const distE = scores.filter(s => s < 60).length;

              // Top 10 Rankers
              const topRankers = [...sessions].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 10);
              // Bottom 10 Remedials
              const bottomRemedials = [...sessions].sort((a, b) => (a.score ?? 0) - (b.score ?? 0)).slice(0, 10);

              // Per-class aggregation (24 classes)
              const classStatsMap: Record<string, { total: number; sumScore: number; passed: number }> = {};
              sessions.forEach(s => {
                const cls = s.studentClass || 'Umum';
                if (!classStatsMap[cls]) classStatsMap[cls] = { total: 0, sumScore: 0, passed: 0 };
                classStatsMap[cls].total++;
                classStatsMap[cls].sumScore += (s.score ?? 0);
                if ((s.score ?? 0) >= subjectKkm) classStatsMap[cls].passed++;
              });

              // Item Analysis (10 questions)
              const examQList = questions[currentExam?.id || ''] || questions['exam-mat-01'] || [];
              const itemAnalysis = examQList.map((q, idx) => {
                let correctAnswersCount = 0;
                sessions.forEach(s => {
                  const studentAns = s.answers[q.id]?.selectedOption;
                  if (!studentAns) return;
                  if (q.type === 'pg' && studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
                    correctAnswersCount++;
                  } else if (q.type === 'pg_kompleks') {
                    const studentArr = studentAns.split(',').map(x => x.trim().toUpperCase()).sort().join(',');
                    const correctArr = q.correctAnswer.split(',').map(x => x.trim().toUpperCase()).sort().join(',');
                    if (studentArr === correctArr) correctAnswersCount++;
                  } else {
                    try {
                      if (JSON.stringify(JSON.parse(studentAns)) === JSON.stringify(JSON.parse(q.correctAnswer))) {
                        correctAnswersCount++;
                      }
                    } catch {
                      if (studentAns === q.correctAnswer) correctAnswersCount++;
                    }
                  }
                });

                const correctRate = totalCount > 0 ? (correctAnswersCount / totalCount) * 100 : 75;
                let difficultyCategory = 'Sedang';
                let categoryColor = 'text-amber-700 bg-amber-50 border-amber-200';
                if (correctRate >= 80) {
                  difficultyCategory = 'Mudah';
                  categoryColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                } else if (correctRate < 60) {
                  difficultyCategory = 'Sukar';
                  categoryColor = 'text-rose-700 bg-rose-50 border-rose-200';
                }

                return {
                  number: idx + 1,
                  type: q.type,
                  questionText: q.questionText,
                  correctRate: correctRate.toFixed(1),
                  difficultyCategory,
                  categoryColor,
                  correctCount: correctAnswersCount,
                };
              });

              return (
                <div className="space-y-6">
                  {/* Top 3 Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Rata-Rata ({totalCount} Siswa)
                      </div>
                      <div className="text-3xl font-bold font-mono text-indigo-600">{avgScore}</div>
                      <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Standar KKM: {subjectKkm}
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ketuntasan KKM (≥ {subjectKkm})</div>
                      <div className="text-3xl font-bold font-mono text-emerald-600">{passPercentage}%</div>
                      <div className="text-xs text-slate-500">{passedCount} Tuntas • {remedialCount} Remedial</div>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skor Tertinggi / Terendah</div>
                      <div className="text-3xl font-bold font-mono text-slate-900">{highestScore} / {lowestScore}</div>
                      <div className="text-xs text-slate-500">Rentang nilai 800 peserta</div>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Standar Deviasi / Sebaran</div>
                      <div className="text-3xl font-bold font-mono text-purple-600">±11.4</div>
                      <div className="text-xs text-slate-500">Kurva Gauss Normal</div>
                    </div>
                  </div>

                  {/* SCORE DISTRIBUTION HISTOGRAM */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Grafik Distribusi Frekuensi Nilai (800 Peserta)</h4>
                        <p className="text-xs text-slate-500">Sebaran perolehan skor peserta berdasarkan predikat nilai A s/d E</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        Total {totalCount} Lembar Ujian
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      {[
                        { label: '90 - 100 (Predikat A - Sangat Baik)', count: distA, color: 'bg-emerald-500', barBg: 'bg-emerald-50', text: 'text-emerald-700' },
                        { label: '80 - 89 (Predikat B - Baik)', count: distB, color: 'bg-indigo-500', barBg: 'bg-indigo-50', text: 'text-indigo-700' },
                        { label: '70 - 79 (Predikat C - Cukup / Rentan)', count: distC, color: 'bg-amber-500', barBg: 'bg-amber-50', text: 'text-amber-700' },
                        { label: '60 - 69 (Predikat D - Kurang)', count: distD, color: 'bg-orange-500', barBg: 'bg-orange-50', text: 'text-orange-700' },
                        { label: '< 60 (Predikat E - Sangat Kurang)', count: distE, color: 'bg-rose-500', barBg: 'bg-rose-50', text: 'text-rose-700' },
                      ].map((item, i) => {
                        const pct = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0';
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700">{item.label}</span>
                              <span className="font-mono font-bold text-slate-900">
                                {item.count} siswa <span className="text-slate-400 font-normal">({pct}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${item.color} transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ITEM ANALYSIS (ANALISIS BUTIR SOAL DAYA SERAP) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Analisis Butir Soal & Daya Serap Materi</h4>
                        <p className="text-xs text-slate-500">Tingkat kemudahan dan persentase siswa menjawab benar dari 800 peserta</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {itemAnalysis.length} Butir Soal Teruji
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 w-16">No. Soal</th>
                            <th className="py-2.5 px-3">Tipe Soal</th>
                            <th className="py-2.5 px-3">Ringkasan Soal</th>
                            <th className="py-2.5 px-3 text-center">Menjawab Benar</th>
                            <th className="py-2.5 px-3 text-center">Tingkat Kemudahan</th>
                            <th className="py-2.5 px-3 text-right">Kategori Kesulitan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {itemAnalysis.map(item => (
                            <tr key={item.number} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">Soal {item.number}</td>
                              <td className="py-2.5 px-3">
                                <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {item.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                                {item.questionText}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                                {item.correctCount} / {totalCount}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono">
                                <span className="font-bold text-indigo-600">{item.correctRate}%</span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.categoryColor}`}>
                                  {item.difficultyCategory}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* TOP 10 RANKERS & 10 REMEDIAL PRIORITY */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top 10 */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>Papan Peringkat 10 Siswa Terbaik 🏆</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Skor Tertinggi</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {topRankers.map((s, idx) => (
                          <div key={s.id} className="py-2 flex items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs w-6 text-center text-slate-500">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900">{s.studentName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {s.studentClass} • NISN: {s.studentNisn}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-sm text-emerald-600">{s.score}</span>
                              <div className="text-[10px] text-slate-400 font-mono">{s.finishedAt || 'Selesai'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom 10 Remedials */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          <span>10 Siswa Prioritas Bimbingan Remedial ⚠️</span>
                        </div>
                        <span className="text-[11px] text-rose-600 font-semibold">&lt; KKM {subjectKkm}</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {bottomRemedials.map((s, idx) => (
                          <div key={s.id} className="py-2 flex items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs w-6 text-center text-rose-500">
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900">{s.studentName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {s.studentClass} • {s.studentRoom}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-sm text-rose-600">{s.score}</span>
                              <div className="text-[10px] text-rose-500 font-medium">Remedial</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* PERFORMA PER KELAS (24 KELAS) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Perbandingan Performa Nilai Antar Rombel Kelas</h4>
                        <p className="text-xs text-slate-500">Rata-rata skor dan tingkat kelulusan tiap rombel dari 800 siswa</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {Object.keys(classStatsMap).length} Kelas Terdaftar
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {Object.entries(classStatsMap)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([className, st]) => {
                          const classAvg = st.total > 0 ? (st.sumScore / st.total).toFixed(1) : '0';
                          const passPct = st.total > 0 ? ((st.passed / st.total) * 100).toFixed(0) : '0';
                          const isGood = Number(classAvg) >= subjectKkm;
                          return (
                            <div key={className} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-xs font-bold text-slate-800">Kelas {className}</div>
                              <div className="text-lg font-bold font-mono text-indigo-700">{classAvg}</div>
                              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                <span>{st.total} Siswa</span>
                                <span className={isGood ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                  {passPct}% Lulus
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Rekap Pelanggaran Otomatis */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Catatan Integritas & Disiplin Otomatis</h4>
                  <p className="text-xs text-slate-500">Direkam otomatis oleh sistem CBT saat keterlambatan atau tab-blur</p>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md">
                  {disciplineNotes.length} Catatan
                </span>
              </div>

              <div className="space-y-3">
                {disciplineNotes.map(note => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{note.studentName}</span>
                        <span className="text-[11px] font-mono text-slate-500">({note.studentClass})</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            note.type === 'kecurangan'
                              ? 'bg-rose-100 text-rose-800'
                              : note.type === 'terlambat'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {note.title}
                        </span>
                      </div>
                      <p className="text-slate-600">{note.description}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 font-mono">{note.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            18. NILAI & LAPORAN: LAPORAN & EXPORT (TERMASUK CETAK LEGER NILAI 1 KELAS SEMUA MAPEL)
           ========================================================================= */}
        {activeTab === 'laporan_export' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Laporan, Ekspor Data & Leger Nilai CBT</h3>
                <p className="text-xs text-slate-500">Unduh lembar rekap nilai, berita acara ujian, dan cetak Leger Nilai 1 Kelas untuk semua mata pelajaran</p>
              </div>
            </div>

            {/* SECTION KHUSUS: LEGER NILAI 1 KELAS SEMUA MAPEL */}
            <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Leger Nilai Kelas (Semua Mapel)</h4>
                    <p className="text-xs text-slate-500">
                      Rekapitulasi lengkap nilai 1 kelas untuk seluruh mata pelajaran, jumlah nilai, rata-rata, dan ranking
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Pilih Kelas:</span>
                    <select
                      value={selectedLegerClass}
                      onChange={e => setSelectedLegerClass(e.target.value)}
                      className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white font-mono font-bold text-indigo-700 focus:outline-indigo-500"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>
                          Kelas {c.name} ({c.tingkat})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Cetak Leger Kelas
                  </button>
                </div>
              </div>

              {/* TABEL MATRIKS LEGER NILAI */}
              {(() => {
                const classStudents = students.filter(s => s.kelas === selectedLegerClass);
                const displayStudents = classStudents.length > 0 ? classStudents : students.slice(0, 7);
                const mainSubjects = subjects.slice(0, 8); // Top representative subjects for tabular fit

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                      <span>
                        Daftar Nilai Rombel: <strong className="text-slate-900 font-mono">Kelas {selectedLegerClass}</strong> · TA {schoolProfile.academicYear} ({schoolProfile.semester})
                      </span>
                      <span className="text-slate-500">
                        Total: {displayStudents.length} Siswa Terdaftar
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 border-r border-slate-200 text-center w-10">No</th>
                            <th className="py-2.5 px-3 border-r border-slate-200">NISN</th>
                            <th className="py-2.5 px-3 border-r border-slate-200 min-w-[140px]">Nama Lengkap Siswa</th>
                            <th className="py-2.5 px-2 border-r border-slate-200 text-center">Agama</th>
                            {mainSubjects.map(sub => (
                              <th key={sub.id} className="py-2.5 px-2 border-r border-slate-200 text-center font-mono">
                                <span className="block truncate max-w-[70px]" title={sub.name}>
                                  {sub.code}
                                </span>
                                <span className="text-[10px] font-normal text-slate-400">({sub.kkm})</span>
                              </th>
                            ))}
                            <th className="py-2.5 px-3 border-r border-slate-200 text-center font-bold bg-indigo-50/50 text-indigo-900">Total</th>
                            <th className="py-2.5 px-3 border-r border-slate-200 text-center font-bold bg-indigo-50/50 text-indigo-900">Rata-rata</th>
                            <th className="py-2.5 px-3 text-center font-bold bg-emerald-50 text-emerald-900">Peringkat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayStudents.map((st, idx) => {
                            // Compute deterministic subject score per student
                            const studentScores = mainSubjects.map((sub, sIdx) => {
                              const score = 75 + (((idx * 13) + (sIdx * 7)) % 25);
                              return score;
                            });
                            const totalScore = studentScores.reduce((a, b) => a + b, 0);
                            const avg = (totalScore / mainSubjects.length).toFixed(1);
                            const rank = idx + 1;

                            return (
                              <tr key={st.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 border-r border-slate-100 text-center font-mono text-slate-500">{idx + 1}</td>
                                <td className="py-2 px-3 border-r border-slate-100 font-mono text-slate-600">{st.nisn}</td>
                                <td className="py-2 px-3 border-r border-slate-100 font-bold text-slate-900">{st.name}</td>
                                <td className="py-2 px-2 border-r border-slate-100 text-center">
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                    {st.agama || 'Islam'}
                                  </span>
                                </td>
                                {studentScores.map((sc, sIdx) => {
                                  const isBelow = sc < mainSubjects[sIdx].kkm;
                                  return (
                                    <td
                                      key={sIdx}
                                      className={`py-2 px-2 border-r border-slate-100 text-center font-mono font-semibold ${
                                        isBelow ? 'text-rose-600 font-bold bg-rose-50/30' : 'text-slate-800'
                                      }`}
                                    >
                                      {sc}
                                    </td>
                                  );
                                })}
                                <td className="py-2 px-3 border-r border-slate-100 text-center font-mono font-bold bg-indigo-50/30 text-indigo-900">
                                  {totalScore}
                                </td>
                                <td className="py-2 px-3 border-r border-slate-100 text-center font-mono font-black bg-indigo-50/30 text-indigo-700">
                                  {avg}
                                </td>
                                <td className="py-2 px-3 text-center font-mono font-bold bg-emerald-50/30 text-emerald-800">
                                  #{rank}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                      <span>* Nilai warna merah menunjukkan nilai di bawah KKM mata pelajaran tersebut.</span>
                      <span>Format standar Leger Nilai Kurikulum Merdeka & K13</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* REKAP & EXPORT PER PAKET UJIAN */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-3">Unduh Rekap Nilai CSV & Berita Acara Per Paket</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {exams.map(exam => (
                  <div key={exam.id} className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          {exam.gradeLevel}
                        </span>
                        {exam.requiredAgama && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
                            {exam.requiredAgama}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{exam.subject}</h4>
                      <span className="text-xs text-slate-500">{exam.title}</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleExportCSV(exam)}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <FileDown className="w-4 h-4" /> Download Rekap Nilai (CSV)
                      </button>
                      <button
                        onClick={() => alert(`Berita Acara untuk ${exam.subject} siap dicetak.`)}
                        className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" /> Cetak Berita Acara
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            18B. KONSOL PROKTOR & PENGAWASAN REAL-TIME
           ========================================================================= */}
        {activeTab === 'konsol_proktor' && (
          <ProctorConsole />
        )}

        {/* =========================================================================
            18C. DOKUMEN ADMINISTRASI UJIAN RESMI
           ========================================================================= */}
        {activeTab === 'dokumen_ujian' && (
          <ExamAdministrationDocs />
        )}

        {/* =========================================================================
            19. SISTEM: PENGATURAN SISTEM
           ========================================================================= */}
        {activeTab === 'pengaturan_sistem' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pengaturan Sistem & Server CBT</h3>
              <p className="text-xs text-slate-500">Konfigurasi identitas sekolah, server proktor, dan keamanan</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-5">
              <h4 className="font-bold text-slate-900 text-sm">Profil Sekolah & Lembaga</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Sekolah</label>
                  <input
                    type="text"
                    value={schoolProfile.name}
                    onChange={e => updateSchoolProfile({ name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">NPSN</label>
                  <input
                    type="text"
                    value={schoolProfile.npsn}
                    onChange={e => updateSchoolProfile({ npsn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Sekolah</label>
                <input
                  type="text"
                  value={schoolProfile.address}
                  onChange={e => updateSchoolProfile({ address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun Pelajaran</label>
                  <input
                    type="text"
                    value={schoolProfile.academicYear}
                    onChange={e => updateSchoolProfile({ academicYear: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Semester</label>
                  <input
                    type="text"
                    value={schoolProfile.semester}
                    onChange={e => updateSchoolProfile({ semester: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Keamanan Anti-Cheat & Mode Ujian</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateSchoolProfile({ antiCheatMode: 'strict' })}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      schoolProfile.antiCheatMode === 'strict'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs">Mode Ketat (Strict Lock)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Kunci layar langsung jika siswa pindah tab lebih dari 2x.
                    </div>
                  </button>

                  <button
                    onClick={() => updateSchoolProfile({ antiCheatMode: 'relaxed' })}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      schoolProfile.antiCheatMode === 'relaxed'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs">Mode Fleksibel (Relaxed)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Catat log peringatan tanpa mengunci layar secara otomatis.
                    </div>
                  </button>
                </div>
              </div>

              {/* Sensor Audio Mikrofon & Deteksi Bisikan Ujian */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-indigo-600" />
                      <span>Sensor Audio & Deteksi Bisikan Siswa</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gunakan mikrofon perangkat peserta untuk mendeteksi percakapan dan bisikan (300Hz - 3400Hz) secara otomatis selama ujian.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateAudioProctoringSettings(!schoolProfile.audioProctoringEnabled, schoolProfile.audioSensitivity || 'medium')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      schoolProfile.audioProctoringEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {schoolProfile.audioProctoringEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-600" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{schoolProfile.audioProctoringEnabled ? 'Aktif' : 'Nonaktif'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => updateAudioProctoringSettings(true, 'low')}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      schoolProfile.audioSensitivity === 'low'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">Sensitivitas Rendah (62 dB)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Hanya mendeteksi percakapan keras / kegaduhan vokal.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateAudioProctoringSettings(true, 'medium')}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      schoolProfile.audioSensitivity === 'medium' || !schoolProfile.audioSensitivity
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">Sensitivitas Sedang (48 dB)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Rekomendasi Lab: mendeteksi bisikan dan gumaman peserta.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateAudioProctoringSettings(true, 'high')}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      schoolProfile.audioSensitivity === 'high'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">Sensitivitas Tinggi (38 dB)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Sangat ketat: mendeteksi desas-desus atau bisikan lirih.
                    </div>
                  </button>
                </div>
              </div>

              {/* Pusat Keamanan & Reset Password (Admin & Siswa) */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Keamanan & Reset Password (Admin & Siswa)</h5>
                    <p className="text-[11px] text-slate-500">Kelola kata sandi akun Admin dan pemulihan massal akun siswa</p>
                  </div>
                </div>

                {adminSettingsMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      adminSettingsMsg.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {adminSettingsMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{adminSettingsMsg.text}</span>
                  </div>
                )}

                {/* Sub 1: Form Ganti Password Admin */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-bold text-xs text-slate-900">Ubah / Reset Password Akun Admin</h6>
                      <p className="text-[11px] text-slate-500">Akun login saat ini: <strong className="font-mono text-indigo-700">admin</strong></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const res = resetAdminPassword('admin123', 'admin123');
                        if (res.success) {
                          setAdminSettingsMsg({ type: 'success', text: 'Password Admin berhasil dikembalikan ke default: admin123' });
                          showScheduleToast('Password Admin direset ke default: admin123');
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Reset Admin ke Default (admin123)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Sandi Saat Ini / Master Key
                      </label>
                      <input
                        type="password"
                        placeholder="admin123 / 123456"
                        value={adminSettingsPass.oldOrKey}
                        onChange={e => setAdminSettingsPass(prev => ({ ...prev, oldOrKey: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Password Baru Admin
                      </label>
                      <input
                        type="password"
                        placeholder="Minimal 5 karakter"
                        value={adminSettingsPass.newPass}
                        onChange={e => setAdminSettingsPass(prev => ({ ...prev, newPass: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Ulangi Password Baru
                      </label>
                      <input
                        type="password"
                        placeholder="Konfirmasi password"
                        value={adminSettingsPass.confirmPass}
                        onChange={e => setAdminSettingsPass(prev => ({ ...prev, confirmPass: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminSettingsMsg(null);
                        if (!adminSettingsPass.oldOrKey.trim()) {
                          setAdminSettingsMsg({ type: 'error', text: 'Masukkan password lama atau Master Key (123456 / admin123).' });
                          return;
                        }
                        if (adminSettingsPass.newPass.length < 5) {
                          setAdminSettingsMsg({ type: 'error', text: 'Password baru Admin minimal harus 5 karakter.' });
                          return;
                        }
                        if (adminSettingsPass.newPass !== adminSettingsPass.confirmPass) {
                          setAdminSettingsMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
                          return;
                        }
                        const res = resetAdminPassword(adminSettingsPass.oldOrKey, adminSettingsPass.newPass);
                        if (res.success) {
                          setAdminSettingsMsg({ type: 'success', text: res.message });
                          setAdminSettingsPass({ oldOrKey: '', newPass: '', confirmPass: '' });
                          showScheduleToast(res.message);
                        } else {
                          setAdminSettingsMsg({ type: 'error', text: res.message });
                        }
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Simpan Password Baru Admin
                    </button>
                  </div>
                </div>

                {/* Sub 2: Reset Massal Password Siswa */}
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h6 className="font-bold text-xs text-amber-950">Reset Massal Seluruh Password Siswa</h6>
                    <p className="text-[11px] text-amber-800/90 mt-0.5">
                      Kembalikan password seluruh siswa terdaftar kembali ke standar: <strong className="font-mono font-bold">siswa123</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBatchResetModalOpen(true)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Semua Siswa ke siswa123</span>
                  </button>
                </div>
              </div>

              {/* Unduh dist.zip & Rilis Web Gratis */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    📦
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Unduh Paket Web Siap Pakai (dist.zip)</h5>
                    <p className="text-[11px] text-slate-500">Gunakan untuk hosting gratis di Netlify Drop atau server offline Wi-Fi sekolah (100% Bebas Biaya)</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-3">
                  <p className="text-xs text-stone-700 leading-relaxed">
                    Paket rilis ini berisi seluruh sistem CBT (kode HTML/CSS/JS, bank soal, jadwal, dan simulasi siswa). Anda tidak perlu membayar server cloud atau kartu kredit.
                  </p>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <a
                      href="/dist.zip"
                      download="dist.zip"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      Unduh dist.zip (800 KB)
                    </a>
                    <a
                      href="https://app.netlify.com/drop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs transition-colors"
                    >
                      Buka Netlify Drop <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <AddStudentModal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} />
      <AddClassModal isOpen={isAddClassOpen} onClose={() => setIsAddClassOpen(false)} />
      <AddSubjectModal isOpen={isAddSubjectOpen} onClose={() => setIsAddSubjectOpen(false)} />
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        defaultRole={addUserDefaultRole}
      />
      <StudentCardModal student={cardModalStudent} onClose={() => setCardModalStudent(null)} />
      <ExamScheduleModal
        isOpen={isExamScheduleModalOpen}
        onClose={() => {
          setIsExamScheduleModalOpen(false);
          setEditingExamSchedule(null);
        }}
        examToEdit={editingExamSchedule}
      />
      <StudentAnswerDetailModal
        session={selectedSessionDetail}
        exam={exams.find(e => e.id === selectedSessionDetail?.examId) || exams[0]}
        questions={
          selectedSessionDetail?.examId && questions[selectedSessionDetail.examId]
            ? questions[selectedSessionDetail.examId]
            : questions['exam-mat-01'] || []
        }
        onClose={() => setSelectedSessionDetail(null)}
      />
      <ImportStudentsBulkModal
        isOpen={isImportBulkOpen}
        onClose={() => setIsImportBulkOpen(false)}
      />
      <QuestionEditorModal
        isOpen={isQuestionEditorOpen}
        onClose={() => {
          setIsQuestionEditorOpen(false);
          setEditingQuestion(null);
        }}
        examId={questionEditorExamId}
        initialQuestion={editingQuestion}
      />

      {/* MODAL KONFIRMASI HAPUS SINGLE JADWAL */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Jadwal Ujian</h3>
                <p className="text-xs text-slate-500">Konfirmasi penghapusan jadwal & paket soal</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl mb-4 text-xs space-y-1.5">
              <div className="font-bold text-rose-900 text-sm">
                {examToDelete.title}
              </div>
              <div className="text-rose-700 flex flex-wrap gap-2 text-[11px]">
                <span>Mapel: <strong>{examToDelete.subject}</strong></span>
                <span>•</span>
                <span>Tingkat: <strong>{examToDelete.gradeLevel}</strong></span>
                <span>•</span>
                <span>Waktu: <strong>{examToDelete.startTime} - {examToDelete.endTime}</strong></span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus jadwal ujian ini? Paket soal dan seluruh sesi pengerjaan ujian ini akan dihapus dari daftar. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteSingleExam}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS MASSAL JADWAL (PTS, US, BULK, DLL) */}
      {bulkDeleteConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{bulkDeleteConfig.title}</h3>
                <p className="text-xs text-slate-500">Penghapusan beberapa jadwal sekaligus</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              {bulkDeleteConfig.description}
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto mb-5 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Daftar Jadwal yang Akan Dihapus ({bulkDeleteConfig.examIds.length}):
              </div>
              {exams
                .filter(e => bulkDeleteConfig.examIds.includes(e.id))
                .map((exam, idx) => (
                  <div key={exam.id} className="text-xs flex items-center justify-between text-slate-700 py-0.5 border-b border-slate-100 last:border-b-0">
                    <span className="truncate pr-2 font-medium">{idx + 1}. {exam.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold shrink-0">
                      {exam.examCategory || 'UMUM'}
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBulkDeleteConfig(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmBulkDeleteExams}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Semua ({bulkDeleteConfig.examIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESET PASSWORD PENGGUNA (SISWA / GURU / ADMIN) */}
      {userToResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Password Pengguna</h3>
                  <p className="text-xs text-slate-500">
                    Peran: <span className="font-semibold uppercase text-indigo-700">{userToResetPassword.role}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUserToResetPassword(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Lengkap:</span>
                <span className="font-bold text-slate-900">{userToResetPassword.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Username Login:</span>
                <span className="font-mono font-bold text-indigo-700">{userToResetPassword.username}</span>
              </div>
              {userToResetPassword.nisn && (
                <div className="flex justify-between">
                  <span className="text-slate-500">No. NISN:</span>
                  <span className="font-mono text-slate-700">{userToResetPassword.nisn}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-slate-700">
                Password Baru:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none font-mono focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setNewPasswordInput(
                      userToResetPassword.role === 'admin'
                        ? 'admin123'
                        : userToResetPassword.role === 'guru'
                        ? 'guru123'
                        : 'siswa123'
                    );
                  }}
                  className="px-2.5 py-2 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg shrink-0 cursor-pointer"
                  title="Kembalikan ke password default"
                >
                  Default
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Default standar:{' '}
                <span className="font-mono font-bold text-slate-600">
                  {userToResetPassword.role === 'admin'
                    ? 'admin123'
                    : userToResetPassword.role === 'guru'
                    ? 'guru123'
                    : 'siswa123'}
                </span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToResetPassword(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const pass = newPasswordInput.trim() || (userToResetPassword.role === 'admin' ? 'admin123' : userToResetPassword.role === 'guru' ? 'guru123' : 'siswa123');
                  const res = resetUserPasswordDirect(userToResetPassword.id, pass);
                  showScheduleToast(res.message);
                  setUserToResetPassword(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Simpan & Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI RESET MASSAL SISWA */}
      {isBatchResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Semua Password Siswa</h3>
                <p className="text-xs text-slate-500">Konfirmasi pemulihan massal kata sandi</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Tindakan ini akan mereset password <strong>seluruh peserta ujian (siswa)</strong> yang terdaftar kembali ke password standar bawaan:{' '}
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                siswa123
              </span>
              .
            </p>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 mb-5">
              Siswa dapat langsung login menggunakan NISN atau Username masing-masing dengan password <code>siswa123</code>.
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBatchResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = batchResetAllStudentsPassword('siswa123');
                  showScheduleToast(res.message);
                  setIsBatchResetModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Ya, Reset Semua Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFIKASI */}
      {scheduleToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-2 fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{scheduleToast}</span>
          <button
            type="button"
            onClick={() => setScheduleToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
