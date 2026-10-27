export type Role = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  avatar?: string;
  email: string;
  nip?: string;
  nisn?: string;
  kelas?: string;
  jurusan?: string;
  mapel?: string;
  ruangUjian?: string;
  nomorPeserta?: string;
  sesiUjian?: string;
  agama?: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  statusLogin?: 'offline' | 'online' | 'ujian' | 'terkunci';
  password?: string;
}

export type QuestionType = 'pg' | 'pg_kompleks' | 'benar_salah' | 'menjodohkan' | 'essay';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
}

export interface StatementItem {
  id: string;
  statement: string;
  correctAnswer: boolean; // true = Benar, false = Salah
}

export interface MatchingPair {
  id: string;
  premise: string; // Kolom Kiri
  correctMatch: string; // Pasangan Kolom Kanan
}

export interface Question {
  id: string;
  examId: string;
  number: number;
  type: QuestionType;
  questionText: string;
  options: QuestionOption[];
  correctAnswer: string; // 'B' or 'A,C' for pg_kompleks, or JSON
  statements?: StatementItem[]; // for 'benar_salah'
  matchingPairs?: MatchingPair[]; // for 'menjodohkan'
  explanation?: string;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string; // e.g., 'Kelas XII - MIPA'
  durationMinutes: number;
  totalQuestions: number;
  token: string;
  isTokenActive: boolean;
  tokenExpiredAt?: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed';
  createdByTeacherId: string;
  teacherName: string;
  kkm: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showScoreImmediate: boolean;
  maxViolationsAllowed: number;
  examCategory?: 'PTS' | 'PAS' | 'US';
  requiredAgama?: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  publishAnswers?: boolean;
}

export interface StudentAnswer {
  questionId: string;
  selectedOption: string; // 'A', 'B', 'C', 'D', 'E' or text for essay
  isDoubtful: boolean;
  savedAt: string;
}

export type AttendanceStatus = 'cbt' | 'tertulis' | 'absen' | 'izin' | 'sakit';

export interface ExamSession {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  studentClass: string;
  studentRoom: string;
  startedAt?: string;
  finishedAt?: string;
  remainingSeconds: number;
  status: 'not_started' | 'in_progress' | 'submitted' | 'blocked';
  attendanceStatus?: AttendanceStatus;
  attendanceNotes?: string;
  answers: Record<string, StudentAnswer>; // questionId -> answer
  score?: number;
  correctCount?: number;
  wrongCount?: number;
  violationsCount: number;
  audioViolationsCount?: number;
  lastAudioIncidentAt?: string;
  currentAudioLevel?: number; // 0 - 100
  lastActive: string;
  isOfflineSynced?: boolean;
  offlineSubmittedAt?: string;
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  address: string;
  academicYear: string;
  semester: string;
  examTitle: string;
  serverStatus: 'online' | 'maintenance' | 'syncing';
  antiCheatMode: 'strict' | 'relaxed';
  audioProctoringEnabled?: boolean;
  audioSensitivity?: 'low' | 'medium' | 'high';
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Penting' | 'Jadwal' | 'Informasi' | 'Tata Tertib';
  date: string;
  author: string;
  content: string;
  isPinned?: boolean;
}

export interface StudentDisciplineNote {
  id: string;
  studentId: string;
  studentName?: string;
  studentNisn?: string;
  studentClass?: string;
  subject: string;
  type: 'terlambat' | 'kecurangan' | 'belum_ujian' | 'tertib';
  title: string;
  description: string;
  timestamp: string;
  severity: 'warning' | 'danger' | 'info' | 'success';
  source: 'system_auto';
  minutesLate?: number;
}

export interface StudentSubjectGrade {
  subject: string;
  code: string;
  examTitle: string;
  score: number;
  kkm: number;
  status: 'Tuntas' | 'Remedial' | 'Belum Ujian';
  completedDate?: string;
  violationsCount: number;
}

export interface ExamTypeCategory {
  id: string;
  code: 'PTS' | 'PAS' | 'US';
  name: string;
  description: string;
  semester: string;
  isActive: boolean;
}

export interface ClassItem {
  id: string;
  name: string;
  tingkat: string;
  jurusan: string;
  waliKelas?: string;
  ruangLab?: string;
  totalStudents?: number;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  kkm: number;
  guruPengampu: string;
  tingkat: string;
  kelompok: 'Umum' | 'Peminatan' | 'Pilihan';
}

export interface ProctorBroadcastMessage {
  id: string;
  timestamp: string;
  sender: string;
  content: string;
  targetRoom?: string; // e.g. 'ALL' or 'Lab Komputer 01'
  priority: 'normal' | 'urgent';
}



