import { StudentAnswer, ExamSession } from '../types/cbt';

const DB_NAME = 'EduCBT_OfflineDB';
const DB_VERSION = 2;
const STORE_ANSWERS = 'exam_answers';
const STORE_SESSIONS = 'exam_sessions';
const STORE_QUEUE = 'sync_queue';

export interface CachedAnswerItem {
  id: string; // `${sessionId}_${questionId}`
  sessionId: string;
  questionId: string;
  selectedOption: string;
  isDoubtful: boolean;
  savedAt: string;
  timestamp: number;
  synced: boolean;
}

export interface CachedSessionProgress {
  sessionId: string;
  examId: string;
  studentId: string;
  currentQuestionIndex: number;
  remainingSeconds: number;
  lastUpdated: number;
  answers: Record<string, StudentAnswer>;
}

class OfflineStorageManager {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    this.initDB();
  }

  public initDB(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[OfflineStorage] IndexedDB not supported; using localStorage fallback.');
      this.dbPromise = Promise.resolve(null);
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains(STORE_ANSWERS)) {
            const answerStore = db.createObjectStore(STORE_ANSWERS, { keyPath: 'id' });
            answerStore.createIndex('sessionId', 'sessionId', { unique: false });
            answerStore.createIndex('synced', 'synced', { unique: false });
          }

          if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
            const sessionStore = db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
            sessionStore.createIndex('studentId', 'studentId', { unique: false });
            sessionStore.createIndex('examId', 'examId', { unique: false });
            sessionStore.createIndex('status', 'status', { unique: false });
          }

          if (!db.objectStoreNames.contains(STORE_QUEUE)) {
            db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('[OfflineStorage] IndexedDB open error; fallback to localStorage');
          resolve(null);
        };
      } catch (err) {
        console.warn('[OfflineStorage] IndexedDB init exception; fallback to localStorage', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  // Real-time answer caching into both IndexedDB and localStorage
  public async cacheAnswerRealtime(
    sessionId: string,
    questionId: string,
    selectedOption: string,
    isDoubtful: boolean,
    remainingSeconds?: number,
    currentIndex?: number
  ): Promise<void> {
    const timestamp = Date.now();
    const savedAt = new Date().toLocaleTimeString('id-ID');
    const answerItem: CachedAnswerItem = {
      id: `${sessionId}_${questionId}`,
      sessionId,
      questionId,
      selectedOption,
      isDoubtful,
      savedAt,
      timestamp,
      synced: false,
    };

    // 1. Synchronously update localStorage for zero-latency retrieval
    try {
      const localKey = `educbt_answers_${sessionId}`;
      const existing = localStorage.getItem(localKey);
      const answersMap: Record<string, StudentAnswer> = existing ? JSON.parse(existing) : {};
      answersMap[questionId] = {
        questionId,
        selectedOption,
        isDoubtful,
        savedAt,
      };
      localStorage.setItem(localKey, JSON.stringify(answersMap));

      // Also update progress snapshot in localStorage
      const progressKey = `educbt_progress_${sessionId}`;
      const currentProgress: CachedSessionProgress = {
        sessionId,
        examId: sessionId.split('-').slice(2).join('-') || '',
        studentId: sessionId.split('-')[1] || '',
        currentQuestionIndex: currentIndex ?? 0,
        remainingSeconds: remainingSeconds ?? 3600,
        lastUpdated: timestamp,
        answers: answersMap,
      };
      localStorage.setItem(progressKey, JSON.stringify(currentProgress));
    } catch (e) {
      console.warn('[OfflineStorage] localStorage answer save warning:', e);
    }

    // 2. Persist asynchronously to IndexedDB
    try {
      const db = await this.initDB();
      if (db) {
        const tx = db.transaction([STORE_ANSWERS], 'readwrite');
        const store = tx.objectStore(STORE_ANSWERS);
        store.put(answerItem);
      }
    } catch (e) {
      console.warn('[OfflineStorage] IndexedDB put error:', e);
    }
  }

  // Cache or update entire session in IndexedDB and localStorage
  public async cacheSession(session: ExamSession): Promise<void> {
    try {
      localStorage.setItem(`educbt_session_${session.id}`, JSON.stringify(session));
      // Track session IDs in a compact index
      const ids: string[] = JSON.parse(localStorage.getItem('educbt_known_session_ids') || '[]');
      if (!ids.includes(session.id)) {
        ids.push(session.id);
        localStorage.setItem('educbt_known_session_ids', JSON.stringify(ids));
      }
    } catch (e) {
      console.warn('[OfflineStorage] localStorage session cache warning:', e);
    }

    try {
      const db = await this.initDB();
      if (db) {
        const tx = db.transaction([STORE_SESSIONS], 'readwrite');
        tx.objectStore(STORE_SESSIONS).put(session);
      }
    } catch (e) {
      console.warn('[OfflineStorage] IndexedDB session cache error:', e);
    }
  }

  // Save final submitted session to permanent local stores
  public async saveSubmittedSession(session: ExamSession): Promise<void> {
    const finalSession: ExamSession = {
      ...session,
      status: 'submitted',
    };

    // 1. localStorage with dedicated submitted key
    try {
      localStorage.setItem(`educbt_submitted_${session.id}`, JSON.stringify(finalSession));
      localStorage.setItem(`educbt_session_${session.id}`, JSON.stringify(finalSession));

      const submittedIds: string[] = JSON.parse(localStorage.getItem('educbt_submitted_ids') || '[]');
      if (!submittedIds.includes(session.id)) {
        submittedIds.push(session.id);
        localStorage.setItem('educbt_submitted_ids', JSON.stringify(submittedIds));
      }
    } catch (e) {
      console.warn('[OfflineStorage] localStorage submitted save warning:', e);
    }

    // 2. IndexedDB store
    try {
      const db = await this.initDB();
      if (db) {
        const tx = db.transaction([STORE_SESSIONS], 'readwrite');
        tx.objectStore(STORE_SESSIONS).put(finalSession);
      }
    } catch (e) {
      console.warn('[OfflineStorage] IndexedDB saveSubmittedSession error:', e);
    }
  }

  // Retrieve cached answers for a session (checking localStorage first, then IndexedDB)
  public async getCachedAnswers(sessionId: string): Promise<Record<string, StudentAnswer>> {
    // Check localStorage first (synchronous zero latency)
    try {
      const localKey = `educbt_answers_${sessionId}`;
      const raw = localStorage.getItem(localKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}

    // Check IndexedDB
    try {
      const db = await this.initDB();
      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction([STORE_ANSWERS], 'readonly');
          const store = tx.objectStore(STORE_ANSWERS);
          const index = store.index('sessionId');
          const request = index.getAll(sessionId);

          request.onsuccess = () => {
            const list = request.result as CachedAnswerItem[];
            const map: Record<string, StudentAnswer> = {};
            list.forEach(item => {
              map[item.questionId] = {
                questionId: item.questionId,
                selectedOption: item.selectedOption,
                isDoubtful: item.isDoubtful,
                savedAt: item.savedAt,
              };
            });
            resolve(map);
          };

          request.onerror = () => resolve({});
        });
      }
    } catch {}

    return {};
  }

  // Retrieve single session by ID
  public async getSession(sessionId: string): Promise<ExamSession | null> {
    // 1. Check submitted backup first
    try {
      const sub = localStorage.getItem(`educbt_submitted_${sessionId}`);
      if (sub) return JSON.parse(sub);
      const ses = localStorage.getItem(`educbt_session_${sessionId}`);
      if (ses) return JSON.parse(ses);
    } catch {}

    // 2. Check IndexedDB
    try {
      const db = await this.initDB();
      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction([STORE_SESSIONS], 'readonly');
          const store = tx.objectStore(STORE_SESSIONS);
          const request = store.get(sessionId);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        });
      }
    } catch {}

    return null;
  }

  // Retrieve all locally cached sessions from IndexedDB and localStorage
  public async getAllPersistedSessions(): Promise<ExamSession[]> {
    const sessionMap = new Map<string, ExamSession>();

    // 1. Read from localStorage submitted IDs and session keys
    try {
      const submittedIds: string[] = JSON.parse(localStorage.getItem('educbt_submitted_ids') || '[]');
      submittedIds.forEach(id => {
        const raw = localStorage.getItem(`educbt_submitted_${id}`);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            sessionMap.set(parsed.id, parsed);
          } catch {}
        }
      });

      const knownIds: string[] = JSON.parse(localStorage.getItem('educbt_known_session_ids') || '[]');
      knownIds.forEach(id => {
        if (!sessionMap.has(id)) {
          const raw = localStorage.getItem(`educbt_session_${id}`);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              sessionMap.set(parsed.id, parsed);
            } catch {}
          }
        }
      });
    } catch {}

    // 2. Read all from IndexedDB STORE_SESSIONS
    try {
      const db = await this.initDB();
      if (db) {
        const fromIDB = await new Promise<ExamSession[]>((resolve) => {
          const tx = db.transaction([STORE_SESSIONS], 'readonly');
          const store = tx.objectStore(STORE_SESSIONS);
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => resolve([]);
        });

        fromIDB.forEach(s => {
          const existing = sessionMap.get(s.id);
          // If existing is already submitted, keep submitted
          if (existing && existing.status === 'submitted') {
            return;
          }
          sessionMap.set(s.id, s);
        });
      }
    } catch {}

    return Array.from(sessionMap.values());
  }

  // Mark all answers for a session as synced
  public async markAnswersSynced(sessionId: string): Promise<void> {
    try {
      const db = await this.initDB();
      if (db) {
        const tx = db.transaction([STORE_ANSWERS], 'readwrite');
        const store = tx.objectStore(STORE_ANSWERS);
        const index = store.index('sessionId');
        const request = index.getAll(sessionId);

        request.onsuccess = () => {
          const list = request.result as CachedAnswerItem[];
          list.forEach(item => {
            item.synced = true;
            store.put(item);
          });
        };
      }
    } catch {}
  }

  // Clear session cache when complete and safely acknowledged
  public async clearSessionCache(sessionId: string): Promise<void> {
    try {
      localStorage.removeItem(`educbt_answers_${sessionId}`);
      localStorage.removeItem(`educbt_progress_${sessionId}`);
      localStorage.removeItem(`educbt_session_${sessionId}`);
    } catch {}

    try {
      const db = await this.initDB();
      if (db) {
        const tx = db.transaction([STORE_SESSIONS, STORE_ANSWERS], 'readwrite');
        tx.objectStore(STORE_SESSIONS).delete(sessionId);
      }
    } catch {}
  }
}

export const offlineStorage = new OfflineStorageManager();
