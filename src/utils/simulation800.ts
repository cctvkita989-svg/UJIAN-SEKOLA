import { User, ExamSession, StudentAnswer } from '../types/cbt';

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

  for (let i = 0; i < 800; i++) {
    const isMale = i % 2 === 0;
    const firstList = isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
    const firstName = firstList[i % firstList.length];
    const lastName = LAST_NAMES[(i * 3 + Math.floor(i / 7)) % LAST_NAMES.length];
    const middleName = (i % 5 === 0) ? LAST_NAMES[(i * 2 + 5) % LAST_NAMES.length] : '';
    const fullName = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;

    const studentId = `usr-sim-siswa-${String(i + 1).padStart(4, '0')}`;
    const nisn = `006819${String(1000 + i).slice(0, 4)}`;
    const studentClass = CLASSES[i % CLASSES.length];
    const labRoom = `Ruang Kelas ${studentClass}`;
    const religion = RELIGIONS[i % RELIGIONS.length];
    
    // Session 1, 2, or 3
    const sessionNum = (i % 3) + 1;
    const sessionName = `Sesi ${sessionNum} (${sessionNum === 1 ? '07.30 - 09.00' : sessionNum === 2 ? '09.30 - 11.00' : '11.30 - 13.00'})`;
    const noPeserta = `U-24-${studentClass.replace('-', '')}-${String((i % 35) + 1).padStart(3, '0')}`;

    const score = scoreTargets[i];
    totalScoreSum += score;
    if (score >= 75) passedCount++;

    if (score >= 90) scoreDistribution['90 - 100 (A)']++;
    else if (score >= 80) scoreDistribution['80 - 89 (B)']++;
    else if (score >= 70) scoreDistribution['70 - 79 (C)']++;
    else if (score >= 60) scoreDistribution['60 - 69 (D)']++;
    else scoreDistribution['< 60 (E)']++;

    // Violations simulation (realistic: ~90% zero, ~7% 1x, ~2% 2x, ~1% 3x/terkunci)
    let violations = 0;
    let status: 'submitted' | 'in_progress' | 'blocked' = 'submitted';
    let statusLogin: 'online' | 'offline' | 'ujian' | 'terkunci' = 'offline';

    if (i % 120 === 119) {
      violations = 3;
      status = 'blocked';
      statusLogin = 'terkunci';
    } else if (i % 45 === 44) {
      violations = 2;
    } else if (i % 14 === 13) {
      violations = 1;
    }

    // A few students still currently in progress (e.g. Sesi 3)
    if (sessionNum === 3 && i >= 780 && status !== 'blocked') {
      status = 'in_progress';
      statusLogin = 'ujian';
    }

    const user: User = {
      id: studentId,
      name: fullName,
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}`,
      role: 'siswa',
      password: 'siswa123',
      email: `${firstName.toLowerCase()}.${i + 1}@siswa.sch.id`,
      nisn: nisn,
      kelas: studentClass,
      jurusan: 'Reguler',
      agama: religion,
      ruangUjian: labRoom,
      nomorPeserta: noPeserta,
      sesiUjian: sessionName,
      statusLogin: statusLogin,
    };
    users.push(user);

    // Build Student Answers for the 10 questions to match exact target score
    // 10 questions = 10 pts each.
    // score 100 => 10 correct
    // score 90 => 9 correct, 1 wrong
    // score 80 => 8 correct, 2 wrong
    // score 70 => 7 correct, 3 wrong
    // score 60 => 6 correct, 4 wrong
    // score 50 => 5 correct, 5 wrong
    // score 40 => 4 correct, 6 wrong
    const correctCount = Math.round(score / 10);
    const wrongCount = 10 - correctCount;

    // Determine which questions this student gets wrong
    // distribute wrong indices so not all students miss the same question
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

    QUESTION_IDS.forEach((qId, qIndex) => {
      const qConfig = EXAM_KEY[qId];
      const isCorrect = !wrongQuestionIndices.has(qIndex);
      let selectedOption = qConfig.correct;

      if (!isCorrect) {
        // Pick an alternate wrong option
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

    const session: ExamSession = {
      id: `ses-sim-${String(i + 1).padStart(4, '0')}`,
      examId: examId,
      studentId: studentId,
      studentName: fullName,
      studentNisn: nisn,
      studentClass: studentClass,
      studentRoom: labRoom,
      startedAt: `${String(baseHour).padStart(2, '0')}:30:00`,
      finishedAt: status === 'submitted' ? `${String(finishHour).padStart(2, '0')}:${String(finishMin).padStart(2, '0')}:${String(finishSec).padStart(2, '0')}` : undefined,
      remainingSeconds: status === 'submitted' ? 0 : 1800,
      status: status,
      answers: answers,
      score: score,
      correctCount: correctCount,
      wrongCount: wrongCount,
      violationsCount: violations,
      audioViolationsCount: violations > 0 ? violations : (studentClass === 'VII-1' && i % 5 === 0 ? 1 : 0),
      currentAudioLevel: studentClass === 'VII-1' ? (48 + (i % 16)) : studentClass === 'VIII-2' ? (40 + (i % 12)) : (24 + (i % 10)),
      lastAudioIncidentAt: (violations > 0 || (studentClass === 'VII-1' && i % 5 === 0)) ? `${String(baseHour).padStart(2, '0')}:${String(baseMin + 7).padStart(2, '0')} (${studentClass === 'VII-1' ? 52 : 46} dB)` : undefined,
      lastActive: status === 'blocked' ? (violations > 1 ? 'Terkunci (Terdeteksi Berbisik)' : 'Terkunci (Pindah Tab > 3x)') : status === 'in_progress' ? (studentClass === 'VII-1' && i % 5 === 0 ? 'Peringatan Suara/Bisik' : 'Aktif (Mengerjakan)') : 'Selesai Mengumpulkan',
    };

    sessions.push(session);
  }

  const avgScore = Number((totalScoreSum / 800).toFixed(1));
  const highestScore = 100;
  const lowestScore = 40;

  return {
    users,
    sessions,
    summary: {
      totalStudents: 800,
      passedCount,
      remedialCount: 800 - passedCount,
      avgScore,
      highestScore,
      lowestScore,
      scoreDistribution,
    },
  };
}
