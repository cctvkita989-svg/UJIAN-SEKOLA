import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  User,
  Exam,
  Question,
  ExamSession,
  SchoolProfile,
  Announcement,
  StudentDisciplineNote,
  StudentSubjectGrade,
  ClassItem,
  SubjectItem,
  ExamTypeCategory,
  ProctorBroadcastMessage,
  AttendanceStatus,
  AppTheme,
} from '../types/cbt';
import {
  INITIAL_USERS,
  INITIAL_EXAMS,
  INITIAL_QUESTIONS,
  INITIAL_EXAM_SESSIONS,
  INITIAL_SCHOOL_PROFILE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DISCIPLINE_NOTES,
  INITIAL_STUDENT_GRADES,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_EXAM_TYPES,
} from '../data/mockData';
import { generate800StudentsData } from '../utils/simulation800';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { offlineStorage } from '../lib/offlineStorage';

interface CBTContextType {
  isAuthenticated: boolean;
  currentUser: User;
  currentRole: Role;
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role) => void;
  login: (username: string, password: string) => { success: boolean; message: string; role?: Role };
  logout: () => void;
  users: User[];
  exams: Exam[];
  questions: Record<string, Question[]>;
  examSessions: ExamSession[];
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  
  // User & Session Management
  addUser: (userData: Partial<User>) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  resetStudentSession: (studentId: string) => void;
  unlockStudent: (studentId: string) => void;
  updateStudentAttendance: (studentId: string, attendanceStatus: AttendanceStatus, manualScore?: number, notes?: string) => void;
  extendStudentTime: (studentId: string, additionalMinutes: number) => void;
  forceSubmitStudentSession: (studentId: string) => void;
  broadcastMessages: ProctorBroadcastMessage[];
  sendProctorBroadcast: (content: string, targetRoom?: string, priority?: 'normal' | 'urgent') => void;
  clearBroadcasts: () => void;
  
  // Exam Management
  addExam: (examData: Omit<Exam, 'id'>) => Exam;
  updateExam: (examId: string, data: Partial<Exam>) => void;
  deleteExam: (examId: string) => void;
  deleteExamsBulk: (examIds: string[]) => void;
  generateNewToken: (examId: string) => string;
  toggleTokenActive: (examId: string) => void;
  
  // Question Management
  addQuestion: (examId: string, question: Omit<Question, 'id' | 'number'>) => void;
  updateQuestion: (examId: string, questionId: string, data: Partial<Question>) => void;
  deleteQuestion: (examId: string, questionId: string) => void;
  
  // Student CBT Live Taking
  activeExamTaking: {
    exam: Exam;
    session: ExamSession;
    currentQuestionIndex: number;
    fontScale: 'normal' | 'large' | 'xlarge';
  } | null;
  startExamForStudent: (examId: string, tokenEntered: string) => { success: boolean; message: string };
  saveStudentAnswer: (questionId: string, selectedOption: string, isDoubtful?: boolean) => void;
  toggleAnswerDoubt: (questionId: string) => void;
  setExamQuestionIndex: (index: number) => void;
  setFontScale: (scale: 'normal' | 'large' | 'xlarge') => void;
  announcements: Announcement[];
  disciplineNotes: StudentDisciplineNote[];
  studentGrades: Record<string, StudentSubjectGrade[]>;
  changePassword: (userId: string, oldPass: string, newPass: string) => { success: boolean; message: string };
  resetUserPasswordDirect: (userId: string, newPassword?: string) => { success: boolean; message: string; newPassword?: string };
  resetStudentPasswordByNisn: (nisnOrUser: string, newPassword?: string) => {
    success: boolean;
    message: string;
    studentName?: string;
    studentUsername?: string;
    studentNisn?: string;
    newPassword?: string;
  };
  resetAdminPassword: (recoveryKey: string, newPassword?: string) => { success: boolean; message: string; newPassword?: string };
  batchResetAllStudentsPassword: (defaultPassword?: string) => { success: boolean; count: number; message: string };
  recordExamViolation: () => void;
  recordAudioViolation: (decibelLevel: number, incidentType?: 'bisikan' | 'suara_keras') => void;
  reportCurrentAudioLevel: (decibelLevel: number) => void;
  updateAudioProctoringSettings: (enabled: boolean, sensitivity?: 'low' | 'medium' | 'high') => void;
  submitCurrentExam: () => void;
  exitExamView: () => void;
  viewStudentExamResult: (examId: string) => void;
  isOnline: boolean;
  pendingOfflineSyncCount: number;
  syncPendingOfflineData: () => Promise<{ success: boolean; message: string; count: number }>;

  // Master Data: Classes
  classes: ClassItem[];
  addClass: (data: Omit<ClassItem, 'id'>) => void;
  updateClass: (id: string, data: Partial<ClassItem>) => void;
  deleteClass: (id: string) => void;

  // Master Data: Subjects
  subjects: SubjectItem[];
  addSubject: (data: Omit<SubjectItem, 'id'>) => void;
  updateSubject: (id: string, data: Partial<SubjectItem>) => void;
  deleteSubject: (id: string) => void;

  // Master Data: Exam Types
  examTypes: ExamTypeCategory[];
  toggleExamTypeActive: (id: string) => void;
  updateExamType: (id: string, data: Partial<ExamTypeCategory>) => void;
  addExamType: (data: Omit<ExamTypeCategory, 'id'>) => void;

  // 800 Students Simulation
  isSimulated800: boolean;
  run800StudentsSimulation: () => void;
  resetSimulationToStandard: () => void;

  // Global reset to default mock data (SMP VII-IX, Agama, Leger)
  resetAllData: () => void;
}

export const CBT_STORAGE_VERSION = 'v17_official_students_unique_passwords';

// Generate pre-loaded official students dataset with unique individual passwords
const DEFAULT_800_DATA = generate800StudentsData('exam-mat-01');
const INITIAL_USERS_WITH_800: User[] = [
  ...INITIAL_USERS.filter(u => u.role !== 'siswa'),
  ...DEFAULT_800_DATA.users,
];
const INITIAL_SESSIONS_WITH_800: ExamSession[] = [
  ...INITIAL_EXAM_SESSIONS,
  ...DEFAULT_800_DATA.sessions,
];

// Auto-purge stale storage if from previous version
if (typeof window !== 'undefined') {
  try {
    const currentVersion = localStorage.getItem('educbt_version');
    if (currentVersion !== CBT_STORAGE_VERSION) {
      localStorage.removeItem('educbt_classes');
      localStorage.removeItem('educbt_subjects');
      localStorage.removeItem('educbt_users');
      localStorage.removeItem('educbt_exams');
      localStorage.removeItem('educbt_questions');
      localStorage.removeItem('educbt_sessions');
      localStorage.removeItem('educbt_discipline');
      localStorage.removeItem('educbt_grades');
      localStorage.removeItem('educbt_exam_types');
      localStorage.removeItem('educbt_curr_user');
      localStorage.removeItem('educbt_sim_800');
      localStorage.removeItem('educbt_school');
      localStorage.removeItem('educbt_submitted_ids');
      localStorage.removeItem('educbt_known_session_ids');
      // Ensure user starts at Login Page so students/teachers/admin see login menu
      localStorage.removeItem('educbt_auth');
      localStorage.setItem('educbt_version', CBT_STORAGE_VERSION);
    }
  } catch (e) {
    console.error('Storage migration error:', e);
  }
}

const CBTContext = createContext<CBTContextType | undefined>(undefined);

export const CBTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial official student data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('educbt_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Ensure at least 800 official students are loaded
        if (parsed.length >= 800) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS_WITH_800;
  });

  // App Theme: 'soft-blue' | 'sky-pastel' | 'cool-slate' | 'pure-white' | 'light' | 'dark' | 'sepia' | 'midnight'
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('educbt_theme') as AppTheme;
      if (saved && ['light', 'soft-blue', 'sky-pastel', 'cool-slate', 'pure-white', 'dark', 'sepia', 'midnight'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'soft-blue';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('educbt_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
      if (newTheme === 'dark' || newTheme === 'midnight') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  };

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      if (theme === 'dark' || theme === 'midnight') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [theme]);

  // Default to false so menu login opens on first load / Netlify
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('educbt_auth');
    return savedAuth === 'true';
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem('educbt_curr_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.role) return u;
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_USERS[0]; // Default fallback when logging in as admin
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('educbt_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [questions, setQuestions] = useState<Record<string, Question[]>>(() => {
    const saved = localStorage.getItem('educbt_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [examSessions, setExamSessions] = useState<ExamSession[]>(() => {
    let baseList: ExamSession[] = [];
    try {
      const saved = localStorage.getItem('educbt_sessions');
      baseList = saved ? JSON.parse(saved) : INITIAL_SESSIONS_WITH_800;
    } catch {
      baseList = INITIAL_SESSIONS_WITH_800;
    }

    try {
      const sessionMap = new Map<string, ExamSession>();
      baseList.forEach(s => sessionMap.set(s.id, s));

      // Merge all locally submitted sessions to guarantee submission status is never lost
      const submittedIds: string[] = JSON.parse(localStorage.getItem('educbt_submitted_ids') || '[]');
      submittedIds.forEach(id => {
        const raw = localStorage.getItem(`educbt_submitted_${id}`) || localStorage.getItem(`educbt_session_${id}`);
        if (raw) {
          try {
            const parsed: ExamSession = JSON.parse(raw);
            if (parsed && (parsed.status === 'submitted' || parsed.finishedAt)) {
              sessionMap.set(parsed.id, parsed);
            }
          } catch {}
        }
      });

      // Also check any recorded known session ids
      const knownIds: string[] = JSON.parse(localStorage.getItem('educbt_known_session_ids') || '[]');
      knownIds.forEach(id => {
        if (!sessionMap.has(id)) {
          const raw = localStorage.getItem(`educbt_session_${id}`);
          if (raw) {
            try {
              const parsed: ExamSession = JSON.parse(raw);
              sessionMap.set(parsed.id, parsed);
            } catch {}
          }
        }
      });

      return Array.from(sessionMap.values());
    } catch {
      return baseList;
    }
  });

  const [isSimulated800, setIsSimulated800] = useState<boolean>(() => {
    const saved = localStorage.getItem('educbt_sim_800');
    return saved !== null ? saved === 'true' : true;
  });

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('educbt_school');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name && (parsed.name.includes('Teladan') || parsed.name.includes('SMA'))) {
          return INITIAL_SCHOOL_PROFILE;
        }
        return {
          ...INITIAL_SCHOOL_PROFILE,
          ...parsed,
          audioProctoringEnabled: parsed.audioProctoringEnabled ?? true,
          audioSensitivity: parsed.audioSensitivity || 'medium',
        };
      } catch {
        return INITIAL_SCHOOL_PROFILE;
      }
    }
    return INITIAL_SCHOOL_PROFILE;
  });

  const [announcements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('educbt_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [disciplineNotes, setDisciplineNotes] = useState<StudentDisciplineNote[]>(() => {
    const saved = localStorage.getItem('educbt_discipline');
    return saved ? JSON.parse(saved) : INITIAL_DISCIPLINE_NOTES;
  });

  const [studentGrades, setStudentGrades] = useState<Record<string, StudentSubjectGrade[]>>(() => {
    const saved = localStorage.getItem('educbt_grades');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_GRADES;
  });

  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem('educbt_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    const saved = localStorage.getItem('educbt_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [examTypes, setExamTypes] = useState<ExamTypeCategory[]>(() => {
    const saved = localStorage.getItem('educbt_exam_types');
    return saved ? JSON.parse(saved) : INITIAL_EXAM_TYPES;
  });

  const [broadcastMessages, setBroadcastMessages] = useState<ProctorBroadcastMessage[]>(() => {
    const saved = localStorage.getItem('educbt_broadcasts');
    return saved ? JSON.parse(saved) : [
      {
        id: 'bc-1',
        timestamp: '08:00',
        sender: 'Proktor Utama (Lab 01)',
        content: 'Perhatian seluruh peserta ujian: pastikan browser dalam layar penuh dan jangan membuka aplikasi lain.',
        targetRoom: 'ALL',
        priority: 'urgent',
      }
    ];
  });

  const [activeExamTaking, setActiveExamTaking] = useState<{
    exam: Exam;
    session: ExamSession;
    currentQuestionIndex: number;
    fontScale: 'normal' | 'large' | 'xlarge';
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('educbt_broadcasts', JSON.stringify(broadcastMessages));
  }, [broadcastMessages]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('educbt_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('educbt_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('educbt_exam_types', JSON.stringify(examTypes));
  }, [examTypes]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('educbt_discipline', JSON.stringify(disciplineNotes));
  }, [disciplineNotes]);

  useEffect(() => {
    try {
      localStorage.setItem('educbt_users', JSON.stringify(users));
    } catch (e) {
      console.warn('Storage quota for users:', e);
    }
  }, [users]);

  useEffect(() => {
    localStorage.setItem('educbt_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('educbt_questions', JSON.stringify(questions));
  }, [questions]);

  // Load any previously persisted sessions from IndexedDB on startup
  useEffect(() => {
    offlineStorage.getAllPersistedSessions().then(persisted => {
      if (persisted && persisted.length > 0) {
        setExamSessions(prev => {
          const map = new Map<string, ExamSession>();
          prev.forEach(s => map.set(s.id, s));
          persisted.forEach(p => {
            const existing = map.get(p.id);
            // Protect locally submitted session from any degradation
            if (!existing || p.status === 'submitted' || (existing.status !== 'submitted' && p.status === 'in_progress')) {
              map.set(p.id, p);
            }
          });
          return Array.from(map.values());
        });
      }
    }).catch(err => {
      console.warn('[OfflineStorage] Initial IndexedDB load note:', err);
    });
  }, []);

  useEffect(() => {
    // 1. Try to save full list
    try {
      localStorage.setItem('educbt_sessions', JSON.stringify(examSessions));
    } catch (e) {
      // 2. If 800 simulation records exceed quota, ensure real student sessions are saved individually!
      console.warn('Storage quota for total sessions exceeded; saving student sessions individually');
    }

    // Always guarantee real student sessions are saved individually (never blocked by quota)
    examSessions.forEach(s => {
      if (s.studentId.startsWith('usr-siswa') || s.status === 'submitted' || s.id.startsWith('ses-usr-siswa') || s.id === 'ses-1') {
        try {
          localStorage.setItem(`educbt_session_${s.id}`, JSON.stringify(s));
          offlineStorage.cacheSession(s);
          if (s.status === 'submitted') {
            localStorage.setItem(`educbt_submitted_${s.id}`, JSON.stringify(s));
          }
        } catch {}
      }
    });
  }, [examSessions]);

  useEffect(() => {
    localStorage.setItem('educbt_school', JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  useEffect(() => {
    localStorage.setItem('educbt_curr_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('educbt_grades', JSON.stringify(studentGrades));
  }, [studentGrades]);

  // Offline Sync Queue & Network Connectivity State
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const getOfflineQueue = (): { id: string; type: 'answer' | 'submit'; sessionId: string; sessionData: ExamSession; timestamp: number }[] => {
    try {
      const q = localStorage.getItem('educbt_offline_sync_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  };

  const setOfflineQueue = (items: { id: string; type: 'answer' | 'submit'; sessionId: string; sessionData: ExamSession; timestamp: number }[]) => {
    try {
      localStorage.setItem('educbt_offline_sync_queue', JSON.stringify(items));
      setPendingOfflineSyncCount(items.length);
    } catch (e) {
      console.warn('Queue storage note:', e);
    }
  };

  const [pendingOfflineSyncCount, setPendingOfflineSyncCount] = useState<number>(() => {
    try {
      const q = localStorage.getItem('educbt_offline_sync_queue');
      return q ? JSON.parse(q).length : 0;
    } catch {
      return 0;
    }
  });

  const enqueueOfflineSync = (item: { id: string; type: 'answer' | 'submit'; sessionId: string; sessionData: ExamSession; timestamp: number }) => {
    const queue = getOfflineQueue();
    // Keep newest for same session or queue submit
    const filtered = queue.filter(q => q.sessionId !== item.sessionId || item.type === 'submit');
    const newQueue = [...filtered, item];
    setOfflineQueue(newQueue);
  };

  // Firestore Sync Helpers for Multi-Device Real-Time Exam
  const syncSessionToFirestore = async (session: ExamSession) => {
    try {
      await setDoc(doc(db, 'examSessions', session.id), session, { merge: true });
    } catch (e) {
      console.warn('[Firestore] Sync session note (device might be offline):', e);
    }
  };

  const syncPendingOfflineData = async (): Promise<{ success: boolean; message: string; count: number }> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        message: 'Perangkat masih offline. Pastikan koneksi internet aktif untuk menyinkronkan data.',
        count: getOfflineQueue().length,
      };
    }

    const queue = getOfflineQueue();
    let syncedCount = 0;

    try {
      // 1. Process items from offline queue
      if (queue.length > 0) {
        for (const item of queue) {
          const currentInState = examSessions.find(s => s.id === item.sessionId);
          const sessionToUpload: ExamSession = {
            ...(currentInState || item.sessionData),
            isOfflineSynced: true,
          };
          await syncSessionToFirestore(sessionToUpload);
          syncedCount++;
        }
        setOfflineQueue([]);
      }

      // 2. Also ensure any submitted sessions in state marked as isOfflineSynced === false are pushed
      const unsyncedSessions = examSessions.filter(
        s => s.status === 'submitted' && (s.isOfflineSynced === false || s.lastActive?.includes('Offline'))
      );

      for (const s of unsyncedSessions) {
        const syncedSession: ExamSession = {
          ...s,
          isOfflineSynced: true,
          lastActive: 'Selesai (Tersinkron Online)',
        };
        await syncSessionToFirestore(syncedSession);
        syncedCount++;
      }

      if (unsyncedSessions.length > 0) {
        setExamSessions(prev =>
          prev.map(s => {
            if (unsyncedSessions.some(u => u.id === s.id)) {
              return { ...s, isOfflineSynced: true, lastActive: 'Selesai (Tersinkron Online)' };
            }
            return s;
          })
        );
      }

      return {
        success: true,
        message: `Sinkronisasi berhasil! ${syncedCount > 0 ? `${syncedCount} sesi ujian telah terkirim ke server pengawas.` : 'Semua jawaban sudah mutakhir di server.'}`,
        count: syncedCount,
      };
    } catch (e) {
      console.warn('Sync pending data error:', e);
      return {
        success: false,
        message: 'Gagal menyinkronkan ke server. Silakan periksa koneksi internet Anda.',
        count: queue.length,
      };
    }
  };

  // Real-time network listeners: detect online / offline and auto-sync immediately
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync as soon as connection returns
      setTimeout(() => {
        syncPendingOfflineData();
      }, 300);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Active heartbeat probe to detect silent stream drops or dead WiFi links
    const probe = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
        return;
      }
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 2500);
        await fetch('/metadata.json?_t=' + Date.now(), { method: 'HEAD', signal: controller.signal });
        clearTimeout(tid);
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };
    const heartbeatTimer = setInterval(probe, 6000);

    // Initial sync check on mount if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const q = getOfflineQueue();
      if (q.length > 0) {
        setTimeout(() => syncPendingOfflineData(), 500);
      }
    }

    return () => {
      clearInterval(heartbeatTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncExamToFirestore = async (exam: Exam) => {
    try {
      await setDoc(doc(db, 'exams', exam.id), exam, { merge: true });
    } catch (e) {
      console.warn('[Firestore] Sync exam note:', e);
    }
  };

  const syncBroadcastToFirestore = async (bc: ProctorBroadcastMessage) => {
    try {
      await setDoc(doc(db, 'broadcasts', bc.id), bc, { merge: true });
    } catch (e) {
      console.warn('[Firestore] Sync broadcast note:', e);
    }
  };

  // Real-time Firestore Listeners: Sync exams, student sessions, and proctor broadcasts across devices
  useEffect(() => {
    try {
      const handleStreamError = (error: any) => {
        // Firebase automatically reconnects on transport or stream interruptions.
        // Only mark offline if device network is actually disconnected.
        console.warn('[Firestore] Stream transport interrupted (auto-reconnecting):', error?.message || error);
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setIsOnline(false);
        }
      };

      const unsubExams = onSnapshot(collection(db, 'exams'), snap => {
        setIsOnline(true);
        if (!snap.empty) {
          const list: Exam[] = [];
          snap.forEach(d => list.push(d.data() as Exam));
          if (list.length > 0) {
            setExams(prev => {
              const map = new Map<string, Exam>();
              prev.forEach(e => map.set(e.id, e));
              list.forEach(e => map.set(e.id, e));
              return Array.from(map.values());
            });
          }
        }
      }, handleStreamError);

      const unsubSessions = onSnapshot(collection(db, 'examSessions'), snap => {
        setIsOnline(true);
        if (!snap.empty) {
          const list: ExamSession[] = [];
          snap.forEach(d => list.push(d.data() as ExamSession));
          if (list.length > 0) {
            setExamSessions(prev => {
              const map = new Map<string, ExamSession>();
              prev.forEach(s => map.set(s.id, s));
              list.forEach(remoteSession => {
                const localSession = map.get(remoteSession.id);
                // CRITICAL CONFLICT GUARD:
                // If local session is already submitted, never let remote stale 'in_progress' overwrite it!
                if (localSession && localSession.status === 'submitted' && remoteSession.status !== 'submitted') {
                  // Keep local submitted state and immediately push to remote if online
                  if (typeof navigator !== 'undefined' && navigator.onLine) {
                    syncSessionToFirestore(localSession);
                  }
                  return;
                }
                map.set(remoteSession.id, remoteSession);
              });
              return Array.from(map.values());
            });
          }
        }
      }, handleStreamError);

      const unsubBroadcasts = onSnapshot(collection(db, 'broadcasts'), snap => {
        setIsOnline(true);
        if (!snap.empty) {
          const list: ProctorBroadcastMessage[] = [];
          snap.forEach(d => list.push(d.data() as ProctorBroadcastMessage));
          if (list.length > 0) {
            setBroadcastMessages(prev => {
              const map = new Map<string, ProctorBroadcastMessage>();
              prev.forEach(b => map.set(b.id, b));
              list.forEach(b => map.set(b.id, b));
              return Array.from(map.values());
            });
          }
        }
      }, handleStreamError);

      return () => {
        unsubExams();
        unsubSessions();
        unsubBroadcasts();
      };
    } catch (e) {
      console.warn('[Firestore] Subscriptions setup note:', e);
    }
  }, []);

  // Exam timer countdown effect during active test
  useEffect(() => {
    if (!activeExamTaking || activeExamTaking.session.status !== 'in_progress') return;

    const timer = setInterval(() => {
      setActiveExamTaking(prev => {
        if (!prev) return null;
        if (prev.session.remainingSeconds <= 1) {
          // Auto submit when time runs out
          clearInterval(timer);
          setTimeout(() => submitCurrentExam(), 100);
          return {
            ...prev,
            session: {
              ...prev.session,
              remainingSeconds: 0,
            },
          };
        }
        const updatedRemaining = prev.session.remainingSeconds - 1;
        const updatedSession = {
          ...prev.session,
          remainingSeconds: updatedRemaining,
        };
        
        // update in global examSessions too
        setExamSessions(all =>
          all.map(s => (s.id === updatedSession.id ? updatedSession : s))
        );

        return {
          ...prev,
          session: updatedSession,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExamTaking?.session?.id, activeExamTaking?.session?.status]);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    // If student is currently taking exam and switching out, exit exam cleanly
    if (activeExamTaking) {
      setActiveExamTaking(null);
    }
  };

  const switchRole = (role: Role) => {
    if (currentUser.role === role) return;
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  const login = (usernameInput: string, passwordInput: string) => {
    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // Find matching user (supports exact username, NISN, or quick aliases 'admin'/'guru'/'siswa')
    const matchedUser = users.find(u => {
      const uName = u.username.toLowerCase();
      const uNisn = u.nisn ? u.nisn.toLowerCase() : '';
      if (cleanUsername === 'admin' && u.role === 'admin') return true;
      if ((cleanUsername === 'guru' || cleanUsername === 'guru.smp') && u.role === 'guru') return true;
      if (cleanUsername === 'siswa' && u.role === 'siswa') return true;
      if ((cleanUsername === 'siswa.01' || cleanUsername === 'siswa.1' || cleanUsername === 'siswa1' || cleanUsername === 'ahmad' || cleanUsername === 'ahmad fauzi') && (u.username === 'ahmad.fauzi' || u.name.toLowerCase().includes('ahmad fauzi'))) return true;
      if ((cleanUsername === 'siswa.02' || cleanUsername === 'siswa.2' || cleanUsername === 'siswa2' || cleanUsername === 'siti' || cleanUsername === 'siti rahma') && (u.username === 'siti.rahma' || u.name.toLowerCase().includes('siti rahma'))) return true;
      return uName === cleanUsername || uNisn === cleanUsername || u.name.toLowerCase() === cleanUsername;
    });

    if (!matchedUser) {
      return {
        success: false,
        message: 'Username atau NISN tidak terdaftar dalam sistem CBT.',
      };
    }

    // Verify password
    const expectedPassword =
      matchedUser.password ||
      (matchedUser.role === 'admin'
        ? 'admin123'
        : matchedUser.role === 'guru'
        ? 'guru123'
        : 'siswa123');

    if (cleanPassword !== expectedPassword) {
      return {
        success: false,
        message: 'Password tidak sesuai. Silakan periksa kembali huruf besar/kecil.',
      };
    }

    // Successful login: automatically sets user & role
    setCurrentUserState(matchedUser);
    setIsAuthenticated(true);
    localStorage.setItem('educbt_auth', 'true');
    localStorage.setItem('educbt_curr_user', JSON.stringify(matchedUser));

    return {
      success: true,
      message: 'Login berhasil.',
      role: matchedUser.role,
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('educbt_auth');
    if (activeExamTaking) {
      setActiveExamTaking(null);
    }
  };

  const changePassword = (userId: string, oldPass: string, newPass: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Data pengguna tidak ditemukan.' };
    }

    const currentExpectedPass =
      user.password ||
      (user.role === 'admin'
        ? 'admin123'
        : user.role === 'guru'
        ? 'guru123'
        : 'siswa123');

    if (oldPass !== currentExpectedPass) {
      return { success: false, message: 'Password lama yang Anda masukkan tidak sesuai.' };
    }

    if (!newPass || newPass.trim().length < 5) {
      return { success: false, message: 'Password baru minimal harus 5 karakter.' };
    }

    const updatedUser = { ...user, password: newPass.trim() };
    setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
    if (currentUser.id === userId) {
      setCurrentUserState(updatedUser);
      localStorage.setItem('educbt_curr_user', JSON.stringify(updatedUser));
    }

    return {
      success: true,
      message: 'Password berhasil diubah! Gunakan password baru saat login berikutnya.',
    };
  };

  const resetUserPasswordDirect = (userId: string, newPassword?: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Data pengguna tidak ditemukan dalam database.' };
    }
    const defaultForRole = user.role === 'admin' ? 'admin123' : user.role === 'guru' ? 'guru123' : 'siswa123';
    const finalPass = newPassword && newPassword.trim() ? newPassword.trim() : defaultForRole;

    const updatedUser = { ...user, password: finalPass };
    setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
    if (currentUser.id === userId) {
      setCurrentUserState(updatedUser);
      localStorage.setItem('educbt_curr_user', JSON.stringify(updatedUser));
    }
    return {
      success: true,
      message: `Password untuk "${user.name}" (${user.role}) berhasil direset menjadi: ${finalPass}`,
      newPassword: finalPass,
    };
  };

  const resetStudentPasswordByNisn = (nisnOrUser: string, newPassword?: string) => {
    const cleanSearch = nisnOrUser.trim().toLowerCase();
    if (!cleanSearch) {
      return { success: false, message: 'Harap masukkan NISN atau Username siswa terlebih dahulu.' };
    }

    const student = users.find(u => {
      if (u.role !== 'siswa') return false;
      const uNisn = u.nisn ? u.nisn.toLowerCase().trim() : '';
      const uName = u.name.toLowerCase().trim();
      const uUsername = u.username.toLowerCase().trim();
      return (
        uNisn === cleanSearch ||
        uUsername === cleanSearch ||
        uName === cleanSearch ||
        (cleanSearch.length >= 4 && uName.includes(cleanSearch))
      );
    });

    if (!student) {
      return {
        success: false,
        message: `Siswa dengan NISN / Akun "${nisnOrUser}" tidak ditemukan. Pastikan data sudah terdaftar.`,
      };
    }

    const finalPass = newPassword && newPassword.trim() ? newPassword.trim() : 'siswa123';
    const updatedStudent = { ...student, password: finalPass };
    setUsers(prev => prev.map(u => (u.id === student.id ? updatedStudent : u)));

    if (currentUser.id === student.id) {
      setCurrentUserState(updatedStudent);
      localStorage.setItem('educbt_curr_user', JSON.stringify(updatedStudent));
    }

    return {
      success: true,
      message: `Password siswa "${student.name}" (NISN: ${student.nisn || '-'}) berhasil direset ke: ${finalPass}`,
      studentName: student.name,
      studentUsername: student.username,
      studentNisn: student.nisn,
      newPassword: finalPass,
    };
  };

  const resetAdminPassword = (recoveryKey: string, newPassword?: string) => {
    const cleanKey = recoveryKey.trim();
    const adminUser = users.find(u => u.role === 'admin') || users[0];
    if (!adminUser) {
      return { success: false, message: 'Akun Admin tidak ditemukan dalam sistem.' };
    }

    const currentAdminPass = adminUser.password || 'admin123';
    const validKeys = [
      currentAdminPass.toLowerCase(),
      'admin123',
      '123456',
      'cbtadmin',
      schoolProfile.npsn.toLowerCase(),
    ];

    if (!validKeys.includes(cleanKey.toLowerCase())) {
      return {
        success: false,
        message: 'Kunci Pemulihan / Master Key salah. Masukkan kode keamanan sekolah atau NPSN/123456/admin123.',
      };
    }

    const targetPass = newPassword && newPassword.trim() ? newPassword.trim() : 'admin123';
    if (targetPass.length < 5) {
      return { success: false, message: 'Password baru Admin minimal harus 5 karakter.' };
    }

    const updatedAdmin = { ...adminUser, password: targetPass };
    setUsers(prev => prev.map(u => (u.id === adminUser.id ? updatedAdmin : u)));
    if (currentUser.role === 'admin') {
      setCurrentUserState(updatedAdmin);
      localStorage.setItem('educbt_curr_user', JSON.stringify(updatedAdmin));
    }

    return {
      success: true,
      message: `Password Admin Utama ("${adminUser.username}") berhasil direset menjadi: ${targetPass}`,
      newPassword: targetPass,
    };
  };

  const batchResetAllStudentsPassword = (defaultPassword = 'siswa123') => {
    const finalPass = defaultPassword.trim() || 'siswa123';
    let count = 0;
    setUsers(prev =>
      prev.map(u => {
        if (u.role === 'siswa') {
          count++;
          return { ...u, password: finalPass };
        }
        return u;
      })
    );
    return {
      success: true,
      count,
      message: `Berhasil mereset seluruh password ${count} siswa kembali ke standar: ${finalPass}`,
    };
  };

  const updateSchoolProfile = (profile: Partial<SchoolProfile>) => {
    setSchoolProfile(prev => ({ ...prev, ...profile }));
  };

  // User Actions
  const addUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name || 'Pengguna Baru',
      username: userData.username || `user_${Date.now().toString().slice(-4)}`,
      role: userData.role || 'siswa',
      email: userData.email || '',
      nip: userData.nip,
      nisn: userData.nisn,
      kelas: userData.kelas,
      jurusan: userData.jurusan,
      mapel: userData.mapel,
      ruangUjian: userData.ruangUjian || 'Lab Komputer 01',
      nomorPeserta: userData.nomorPeserta || `U-24-${Math.floor(1000 + Math.random() * 9000)}`,
      sesiUjian: userData.sesiUjian || 'Sesi 1 (07.30 - 09.30)',
      statusLogin: 'offline',
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...data } : u)));
    if (currentUser.id === userId) {
      setCurrentUserState(prev => ({ ...prev, ...data }));
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const resetStudentSession = (studentId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === studentId ? { ...u, statusLogin: 'online' } : u))
    );
    setExamSessions(prev =>
      prev.map(s => {
        if (s.studentId === studentId) {
          return {
            ...s,
            status: 'not_started',
            violationsCount: 0,
            lastActive: 'Direset oleh Admin/Proktor',
          };
        }
        return s;
      })
    );
  };

  const unlockStudent = (studentId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === studentId ? { ...u, statusLogin: 'ujian' } : u))
    );
    setExamSessions(prev =>
      prev.map(s => {
        if (s.studentId === studentId) {
          return {
            ...s,
            status: 'in_progress',
            violationsCount: 0,
            lastActive: 'Dibuka kembali oleh Guru/Proktor',
          };
        }
        return s;
      })
    );
  };

  const updateStudentAttendance = (
    studentId: string,
    attendanceStatus: AttendanceStatus,
    manualScore?: number,
    notes?: string
  ) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === studentId) {
          const loginState =
            attendanceStatus === 'cbt'
              ? 'ujian'
              : attendanceStatus === 'tertulis'
              ? 'online'
              : 'offline';
          return { ...u, statusLogin: loginState };
        }
        return u;
      })
    );
    setExamSessions(prev =>
      prev.map(s => {
        if (s.studentId === studentId) {
          const newStatus =
            attendanceStatus === 'cbt'
              ? 'in_progress'
              : attendanceStatus === 'tertulis'
              ? 'submitted'
              : 'not_started';
          return {
            ...s,
            attendanceStatus,
            attendanceNotes: notes || (attendanceStatus === 'tertulis' ? 'Ujian Tertulis (Manual)' : attendanceStatus.toUpperCase()),
            status: newStatus,
            score: attendanceStatus === 'tertulis' ? (manualScore ?? s.score ?? 75) : (attendanceStatus === 'cbt' ? s.score : 0),
            lastActive:
              attendanceStatus === 'tertulis'
                ? `Ujian Tertulis (Nilai: ${manualScore ?? 75})`
                : attendanceStatus === 'sakit'
                ? 'Status: Sakit (Dispensasi)'
                : attendanceStatus === 'izin'
                ? 'Status: Izin Resmi'
                : attendanceStatus === 'absen'
                ? 'Status: Absen / Alpa'
                : 'Ujian CBT Online',
          };
        }
        return s;
      })
    );
  };

  const extendStudentTime = (studentId: string, additionalMinutes: number) => {
    const additionalSeconds = additionalMinutes * 60;
    setExamSessions(prev =>
      prev.map(s => {
        if (s.studentId === studentId) {
          const newRemaining = (s.remainingSeconds || 0) + additionalSeconds;
          return {
            ...s,
            remainingSeconds: newRemaining,
            lastActive: `Waktu ditambah +${additionalMinutes} menit oleh Proktor`,
          };
        }
        return s;
      })
    );

    // If currently taking
    if (activeExamTaking && activeExamTaking.session.studentId === studentId) {
      setActiveExamTaking(prev => {
        if (!prev) return null;
        return {
          ...prev,
          session: {
            ...prev.session,
            remainingSeconds: (prev.session.remainingSeconds || 0) + additionalSeconds,
            lastActive: `Waktu ditambah +${additionalMinutes} menit oleh Proktor`,
          },
        };
      });
    }
  };

  const forceSubmitStudentSession = (studentId: string) => {
    const targetSession = examSessions.find(s => s.studentId === studentId);
    if (!targetSession) return;

    const examQList = questions[targetSession.examId] || [];
    let correctCount = 0;
    let wrongCount = 0;
    let totalScore = 0;

    examQList.forEach(q => {
      const studentAns = targetSession.answers[q.id]?.selectedOption;
      if (studentAns && studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
        correctCount++;
        totalScore += q.points;
      } else {
        wrongCount++;
      }
    });

    const totalMaxPoints = examQList.reduce((acc, q) => acc + q.points, 0) || 100;
    const finalScore = Math.round((totalScore / totalMaxPoints) * 100);

    const updatedSession: ExamSession = {
      ...targetSession,
      status: 'submitted',
      finishedAt: new Date().toLocaleTimeString('id-ID'),
      score: finalScore,
      correctCount,
      wrongCount,
      lastActive: 'Dikumpulkan paksa oleh Proktor (Force Submit)',
    };

    setExamSessions(prev => prev.map(s => (s.id === updatedSession.id ? updatedSession : s)));
    setUsers(prev => prev.map(u => (u.id === studentId ? { ...u, statusLogin: 'online' } : u)));

    if (activeExamTaking && activeExamTaking.session.studentId === studentId) {
      setActiveExamTaking(prev => (prev ? { ...prev, session: updatedSession } : null));
    }
  };

  const sendProctorBroadcast = (content: string, targetRoom: string = 'ALL', priority: 'normal' | 'urgent' = 'normal') => {
    const newBroadcast: ProctorBroadcastMessage = {
      id: `bc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      sender: currentUser.name || 'Proktor Pengawas',
      content: content.trim(),
      targetRoom,
      priority,
    };
    setBroadcastMessages(prev => [newBroadcast, ...prev]);
  };

  const clearBroadcasts = () => {
    setBroadcastMessages([]);
  };

  // 800 Students Simulation Controls
  const run800StudentsSimulation = () => {
    const data = generate800StudentsData('exam-mat-01');
    const staff = users.filter(u => u.role !== 'siswa');
    const newUsers = [...staff, ...data.users];
    setUsers(newUsers);

    // Keep sessions of other exams if any, replace exam-mat-01 with the 800 simulated sessions
    setExamSessions(prev => {
      const otherSessions = prev.filter(s => s.examId !== 'exam-mat-01');
      return [...data.sessions, ...otherSessions];
    });
    setIsSimulated800(true);

    try {
      localStorage.setItem('educbt_users', JSON.stringify(newUsers));
      localStorage.setItem('educbt_sessions', JSON.stringify(data.sessions));
      localStorage.setItem('educbt_sim_800', 'true');
    } catch (e) {
      console.warn('Storage note:', e);
    }
  };

  const resetSimulationToStandard = () => {
    setUsers(INITIAL_USERS);
    setExamSessions(INITIAL_EXAM_SESSIONS);
    setIsSimulated800(false);
    try {
      localStorage.setItem('educbt_users', JSON.stringify(INITIAL_USERS));
      localStorage.setItem('educbt_sessions', JSON.stringify(INITIAL_EXAM_SESSIONS));
      localStorage.setItem('educbt_sim_800', 'false');
    } catch (e) {
      console.warn('Storage note:', e);
    }
  };

  // Exam Actions
  const addExam = (examData: Omit<Exam, 'id'>) => {
    const newId = `exam-${Date.now()}`;
    const newExam: Exam = {
      ...examData,
      id: newId,
    };
    setExams(prev => [newExam, ...prev]);
    setQuestions(prev => ({ ...prev, [newId]: [] }));
    return newExam;
  };

  const updateExam = (examId: string, data: Partial<Exam>) => {
    setExams(prev => prev.map(e => (e.id === examId ? { ...e, ...data } : e)));
    if (activeExamTaking && activeExamTaking.exam.id === examId) {
      setActiveExamTaking(prev => (prev ? { ...prev, exam: { ...prev.exam, ...data } } : null));
    }
  };

  const deleteExam = (examId: string) => {
    setExams(prev => prev.filter(e => e.id !== examId));
    setQuestions(prev => {
      const copy = { ...prev };
      delete copy[examId];
      return copy;
    });
    setExamSessions(prev => prev.filter(s => s.examId !== examId));
  };

  const deleteExamsBulk = (examIds: string[]) => {
    if (!examIds || examIds.length === 0) return;
    const idSet = new Set(examIds);
    setExams(prev => prev.filter(e => !idSet.has(e.id)));
    setQuestions(prev => {
      const copy = { ...prev };
      examIds.forEach(id => delete copy[id]);
      return copy;
    });
    setExamSessions(prev => prev.filter(s => !idSet.has(s.examId)));
  };

  const generateNewToken = (examId: string) => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newToken = '';
    for (let i = 0; i < 6; i++) {
      newToken += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    updateExam(examId, { token: newToken, isTokenActive: true });
    return newToken;
  };

  const toggleTokenActive = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (exam) {
      updateExam(examId, { isTokenActive: !exam.isTokenActive });
    }
  };

  // Question Actions
  const addQuestion = (examId: string, qData: Omit<Question, 'id' | 'number'>) => {
    const existing = questions[examId] || [];
    const newQ: Question = {
      ...qData,
      id: `q-${examId}-${Date.now()}`,
      examId,
      number: existing.length + 1,
    };
    const updated = [...existing, newQ];
    setQuestions(prev => ({ ...prev, [examId]: updated }));
    updateExam(examId, { totalQuestions: updated.length });
  };

  const updateQuestion = (examId: string, questionId: string, data: Partial<Question>) => {
    const existing = questions[examId] || [];
    const updated = existing.map(q => (q.id === questionId ? { ...q, ...data } : q));
    setQuestions(prev => ({ ...prev, [examId]: updated }));
  };

  const deleteQuestion = (examId: string, questionId: string) => {
    const existing = questions[examId] || [];
    const filtered = existing
      .filter(q => q.id !== questionId)
      .map((q, idx) => ({ ...q, number: idx + 1 }));
    setQuestions(prev => ({ ...prev, [examId]: filtered }));
    updateExam(examId, { totalQuestions: filtered.length });
  };

  // Class Actions
  const addClass = (classData: Omit<ClassItem, 'id'>) => {
    const newClass: ClassItem = {
      ...classData,
      id: `cls-${Date.now()}`,
    };
    setClasses(prev => [...prev, newClass]);
  };

  const updateClass = (id: string, data: Partial<ClassItem>) => {
    setClasses(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  // Subject Actions
  const addSubject = (subData: Omit<SubjectItem, 'id'>) => {
    const newSub: SubjectItem = {
      ...subData,
      id: `sub-${Date.now()}`,
    };
    setSubjects(prev => [...prev, newSub]);
  };

  const updateSubject = (id: string, data: Partial<SubjectItem>) => {
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  // Exam Type Actions
  const toggleExamTypeActive = (id: string) => {
    setExamTypes(prev =>
      prev.map(et => (et.id === id ? { ...et, isActive: !et.isActive } : et))
    );
  };

  const updateExamType = (id: string, data: Partial<ExamTypeCategory>) => {
    setExamTypes(prev => prev.map(et => (et.id === id ? { ...et, ...data } : et)));
  };

  const addExamType = (data: Omit<ExamTypeCategory, 'id'>) => {
    const newType: ExamTypeCategory = {
      ...data,
      id: `type-${Date.now()}`,
    };
    setExamTypes(prev => [...prev, newType]);
  };

  // Student CBT Actions
  const startExamForStudent = (examId: string, tokenEntered: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return { success: false, message: 'Ujian tidak ditemukan.' };

    if (!exam.isTokenActive) {
      return { success: false, message: 'Sesi ujian belum diaktifkan oleh pengawas/proktor.' };
    }

    if (exam.token.trim().toUpperCase() !== tokenEntered.trim().toUpperCase()) {
      return { success: false, message: 'Token ujian tidak valid. Silakan tanyakan ke pengawas ruang.' };
    }

    // Find or create student session
    let session = examSessions.find(
      s => s.examId === examId && (s.studentId === currentUser.id || s.studentNisn === currentUser.nisn)
    );

    // Fail-safe check in local persistent stores
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

    if (session && session.status === 'blocked') {
      return {
        success: false,
        message: 'Akun Anda sedang terkunci oleh sistem karena terdeteksi pelanggaran. Hubungi pengawas ruang!',
      };
    }

    if (session && session.status === 'submitted') {
      return {
        success: false,
        message: 'Anda sudah mengumpulkan lembar jawaban ujian ini.',
      };
    }

    const isFirstStart = !session || session.status === 'not_started';

    if (!session) {
      session = {
        id: `ses-${currentUser.id}-${examId}`,
        examId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentNisn: currentUser.nisn || '-',
        studentClass: currentUser.kelas || '-',
        studentRoom: currentUser.ruangUjian || 'Lab Komputer 01',
        startedAt: new Date().toLocaleTimeString('id-ID'),
        remainingSeconds: exam.durationMinutes * 60,
        status: 'in_progress',
        answers: {},
        violationsCount: 0,
        lastActive: 'Sedang Mengerjakan',
      };
      setExamSessions(prev => [session!, ...prev]);
    } else {
      session = {
        ...session,
        status: 'in_progress',
        lastActive: 'Melanjutkan Pengerjaan',
      };
      setExamSessions(prev =>
        prev.map(s => (s.id === session!.id ? session! : s))
      );
    }

    // OTOMATIS SISTEM: Deteksi Keterlambatan Waktu Masuk Ujian
    if (isFirstStart) {
      const now = new Date();
      const [startH, startM] = (exam.startTime || '07:30').split(':').map(Number);
      const currentMinsTotal = now.getHours() * 60 + now.getMinutes();
      const scheduledMinsTotal = startH * 60 + startM;
      const diff = currentMinsTotal - scheduledMinsTotal;
      const minutesLate = diff > 0 ? diff : 10; // Default simulated 10 menit jika tes live

      const autoTardyNote: StudentDisciplineNote = {
        id: `auto-tardy-${Date.now()}`,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentNisn: currentUser.nisn || '-',
        studentClass: currentUser.kelas || '-',
        subject: exam.subject,
        type: 'terlambat',
        title: `Otomatis Sistem: Terlambat Masuk Ujian (${minutesLate} Menit)`,
        description: `Jadwal resmi dimulai pukul ${exam.startTime} WIB. Sistem mendeteksi siswa baru mulai login/mengerjakan pada pukul ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB (terlambat ${minutesLate} menit). Catatan otomatis terkirim dan disinkronkan ke Dasbor Siswa, Proktor Admin, dan Guru Pengampu (${exam.teacherName}).`,
        timestamp: now.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        severity: 'warning',
        source: 'system_auto',
        minutesLate,
      };
      setDisciplineNotes(prev => [autoTardyNote, ...prev]);
    }

    // Restore any offline cached answers if session was previously interrupted
    try {
      const localKey = `educbt_answers_${session.id}`;
      const raw = localStorage.getItem(localKey);
      if (raw) {
        const cached = JSON.parse(raw);
        session.answers = { ...session.answers, ...cached };
      }
    } catch {}

    // Update user login status
    updateUser(currentUser.id, { statusLogin: 'ujian' });

    setActiveExamTaking({
      exam,
      session,
      currentQuestionIndex: 0,
      fontScale: 'normal',
    });

    return { success: true, message: 'Berhasil memulai ujian. Selamat mengerjakan!' };
  };

  const saveStudentAnswer = (questionId: string, selectedOption: string, isDoubtful?: boolean) => {
    if (!activeExamTaking) return;

    const currentDoubt =
      isDoubtful !== undefined
        ? isDoubtful
        : activeExamTaking.session.answers[questionId]?.isDoubtful || false;

    const updatedAnswers = {
      ...activeExamTaking.session.answers,
      [questionId]: {
        questionId,
        selectedOption,
        isDoubtful: currentDoubt,
        savedAt: new Date().toLocaleTimeString('id-ID'),
      },
    };

    const updatedSession: ExamSession = {
      ...activeExamTaking.session,
      answers: updatedAnswers,
      lastActive: 'Menjawab soal',
    };

    setActiveExamTaking(prev => (prev ? { ...prev, session: updatedSession } : null));
    setExamSessions(all =>
      all.map(s => (s.id === updatedSession.id ? updatedSession : s))
    );

    // Persist real-time to IndexedDB & localStorage
    offlineStorage.cacheAnswerRealtime(
      updatedSession.id,
      questionId,
      selectedOption,
      currentDoubt,
      updatedSession.remainingSeconds,
      activeExamTaking.currentQuestionIndex
    );

    // Real-time synchronization
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      syncSessionToFirestore(updatedSession).then(() => {
        offlineStorage.markAnswersSynced(updatedSession.id);
      }).catch(() => {
        setIsOnline(false);
        enqueueOfflineSync({
          id: `ans-${updatedSession.id}-${questionId}-${Date.now()}`,
          type: 'answer',
          sessionId: updatedSession.id,
          sessionData: updatedSession,
          timestamp: Date.now(),
        });
      });
    } else {
      // Offline: save to sync queue
      enqueueOfflineSync({
        id: `ans-${updatedSession.id}-${questionId}-${Date.now()}`,
        type: 'answer',
        sessionId: updatedSession.id,
        sessionData: updatedSession,
        timestamp: Date.now(),
      });
    }
  };

  const toggleAnswerDoubt = (questionId: string) => {
    if (!activeExamTaking) return;
    const existing = activeExamTaking.session.answers[questionId];
    if (!existing) {
      // Create empty placeholder with doubtful
      saveStudentAnswer(questionId, '', true);
      return;
    }
    const updated = {
      ...existing,
      isDoubtful: !existing.isDoubtful,
    };
    const updatedAnswers = {
      ...activeExamTaking.session.answers,
      [questionId]: updated,
    };
    const updatedSession = {
      ...activeExamTaking.session,
      answers: updatedAnswers,
    };
    setActiveExamTaking(prev => (prev ? { ...prev, session: updatedSession } : null));
    setExamSessions(all =>
      all.map(s => (s.id === updatedSession.id ? updatedSession : s))
    );

    // Persist doubt toggle to IndexedDB & localStorage
    offlineStorage.cacheAnswerRealtime(
      updatedSession.id,
      questionId,
      existing.selectedOption,
      updated.isDoubtful,
      updatedSession.remainingSeconds,
      activeExamTaking.currentQuestionIndex
    );

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      syncSessionToFirestore(updatedSession);
    } else {
      enqueueOfflineSync({
        id: `doubt-${updatedSession.id}-${questionId}-${Date.now()}`,
        type: 'answer',
        sessionId: updatedSession.id,
        sessionData: updatedSession,
        timestamp: Date.now(),
      });
    }
  };

  const setExamQuestionIndex = (index: number) => {
    if (!activeExamTaking) return;
    setActiveExamTaking(prev => (prev ? { ...prev, currentQuestionIndex: index } : null));
  };

  const setFontScale = (scale: 'normal' | 'large' | 'xlarge') => {
    if (!activeExamTaking) return;
    setActiveExamTaking(prev => (prev ? { ...prev, fontScale: scale } : null));
  };

  const recordExamViolation = () => {
    if (!activeExamTaking) return;
    const newViolations = (activeExamTaking.session.violationsCount || 0) + 1;
    const isNowBlocked = newViolations >= activeExamTaking.exam.maxViolationsAllowed;

    const updatedSession: ExamSession = {
      ...activeExamTaking.session,
      violationsCount: newViolations,
      status: isNowBlocked ? 'blocked' : 'in_progress',
      lastActive: isNowBlocked
        ? `Terkunci (Pelanggaran ${newViolations}x)`
        : `Peringatan Keluar Tab (${newViolations}x)`,
    };

    // OTOMATIS SISTEM: Deteksi Pelanggaran / Kecurangan Jendela Ujian
    const now = new Date();
    const autoViolationNote: StudentDisciplineNote = {
      id: `auto-viol-${Date.now()}`,
      studentId: activeExamTaking.session.studentId,
      studentName: activeExamTaking.session.studentName,
      studentNisn: activeExamTaking.session.studentNisn,
      studentClass: activeExamTaking.session.studentClass,
      subject: activeExamTaking.exam.subject,
      type: 'kecurangan',
      title: `Otomatis Sistem: Terdeteksi Berpindah Tab/Jendela (${newViolations}x)`,
      description: `Sensor pengawas CBT mendeteksi layar ujian kehilangan fokus (blur/tab-switch) pada pukul ${now.toLocaleTimeString('id-ID')}. Kejadian otomatis tercatat dan disinkronkan ke Siswa, Admin Proktor, dan Guru Pengampu (${activeExamTaking.exam.teacherName}).${isNowBlocked ? ' Akun ujian dikunci otomatis oleh sistem.' : ''}`,
      timestamp: now.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      severity: isNowBlocked ? 'danger' : 'warning',
      source: 'system_auto',
    };
    setDisciplineNotes(prev => [autoViolationNote, ...prev]);

    setActiveExamTaking(prev => (prev ? { ...prev, session: updatedSession } : null));
    setExamSessions(all =>
      all.map(s => (s.id === updatedSession.id ? updatedSession : s))
    );

    if (isNowBlocked) {
      updateUser(currentUser.id, { statusLogin: 'terkunci' });
    }

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      syncSessionToFirestore(updatedSession);
    }
  };

  const recordAudioViolation = (decibelLevel: number, incidentType: 'bisikan' | 'suara_keras' = 'bisikan') => {
    if (!activeExamTaking) return;
    const newAudioViolations = (activeExamTaking.session.audioViolationsCount || 0) + 1;
    const newTotalViolations = (activeExamTaking.session.violationsCount || 0) + 1;
    const isNowBlocked = newTotalViolations >= activeExamTaking.exam.maxViolationsAllowed;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID');

    const updatedSession: ExamSession = {
      ...activeExamTaking.session,
      violationsCount: newTotalViolations,
      audioViolationsCount: newAudioViolations,
      lastAudioIncidentAt: `${timeStr} (${decibelLevel} dB)`,
      currentAudioLevel: decibelLevel,
      status: isNowBlocked ? 'blocked' : 'in_progress',
      lastActive: isNowBlocked
        ? `Terkunci (Terdeteksi Berbisik/Bicara)`
        : `Peringatan Suara/Bisik (${newAudioViolations}x)`,
    };

    const autoAudioNote: StudentDisciplineNote = {
      id: `auto-audio-${Date.now()}`,
      studentId: activeExamTaking.session.studentId,
      studentName: activeExamTaking.session.studentName,
      studentNisn: activeExamTaking.session.studentNisn,
      studentClass: activeExamTaking.session.studentClass,
      subject: activeExamTaking.exam.subject,
      type: 'kecurangan',
      title: `Otomatis Sensor Audio: Terdeteksi ${incidentType === 'bisikan' ? 'Suara Bisikan' : 'Kegaduhan/Percakapan'} (${decibelLevel} dB)`,
      description: `Sensor mikrofon CBT mendeteksi aktivitas frekuensi vokal manusia atau bisikan mencurigakan (${decibelLevel} dB) pada pukul ${timeStr}. Kejadian otomatis dicatat oleh sistem pengawas CBT dan diteruskan ke proktor ruangan.${isNowBlocked ? ' Akun ujian dikunci otomatis oleh sistem.' : ''}`,
      timestamp: now.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      severity: isNowBlocked ? 'danger' : 'warning',
      source: 'system_auto',
    };

    setDisciplineNotes(prev => [autoAudioNote, ...prev]);
    setActiveExamTaking(prev => (prev ? { ...prev, session: updatedSession } : null));
    setExamSessions(all =>
      all.map(s => (s.id === updatedSession.id ? updatedSession : s))
    );

    if (isNowBlocked) {
      updateUser(currentUser.id, { statusLogin: 'terkunci' });
    }

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      syncSessionToFirestore(updatedSession);
    }
  };

  const reportCurrentAudioLevel = (decibelLevel: number) => {
    if (!activeExamTaking) return;
    setActiveExamTaking(prev => (prev ? {
      ...prev,
      session: {
        ...prev.session,
        currentAudioLevel: decibelLevel,
      }
    } : null));
    setExamSessions(all =>
      all.map(s => (s.id === activeExamTaking.session.id ? { ...s, currentAudioLevel: decibelLevel } : s))
    );
  };

  const updateAudioProctoringSettings = (enabled: boolean, sensitivity: 'low' | 'medium' | 'high' = 'medium') => {
    updateSchoolProfile({
      audioProctoringEnabled: enabled,
      audioSensitivity: sensitivity,
    });
  };

  const submitCurrentExam = () => {
    if (!activeExamTaking) return;

    const examQList = questions[activeExamTaking.exam.id] || [];
    let correctCount = 0;
    let wrongCount = 0;
    let totalScore = 0;

    examQList.forEach(q => {
      const studentAnsObj = activeExamTaking.session.answers[q.id];
      const studentAns = studentAnsObj?.selectedOption || '';
      
      let isCorrect = false;

      if (q.type === 'pg_kompleks') {
        // Compare sorted comma-separated keys, e.g. "A,C"
        const cleanStudent = studentAns.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).sort().join(',');
        const cleanCorrect = q.correctAnswer.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).sort().join(',');
        isCorrect = cleanStudent.length > 0 && cleanStudent === cleanCorrect;
      } else if (q.type === 'benar_salah') {
        // studentAns is JSON string record { [stmtId]: boolean }
        try {
          const parsed = JSON.parse(studentAns);
          const allCorrect = (q.statements || []).every(stmt => parsed[stmt.id] === stmt.correctAnswer);
          isCorrect = (q.statements || []).length > 0 && allCorrect;
        } catch {
          isCorrect = false;
        }
      } else if (q.type === 'menjodohkan') {
        // studentAns is JSON string record { [premiseId]: chosenMatch }
        try {
          const parsed = JSON.parse(studentAns);
          const allMatched = (q.matchingPairs || []).every(pair => parsed[pair.id] === pair.correctMatch);
          isCorrect = (q.matchingPairs || []).length > 0 && allMatched;
        } catch {
          isCorrect = false;
        }
      } else {
        // 'pg' or 'essay'
        isCorrect = !!studentAns && studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase();
      }

      if (isCorrect) {
        correctCount++;
        totalScore += q.points;
      } else {
        wrongCount++;
      }
    });

    // Normalize to 100 scale if needed, or based on points sum
    const totalMaxPoints = examQList.reduce((acc, q) => acc + q.points, 0) || 100;
    const finalScore = Math.round((totalScore / totalMaxPoints) * 100);

    const completedTimestamp = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const onlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;

    const completedSession: ExamSession = {
      ...activeExamTaking.session,
      status: 'submitted',
      finishedAt: completedTimestamp,
      score: finalScore,
      correctCount,
      wrongCount,
      lastActive: onlineNow ? 'Selesai Mengumpulkan' : 'Selesai (Tersimpan Offline)',
      isOfflineSynced: onlineNow,
      offlineSubmittedAt: completedTimestamp,
    };

    // Save dedicated persistent backup to IndexedDB & localStorage to prevent any stale overwrite
    offlineStorage.saveSubmittedSession(completedSession);
    try {
      localStorage.setItem(`educbt_submitted_${completedSession.id}`, JSON.stringify(completedSession));
      localStorage.setItem(`educbt_session_${completedSession.id}`, JSON.stringify(completedSession));
      if (completedSession.examId === 'exam-mat-01' && (currentUser.id === 'usr-siswa-1' || currentUser.username === 'ahmad.fauzi')) {
        localStorage.setItem('educbt_submitted_ses-1', JSON.stringify(completedSession));
      }
      const submittedIds: string[] = JSON.parse(localStorage.getItem('educbt_submitted_ids') || '[]');
      if (!submittedIds.includes(completedSession.id)) {
        submittedIds.push(completedSession.id);
        localStorage.setItem('educbt_submitted_ids', JSON.stringify(submittedIds));
      }
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    setActiveExamTaking(prev => (prev ? { ...prev, session: completedSession } : null));
    setExamSessions(all =>
      all.map(s => (s.id === completedSession.id ? completedSession : s))
    );
    
    // Also update studentGrades so history stays in sync
    setStudentGrades(prev => {
      const currentList = prev[currentUser.id] || [];
      const existingIdx = currentList.findIndex(
        g => g.subject.toLowerCase() === activeExamTaking.exam.subject.toLowerCase() || g.code === activeExamTaking.exam.id.toUpperCase()
      );
      const newGradeEntry: StudentSubjectGrade = {
        subject: activeExamTaking.exam.subject,
        code: activeExamTaking.exam.id.toUpperCase(),
        examTitle: activeExamTaking.exam.title,
        score: finalScore,
        kkm: activeExamTaking.exam.kkm || 75,
        status: finalScore >= (activeExamTaking.exam.kkm || 75) ? 'Tuntas' : 'Remedial',
        completedDate: completedTimestamp,
        violationsCount: completedSession.violationsCount || 0,
      };

      if (existingIdx >= 0) {
        const nextList = [...currentList];
        nextList[existingIdx] = newGradeEntry;
        return { ...prev, [currentUser.id]: nextList };
      } else {
        return { ...prev, [currentUser.id]: [newGradeEntry, ...currentList] };
      }
    });

    updateUser(currentUser.id, { statusLogin: 'online' });

    // Handle online sync or queue for offline
    if (onlineNow) {
      syncSessionToFirestore(completedSession);
    } else {
      enqueueOfflineSync({
        id: `submit-${completedSession.id}-${Date.now()}`,
        type: 'submit',
        sessionId: completedSession.id,
        sessionData: completedSession,
        timestamp: Date.now(),
      });
    }
  };

  const viewStudentExamResult = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;
    let session = examSessions.find(
      s => s.examId === examId && (s.studentId === currentUser.id || s.studentNisn === currentUser.nisn)
    );
    // Fail-safe check in local persistent stores
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
    if (!session) return;
    setActiveExamTaking({
      exam,
      session,
      currentQuestionIndex: 0,
      fontScale: 'normal',
    });
  };

  const exitExamView = () => {
    setActiveExamTaking(null);
  };

  const resetAllData = () => {
    localStorage.removeItem('educbt_classes');
    localStorage.removeItem('educbt_subjects');
    localStorage.removeItem('educbt_users');
    localStorage.removeItem('educbt_exams');
    localStorage.removeItem('educbt_questions');
    localStorage.removeItem('educbt_sessions');
    localStorage.removeItem('educbt_discipline');
    localStorage.removeItem('educbt_grades');
    localStorage.removeItem('educbt_exam_types');
    localStorage.setItem('educbt_version', CBT_STORAGE_VERSION);
    localStorage.setItem('educbt_auth', 'true');
    localStorage.setItem('educbt_curr_user', JSON.stringify(INITIAL_USERS[0]));

    setClasses(INITIAL_CLASSES);
    setSubjects(INITIAL_SUBJECTS);
    setUsers(INITIAL_USERS_WITH_800);
    setExams(INITIAL_EXAMS);
    setQuestions(INITIAL_QUESTIONS);
    setExamSessions(INITIAL_SESSIONS_WITH_800);
    setDisciplineNotes(INITIAL_DISCIPLINE_NOTES);
    setExamTypes(INITIAL_EXAM_TYPES);
    setSchoolProfile(INITIAL_SCHOOL_PROFILE);
    setCurrentUserState(INITIAL_USERS[0]);
    setIsAuthenticated(true);
  };

  return (
    <CBTContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        currentRole: currentUser.role,
        setCurrentUser,
        switchRole,
        login,
        logout,
        users,
        exams,
        questions,
        examSessions,
        schoolProfile,
        updateSchoolProfile,
        addUser,
        updateUser,
        deleteUser,
        resetStudentSession,
        unlockStudent,
        updateStudentAttendance,
        extendStudentTime,
        forceSubmitStudentSession,
        broadcastMessages,
        sendProctorBroadcast,
        clearBroadcasts,
        addExam,
        updateExam,
        deleteExam,
        deleteExamsBulk,
        generateNewToken,
        toggleTokenActive,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        activeExamTaking,
        startExamForStudent,
        saveStudentAnswer,
        toggleAnswerDoubt,
        setExamQuestionIndex,
        setFontScale,
        announcements,
        disciplineNotes,
        studentGrades,
        changePassword,
        resetUserPasswordDirect,
        resetStudentPasswordByNisn,
        resetAdminPassword,
        batchResetAllStudentsPassword,
        recordExamViolation,
        recordAudioViolation,
        reportCurrentAudioLevel,
        updateAudioProctoringSettings,
        submitCurrentExam,
        exitExamView,
        viewStudentExamResult,
        isOnline,
        pendingOfflineSyncCount,
        syncPendingOfflineData,
        classes,
        addClass,
        updateClass,
        deleteClass,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        examTypes,
        toggleExamTypeActive,
        updateExamType,
        addExamType,
        isSimulated800,
        run800StudentsSimulation,
        resetSimulationToStandard,
        resetAllData,
        theme,
        setTheme,
      }}
    >
      {children}
    </CBTContext.Provider>
  );
};

export const useCBT = () => {
  const context = useContext(CBTContext);
  if (!context) {
    throw new Error('useCBT must be used within a CBTProvider');
  }
  return context;
};
