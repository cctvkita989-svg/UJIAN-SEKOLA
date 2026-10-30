import { User, ExamSession, StudentAnswer } from '../types/cbt';
import { OFFICIAL_STUDENTS_LIST } from '../data/officialStudentsData';

const FIRST_NAMES_MALE = [
  'Ahmad', 'Muhammad', 'Rizky', 'Dimas', 'Budi', 'Fajar', 'Rian', 'Bayu',
  'Kevin', 'Daniel', 'Jonathan', 'Farhan', 'Aditya', 'Bagas', 'Gilang',
  'Hendra', 'Ilham', 'Raditya', 'Wahyu', 'Yoga', 'Alif', 'Aldi', 'Reza',
  'Arif', 'Doni', 'Eko', 'Galih', 'Hafiz', 'Irfan', 'Joko', 'Lukman',
  'Maulana', 'Naufal', 'Pratama', 'Rafi', 'Satria', 'Taufik', 'Vicky', 'Wisnu', 'Zaki'
];

const FIRST_NAMES_FEMALE = [
  'Siti', 'Nur', 'Putri', 'Annisa', 'Dewi', 'Ayu', 'Tiara', 'Nabila',
  'Dinda', 'Jihan', 'Lestari', 'Maya', 'Nadia', 'Syifa', 'Zahra', 'Alya',
  'Cantika', 'Dina', 'Fitri', 'Gita', 'Hana', 'Indah', 'Kirana', 'Laras',
  'Mega', 'Nita', 'Oki', 'Permata', 'Rani', 'Salsabila', 'Tasya', 'Utami',
  'Vina', 'Wulan', 'Yulia', 'Zulfa', 'Amalia', 'Bella', 'Citra', 'Dhea'
];

const LAST_NAMES = [
  'Pratama', 'Saputra', 'Hidayat', 'Lestari', 'Wijaya', 'Santoso', 'Kusuma',
  'Ramadhan', 'Nugroho', 'Setiawan', 'Wibowo', 'Utami', 'Maharani', 'Siregar',
  'Nasution', 'Simanjuntak', 'Panjaitan', 'Lubis', 'Ginting', 'Tarigan',
  'Suhendar', 'Permana', 'Maulida', 'Rahman', 'Gunawan', 'Kurniawan', 'Firmansyah',
  'Prasetyo', 'Hartono', 'Suryono', 'Sanjaya', 'Anggraini', 'Puspitasari', 'Pertiwi'
];

const CLASSES = [
  'VII-1', 'VII-2', 'VII-3', 'VII-4', 'VII-5', 'VII-6', 'VII-7', 'VII-8',
  'VIII-1', 'VIII-2', 'VIII-3', 'VIII-4', 'VIII-5', 'VIII-6', 'VIII-7', 'VIII-8',
  'IX-1', 'IX-2', 'IX-3', 'IX-4', 'IX-5', 'IX-6', 'IX-7', 'IX-8'
];

const LAB_ROOMS = [
  'Ruang Kelas VII-1', 'Ruang Kelas VII-2', 'Ruang Kelas VII-3', 'Ruang Kelas VII-4',
  'Ruang Kelas VII-5', 'Ruang Kelas VII-6', 'Ruang Kelas VII-7', 'Ruang Kelas VII-8'
];

const RELIGIONS: ('Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu')[] = [
  'Islam', 'Islam', 'Islam', 'Islam', 'Islam', 'Islam', 'Islam', 'Islam',
  'Kristen', 'Katolik', 'Hindu', 'Buddha'
];

// Target correct answers for exam-mat-01 (10 questions)
const EXAM_KEY: Record<string, { correct: string; options: string[] }> = {
  'q-mat-1': { correct: 'C', options: ['A', 'B', 'C', 'D', 'E'] },
  'q-mat-2': { correct: 'B', options: ['A', 'B', 'C', 'D', 'E'] },
  'q-mat-3': { correct: 'B', options: ['A', 'B', 'C', 'D', 'E'] },
  'q-mat-4': { correct: 'C', options: ['A', 'B', 'C', 'D', 'E'] },
  'q-mat-5': { correct: 'A', options: ['A', 'B', 'C', 'D', 'E'] },
  'q-mat-6': { correct: 'A,C,D', options: ['A,C,D', 'A,B,C', 'A,C', 'B,D', 'A,D,E'] },
  'q-mat-7': {
    correct: JSON.stringify({ 'stmt-1': true, 'stmt-2': false, 'stmt-3': true }),
    options: [
      JSON.stringify({ 'stmt-1': true, 'stmt-2': false, 'stmt-3': true }),
      JSON.stringify({ 'stmt-1': true, 'stmt-2': true, 'stmt-3': true }),
      JSON.stringify({ 'stmt-1': false, 'stmt-2': false, 'stmt-3': true }),
    ]
  },
  'q-mat-8': {
    correct: JSON.stringify({ 'pair-1': '2x', 'pair-2': 'cos x', 'pair-3': '3x²', 'pair-4': '-sin x' }),
    options: [
      JSON.stringify({ 'pair-1': '2x', 'pair-2': 'cos x', 'pair-3': '3x²', 'pair-4': '-sin x' }),
      JSON.stringify({ 'pair-1': '2x', 'pair-2': '-sin x', 'pair-3': '3x²', 'pair-4': 'cos x' }),
    ]
  },
  'q-mat-9': { correct: 'C', options: ['A', 'B', 'C', 'D', 'E'] },
  'q-mat-10': { correct: 'C', options: ['A', 'B', 'C', 'D', 'E'] }
};

const QUESTION_IDS = Object.keys(EXAM_KEY);

/**
 * Generate 800 realistic student users and exam sessions with high fidelity bell-curve distribution.
 */
export function generate800StudentsData(examId: string = 'exam-mat-01'): {
  users: User[];
  sessions: ExamSession[];
  summary: {
    totalStudents: number;
    passedCount: number;
    remedialCount: number;
    avgScore: number;
    highestScore: number;
    lowestScore: number;
    scoreDistribution: Record<string, number>;
  };
} {
  const users: User[] = [];
  const sessions: ExamSession[] = [];

  // Realistic score distribution across 800 students
  // 100: 48 siswa (6%)
  // 90: 144 siswa (18%)
  // 80: 320 siswa (40%)
  // 70: 176 siswa (22%)
  // 60: 64 siswa (8%)
  // 50: 32 siswa (4%)
  // 40: 16 siswa (2%)
  // Total: 800
  const scoreTargets: number[] = [];
  for (let i = 0; i < 48; i++) scoreTargets.push(100);
  for (let i = 0; i < 144; i++) scoreTargets.push(90);
  for (let i = 0; i < 320; i++) scoreTargets.push(80);
  for (let i = 0; i < 176; i++) scoreTargets.push(70);
  for (let i = 0; i < 64; i++) scoreTargets.push(60);
  for (let i = 0; i < 320 - 288; i++) scoreTargets.push(50); // 32
  for (let i = 0; i < 16; i++) scoreTargets.push(40);

  // Pad or trim to exactly 800
  while (scoreTargets.length < 800) scoreTargets.push(80);
  while (scoreTargets.length > 800) scoreTargets.pop();

  // Pseudo-random deterministic shuffle
  for (let i = scoreTargets.length - 1; i > 0; i--) {
    const j = (i * 37 + 19) % (i + 1);
    const temp = scoreTargets[i];
    scoreTargets[i] = scoreTargets[j];
    scoreTargets[j] = temp;
  }

  let totalScoreSum = 0;
  let passedCount = 0;
  const scoreDistribution: Record<string, number> = {
    '90 - 100 (A)': 0,
    '80 - 89 (B)': 0,
    '70 - 79 (C)': 0,
    '60 - 69 (D)': 0,
    '< 60 (E)': 0,
  };

  // Use official students dataset from the school roster
  const studentSourceList = OFFICIAL_STUDENTS_LIST;
  const TOTAL_STUDENTS = studentSourceList.length;

  for (let i = 0; i < TOTAL_STUDENTS; i++) {
    const officialStudent = studentSourceList[i];
    const studentId = officialStudent.id;
    const fullName = officialStudent.name;
    const nisn = officialStudent.nisn || `006819${String(1001 + i).slice(0, 4)}`;
    const studentClass = officialStudent.kelas || 'VII-1';
    const labRoom = officialStudent.ruangUjian || `Ruang Kelas ${studentClass}`;
    const religion = officialStudent.agama || 'Islam';
    const sessionName = officialStudent.sesiUjian || 'Sesi 1 (07.30 - 09.30)';
    const noPeserta = officialStudent.nomorPeserta || `U-24-${studentClass.replace('-', '')}-${String((i % 40) + 1).padStart(3, '0')}`;
    const sessionNum = sessionName.includes('Sesi 2') ? 2 : sessionName.includes('Sesi 3') ? 3 : 1;

    const targetFinalScore = scoreTargets[i % scoreTargets.length];
    totalScoreSum += targetFinalScore;
    if (targetFinalScore >= 75) passedCount++;

    if (targetFinalScore >= 90) scoreDistribution['90 - 100 (A)']++;
    else if (targetFinalScore >= 80) scoreDistribution['80 - 89 (B)']++;
    else if (targetFinalScore >= 70) scoreDistribution['70 - 79 (C)']++;
    else if (targetFinalScore >= 60) scoreDistribution['60 - 69 (D)']++;
    else scoreDistribution['< 60 (E)']++;

    // Realistic live ongoing exam statuses:
    // ~68% in_progress (actively taking the exam, questions partially answered, timer ticking)
    // ~23% submitted (finished early, all answers submitted)
    // ~6% not_started (logged in, waiting for token/instruction)
    // ~3% blocked (tab switch violation or noise violation, waiting for proctor unlock)
    let violations = 0;
    let status: 'submitted' | 'in_progress' | 'blocked' | 'not_started' = 'in_progress';
    let statusLogin: 'online' | 'offline' | 'ujian' | 'terkunci' = 'ujian';

    if (i % 35 === 34) {
      // Blocked / Locked
      violations = 3;
      status = 'blocked';
      statusLogin = 'terkunci';
    } else if (i % 18 === 17) {
      // Not yet started
      violations = 0;
      status = 'not_started';
      statusLogin = 'online';
    } else if (i % 4 === 0) {
      // Submitted early
      status = 'submitted';
      statusLogin = 'offline';
      if (i % 14 === 13) violations = 1;
    } else {
      // In progress (active right now)
      status = 'in_progress';
      statusLogin = 'ujian';
      if (i % 35 === 33) violations = 2;
      else if (i % 12 === 11) violations = 1;
    }

    const user: User = {
      ...officialStudent,
      statusLogin: statusLogin,
    };
    users.push(user);

    // Build Student Answers for the 10 questions
    const correctCount = Math.round(targetFinalScore / 10);
    const wrongCount = 10 - correctCount;

    const wrongQuestionIndices = new Set<number>();
    let seed = (i * 7 + 3);
    while (wrongQuestionIndices.size < wrongCount) {
      const qIdx = seed % 10;
      wrongQuestionIndices.add(qIdx);
      seed = (seed * 13 + 5);
    }

    const answers: Record<string, StudentAnswer> = {};
    const baseHour = sessionNum === 1 ? 7 : sessionNum === 2 ? 9 : 11;
    const baseMin = 32 + (i % 15);

    // Number of questions answered so far based on status
    const numAnswered =
      status === 'not_started'
        ? 0
        : status === 'blocked'
        ? 1 + (i % 2)
        : status === 'in_progress'
        ? Math.min(9, 4 + (i % 6))
        : 10;

    QUESTION_IDS.slice(0, numAnswered).forEach((qId, qIndex) => {
      const qConfig = EXAM_KEY[qId];
      const isCorrect = !wrongQuestionIndices.has(qIndex);
      let selectedOption = qConfig.correct;

      if (!isCorrect) {
        const wrongOpts = qConfig.options.filter(opt => opt !== qConfig.correct);
        selectedOption = wrongOpts[i % wrongOpts.length] || 'A';
      }

      const answerMin = Math.min(59, baseMin + (qIndex * 4) + (i % 3));
      const answerSec = (i * 17 + qIndex * 7) % 60;
      const savedAtStr = `${String(baseHour).padStart(2, '0')}:${String(answerMin).padStart(2, '0')}:${String(answerSec).padStart(2, '0')}`;

      answers[qId] = {
        questionId: qId,
        selectedOption: selectedOption,
        isDoubtful: i % 8 === 0 && qIndex % 3 === 0,
        savedAt: savedAtStr,
      };
    });

    const finishHour = sessionNum === 1 ? 8 : sessionNum === 2 ? 10 : 12;
    const finishMin = 25 + (i % 30);
    const finishSec = (i * 23) % 60;

    // Remaining seconds
    const remainingSeconds =
      status === 'submitted'
        ? 0
        : status === 'not_started'
        ? 5400
        : status === 'blocked'
        ? 3420
        : 2200 + ((i * 29) % 2600); // 36 - 80 menit tersisa

    // Decibel and incident noise detection
    const isRoomVII1 = studentClass === 'VII-1';
    const isRoomVIII2 = studentClass === 'VIII-2';
    const currentAudioLevel = isRoomVII1
      ? 48 + (i % 18) // VII-1 is noisy: 48 - 65 dB
      : isRoomVIII2
      ? 38 + (i % 14) // VIII-2 is moderate: 38 - 51 dB
      : 22 + (i % 12); // Other rooms quiet: 22 - 33 dB

    const audioViolationsCount =
      violations > 0
        ? violations
        : isRoomVII1 && i % 4 === 0
        ? 1
        : 0;

    const lastAudioIncidentAt =
      (violations > 0 || (isRoomVII1 && i % 4 === 0))
        ? `08:${String(10 + (i % 35)).padStart(2, '0')} (${isRoomVII1 ? '56 dB' : '48 dB'})`
        : undefined;

    let lastActiveText = 'Selesai Mengumpulkan';
    if (status === 'blocked') {
      lastActiveText = violations > 1 ? 'Terkunci (Terdeteksi Berbisik > 3x)' : 'Terkunci (Pindah Tab > 3x)';
    } else if (status === 'not_started') {
      lastActiveText = 'Belum Mulai (Menunggu Token)';
    } else if (status === 'in_progress') {
      if (isRoomVII1 && i % 4 === 0) {
        lastActiveText = 'Peringatan Suara/Bisik (56 dB)';
      } else {
        lastActiveText = `Aktif (Mengerjakan Soal No. ${numAnswered + 1})`;
      }
    }

    const session: ExamSession = {
      id: `ses-sim-${String(i + 1).padStart(4, '0')}`,
      examId: examId,
      studentId: studentId,
      studentName: fullName,
      studentNisn: nisn,
      studentClass: studentClass,
      studentRoom: labRoom,
      startedAt: status === 'not_started' ? '-' : `${String(baseHour).padStart(2, '0')}:30:00`,
      finishedAt: status === 'submitted' ? `${String(finishHour).padStart(2, '0')}:${String(finishMin).padStart(2, '0')}:${String(finishSec).padStart(2, '0')}` : undefined,
      remainingSeconds: remainingSeconds,
      status: status,
      answers: answers,
      score: status === 'submitted' ? targetFinalScore : undefined,
      correctCount: status === 'submitted' ? correctCount : 0,
      wrongCount: status === 'submitted' ? wrongCount : 0,
      violationsCount: violations,
      audioViolationsCount: audioViolationsCount,
      currentAudioLevel: currentAudioLevel,
      lastAudioIncidentAt: lastAudioIncidentAt,
      lastActive: lastActiveText,
    };

    sessions.push(session);
  }

  const total = TOTAL_STUDENTS || 1;
  const avgScore = Number((totalScoreSum / total).toFixed(1));
  const highestScore = 100;
  const lowestScore = 40;

  return {
    users,
    sessions,
    summary: {
      totalStudents: TOTAL_STUDENTS,
      passedCount,
      remedialCount: TOTAL_STUDENTS - passedCount,
      avgScore,
      highestScore,
      lowestScore,
      scoreDistribution,
    },
  };
}
