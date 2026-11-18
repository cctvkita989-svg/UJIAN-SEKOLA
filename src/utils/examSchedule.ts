import { Exam } from '../types/cbt';

export function getTodayIsoDate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToIsoDate(days: number, base: Date = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
  return getTodayIsoDate(d);
}

export function formatExamDateId(
  examDate?: string,
  fallback = 'Belum diatur (Fleksibel)'
): string {
  if (!examDate || !/^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
    return fallback;
  }
  const [y, m, d] = examDate.split('-').map(Number);
  const localDate = new Date(y, m - 1, d);
  if (Number.isNaN(localDate.getTime())) return fallback;
  return localDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function computeDurationMinutes(
  startTime: string,
  endTime: string
): number | null {
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    return null;
  }
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  if (diff >= 10 && diff <= 480) {
    return diff;
  }
  return null;
}

export type ExamTimingStatus =
  | 'ongoing'
  | 'ready'
  | 'before_date'
  | 'before_time'
  | 'after_time'
  | 'completed'
  | 'draft';

export function getExamTimingStatus(
  exam: Exam,
  now: Date = new Date()
): ExamTimingStatus {
  if (exam.status === 'completed') return 'completed';
  if (exam.status === 'draft') return 'draft';
  if (exam.status === 'ongoing') return 'ongoing';

  // Exam status is 'published'
  if (exam.examDate && /^\d{4}-\d{2}-\d{2}$/.test(exam.examDate)) {
    const todayIso = getTodayIsoDate(now);
    if (todayIso < exam.examDate) return 'before_date';
    if (todayIso > exam.examDate) return 'after_time';

    const [sh, sm] = (exam.startTime || '00:00').split(':').map(Number);
    const [eh, em] = (exam.endTime || '23:59').split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    if (nowMins < startMins) return 'before_time';
    if (nowMins > endMins) return 'after_time';
    return 'ready';
  }

  return 'before_time';
}
