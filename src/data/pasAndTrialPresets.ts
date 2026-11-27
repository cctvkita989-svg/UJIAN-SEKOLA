import { Exam, Question } from '../types/cbt';
import { INITIAL_CLASSES } from './mockData';

const ALL_CLASSES_VII = INITIAL_CLASSES.filter(c => c.name.startsWith('VII-')).map(c => c.name);
const ALL_CLASSES_VIII = INITIAL_CLASSES.filter(c => c.name.startsWith('VIII-')).map(c => c.name);
const ALL_CLASSES_IX = INITIAL_CLASSES.filter(c => c.name.startsWith('IX-')).map(c => c.name);
const ALL_24_CLASSES = [...ALL_CLASSES_VII, ...ALL_CLASSES_VIII, ...ALL_CLASSES_IX];

interface PasScheduleBlueprint {
  code: string;
  dayLabel: string;
  startTime: string;
  endTime: string;
  subject: string;
  totalQuestions: number;
  teacherId: string;
  teacherName: string;
  requiredAgama?: 'Islam' | 'Kristen' | 'Katolik';
}

const PAS_BLUEPRINTS: PasScheduleBlueprint[] = [
  // Hari ke-1
  {
    code: 'h1-ipa',
    dayLabel: 'Hari ke-1',
    startTime: '07:30',
    endTime: '09:00',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    totalQuestions: 30,
    teacherId: 'usr-guru-3',
    teacherName: 'Ibu Rina Melati, S.Si',
  },
  {
    code: 'h1-ppkn',
    dayLabel: 'Hari ke-1',
    startTime: '09:30',
    endTime: '11:00',
    subject: 'Pendidikan Pancasila & Kewarganegaraan (PPKn)',
    totalQuestions: 40,
    teacherId: 'usr-guru-8',
    teacherName: 'Ibu Ratna Dewi, S.Pd',
  },
  // Hari ke-2
  {
    code: 'h2-mat',
    dayLabel: 'Hari ke-2',
    startTime: '07:30',
    endTime: '09:00',
    subject: 'Matematika',
    totalQuestions: 30,
    teacherId: 'usr-guru-1',
    teacherName: 'Ibu Sri Wahyuni, S.Pd',
  },
  {
    code: 'h2-ips',
    dayLabel: 'Hari ke-2',
    startTime: '09:30',
    endTime: '11:00',
    subject: 'Ilmu Pengetahuan Sosial (IPS)',
    totalQuestions: 40,
    teacherId: 'usr-guru-7',
    teacherName: 'Ibu Dewi Astuti, M.Pd',
  },
  // Hari ke-3
  {
    code: 'h3-bin',
    dayLabel: 'Hari ke-3',
    startTime: '07:30',
    endTime: '09:00',
    subject: 'Bahasa Indonesia',
    totalQuestions: 40,
    teacherId: 'usr-guru-2',
    teacherName: 'Bpk. Hendra Saputra, M.Pd',
  },
  {
    code: 'h3-sbk',
    dayLabel: 'Hari ke-3',
    startTime: '09:30',
    endTime: '11:00',
    subject: 'Seni Budaya',
    totalQuestions: 40,
    teacherId: 'usr-guru-2',
    teacherName: 'Ibu Maya Safitri, S.Pd',
  },
  // Hari ke-4
  {
    code: 'h4-big',
    dayLabel: 'Hari ke-4',
    startTime: '07:30',
    endTime: '09:00',
    subject: 'Bahasa Inggris',
    totalQuestions: 40,
    teacherId: 'usr-guru-6',
    teacherName: 'Bpk. Danang Prasetyo, M.Hum',
  },
  {
    code: 'h4-pjok',
    dayLabel: 'Hari ke-4',
    startTime: '09:30',
    endTime: '11:00',
    subject: 'PJOK (Pendidikan Jasmani & Olahraga)',
    totalQuestions: 40,
    teacherId: 'usr-guru-6',
    teacherName: 'Bpk. Arif Rahman, S.Pd',
  },
  // Hari ke-5 (Agama hanya Islam, Kristen, Katolik + TIK/Informatika)
  {
    code: 'h5-pai',
    dayLabel: 'Hari ke-5',
    startTime: '07:30',
    endTime: '09:00',
    subject: 'Pendidikan Agama Islam & Budi Pekerti',
    totalQuestions: 40,
    teacherId: 'usr-guru-9',
    teacherName: 'Bpk. Ahmad Dahlan, S.Ag',
    requiredAgama: 'Islam',
  },
  {
    code: 'h5-pak',
    dayLabel: 'Hari ke-5',
    startTime: '07:30',
    endTime: '09:00',
    subject: 'Pendidikan Agama Kristen Protestan & Budi Pekerti',
    totalQuestions: 40,
    teacherId: 'usr-guru-10',
    teacherName: 'Pdt. Johanes Simanjuntak, M.Th',
    requiredAgama: 'Kristen',
  },
  {
    code: 'h5-pkt',
    dayLabel: 'Hari ke-5',
    startTime: '07:30',
    endTime: '09:00',
    subject: 'Pendidikan Agama Katolik & Budi Pekerti',
    totalQuestions: 40,
    teacherId: 'usr-admin-1',
    teacherName: 'Frater Antonius Maryadi, S.Ag',
    requiredAgama: 'Katolik',
  },
  {
    code: 'h5-tik',
    dayLabel: 'Hari ke-5',
    startTime: '09:30',
    endTime: '11:00',
    subject: 'Informatika',
    totalQuestions: 40,
    teacherId: 'usr-admin-1',
    teacherName: 'Bpk. Suryadi, M.Kom',
  },
];

const GRADE_TIERS: Array<{ key: 'vii' | 'viii' | 'ix'; label: string; classes: string[]; tokenSuffix: string }> = [
  { key: 'vii', label: 'Kelas VII (VII-1 s/d VII-8)', classes: ALL_CLASSES_VII, tokenSuffix: '7' },
  { key: 'viii', label: 'Kelas VIII (VIII-1 s/d VIII-8)', classes: ALL_CLASSES_VIII, tokenSuffix: '8' },
  { key: 'ix', label: 'Kelas IX (IX-1 s/d IX-8)', classes: ALL_CLASSES_IX, tokenSuffix: '9' },
];

export function buildPasDraftExams(): Exam[] {
  const drafts: Exam[] = [];

  for (const tier of GRADE_TIERS) {
    for (let idx = 0; idx < PAS_BLUEPRINTS.length; idx++) {
      const bp = PAS_BLUEPRINTS[idx];
      const id = `pas-draft-${bp.code}-${tier.key}`;
      const shortSubject =
        bp.subject === 'Ilmu Pengetahuan Alam (IPA)'
          ? 'IPA'
          : bp.subject === 'Ilmu Pengetahuan Sosial (IPS)'
          ? 'IPS'
          : bp.subject === 'Pendidikan Pancasila & Kewarganegaraan (PPKn)'
          ? 'PPKn'
          : bp.subject === 'PJOK (Pendidikan Jasmani & Olahraga)'
          ? 'PJOK'
          : bp.subject === 'Informatika'
          ? 'TIK / Informatika'
          : bp.subject;

      const tokenPrefix = bp.code.split('-')[1].toUpperCase().slice(0, 3);
      const token = `PAS${tokenPrefix}${tier.tokenSuffix}`.slice(0, 8);

      const exam: Exam = {
        id,
        title: `PAS - ${shortSubject} (${tier.key.toUpperCase()}-1 s/d ${tier.key.toUpperCase()}-8)`,
        subject: bp.subject,
        gradeLevel: tier.label,
        targetClasses: tier.classes,
        durationMinutes: 90,
        totalQuestions: bp.code === 'h1-ipa' && tier.key === 'viii' ? 20 : bp.totalQuestions,
        token,
        isTokenActive: false,
        dayLabel: bp.dayLabel,
        startTime: bp.startTime,
        endTime: bp.endTime,
        status: 'draft',
        createdByTeacherId: bp.teacherId,
        teacherName: bp.teacherName,
        subjectTeachers: [bp.teacherName],
        guruPengawas: 'Pengawas Ruang Terjadwal',
        kkm: 75,
        randomizeQuestions: true,
        randomizeOptions: true,
        showScoreImmediate: false,
        publishAnswers: false,
        maxViolationsAllowed: 3,
        examCategory: 'PAS',
      };

      if (bp.requiredAgama) {
        exam.requiredAgama = bp.requiredAgama;
      }

      drafts.push(exam);
    }
  }

  return drafts;
}

function makePg(
  examId: string,
  number: number,
  questionText: string,
  options: [string, string, string, string],
  correctAnswer: 'A' | 'B' | 'C' | 'D',
  explanation: string,
  points = 10,
  imageUrl?: string
): Question {
  return {
    id: `${examId}-q${number}`,
    examId,
    number,
    type: 'pg',
    questionText,
    ...(imageUrl ? { imageUrl } : {}),
    options: [
      { id: 'A', text: options[0] },
      { id: 'B', text: options[1] },
      { id: 'C', text: options[2] },
      { id: 'D', text: options[3] },
    ],
    correctAnswer,
    explanation,
    points,
  };
}

export function buildTrialExamsAndQuestions(): {
  exams: Exam[];
  questionsMap: Record<string, Question[]>;
} {
  const exams: Exam[] = [
    {
      id: 'trial-mat-all',
      title: 'Uji Coba CBT - Matematika (Semua Rombel VII-IX)',
      subject: 'Matematika',
      gradeLevel: 'Semua Rombel (VII-1 s/d IX-8)',
      targetClasses: ALL_24_CLASSES,
      durationMinutes: 30,
      totalQuestions: 10,
      token: 'SMPN1PANDAN',
      isTokenActive: true,
      dayLabel: 'Uji Coba (Jadwal Fleksibel)',
      startTime: '06:00',
      endTime: '23:00',
      status: 'ongoing',
      createdByTeacherId: 'usr-guru-1',
      teacherName: 'Ibu Sri Wahyuni, S.Pd',
      subjectTeachers: ['Ibu Sri Wahyuni, S.Pd'],
      guruPengawas: 'Tim Proktor Sekolah',
      kkm: 75,
      randomizeQuestions: true,
      randomizeOptions: true,
      showScoreImmediate: false,
      publishAnswers: false,
      maxViolationsAllowed: 3,
    },
    {
      id: 'trial-ipa-all',
      title: 'Uji Coba CBT - IPA (Semua Rombel VII-IX)',
      subject: 'Ilmu Pengetahuan Alam (IPA)',
      gradeLevel: 'Semua Rombel (VII-1 s/d IX-8)',
      targetClasses: ALL_24_CLASSES,
      durationMinutes: 30,
      totalQuestions: 10,
      token: 'SMPN1PANDAN',
      isTokenActive: true,
      dayLabel: 'Uji Coba (Jadwal Fleksibel)',
      startTime: '06:00',
      endTime: '23:00',
      status: 'ongoing',
      createdByTeacherId: 'usr-guru-3',
      teacherName: 'Ibu Rina Melati, S.Si',
      subjectTeachers: ['Ibu Rina Melati, S.Si'],
      guruPengawas: 'Tim Proktor Sekolah',
      kkm: 75,
      randomizeQuestions: true,
      randomizeOptions: true,
      showScoreImmediate: false,
      publishAnswers: false,
      maxViolationsAllowed: 3,
    },
    {
      id: 'trial-pkn-all',
      title: 'Uji Coba CBT - PPKn (Semua Rombel VII-IX)',
      subject: 'Pendidikan Pancasila & Kewarganegaraan (PPKn)',
      gradeLevel: 'Semua Rombel (VII-1 s/d IX-8)',
      targetClasses: ALL_24_CLASSES,
      durationMinutes: 30,
      totalQuestions: 10,
      token: 'SMPN1PANDAN',
      isTokenActive: true,
      dayLabel: 'Uji Coba (Jadwal Fleksibel)',
      startTime: '06:00',
      endTime: '23:00',
      status: 'ongoing',
      createdByTeacherId: 'usr-guru-8',
      teacherName: 'Ibu Ratna Dewi, S.Pd',
      subjectTeachers: ['Ibu Ratna Dewi, S.Pd'],
      guruPengawas: 'Tim Proktor Sekolah',
      kkm: 75,
      randomizeQuestions: true,
      randomizeOptions: true,
      showScoreImmediate: false,
      publishAnswers: false,
      maxViolationsAllowed: 3,
    },
    {
      id: 'trial-pai-all',
      title: 'Uji Coba CBT - Pendidikan Agama Islam (Semua Rombel VII-IX)',
      subject: 'Pendidikan Agama Islam & Budi Pekerti',
      gradeLevel: 'Semua Rombel (VII-1 s/d IX-8)',
      targetClasses: ALL_24_CLASSES,
      requiredAgama: 'Islam',
      durationMinutes: 30,
      totalQuestions: 10,
      token: 'SMPN1PANDAN',
      isTokenActive: true,
      dayLabel: 'Uji Coba (Jadwal Fleksibel)',
      startTime: '06:00',
      endTime: '23:00',
      status: 'ongoing',
      createdByTeacherId: 'usr-guru-9',
      teacherName: 'Bpk. Ahmad Dahlan, S.Ag',
      subjectTeachers: ['Bpk. Ahmad Dahlan, S.Ag'],
      guruPengawas: 'Tim Proktor Sekolah',
      kkm: 75,
      randomizeQuestions: true,
      randomizeOptions: true,
      showScoreImmediate: false,
      publishAnswers: false,
      maxViolationsAllowed: 3,
    },
    {
      id: 'trial-pak-all',
      title: 'Uji Coba CBT - Pendidikan Agama Kristen (Semua Rombel VII-IX)',
      subject: 'Pendidikan Agama Kristen Protestan & Budi Pekerti',
      gradeLevel: 'Semua Rombel (VII-1 s/d IX-8)',
      targetClasses: ALL_24_CLASSES,
      requiredAgama: 'Kristen',
      durationMinutes: 30,
      totalQuestions: 10,
      token: 'SMPN1PANDAN',
      isTokenActive: true,
      dayLabel: 'Uji Coba (Jadwal Fleksibel)',
      startTime: '06:00',
      endTime: '23:00',
      status: 'ongoing',
      createdByTeacherId: 'usr-guru-10',
      teacherName: 'Pdt. Johanes Simanjuntak, M.Th',
      subjectTeachers: ['Pdt. Johanes Simanjuntak, M.Th'],
      guruPengawas: 'Tim Proktor Sekolah',
      kkm: 75,
      randomizeQuestions: true,
      randomizeOptions: true,
      showScoreImmediate: false,
      publishAnswers: false,
      maxViolationsAllowed: 3,
    },
    {
      id: 'trial-pkt-all',
      title: 'Uji Coba CBT - Pendidikan Agama Katolik (Semua Rombel VII-IX)',
      subject: 'Pendidikan Agama Katolik & Budi Pekerti',
      gradeLevel: 'Semua Rombel (VII-1 s/d IX-8)',
      targetClasses: ALL_24_CLASSES,
      requiredAgama: 'Katolik',
      durationMinutes: 30,
      totalQuestions: 10,
      token: 'SMPN1PANDAN',
      isTokenActive: true,
      dayLabel: 'Uji Coba (Jadwal Fleksibel)',
      startTime: '06:00',
      endTime: '23:00',
      status: 'ongoing',
      createdByTeacherId: 'usr-admin-1',
      teacherName: 'Frater Antonius Maryadi, S.Ag',
      subjectTeachers: ['Frater Antonius Maryadi, S.Ag'],
      guruPengawas: 'Tim Proktor Sekolah',
      kkm: 75,
      randomizeQuestions: true,
      randomizeOptions: true,
      showScoreImmediate: false,
      publishAnswers: false,
      maxViolationsAllowed: 3,
    },
  ];

  const questionsMap: Record<string, Question[]> = {
    'trial-mat-all': [
      makePg('trial-mat-all', 1, 'Hasil dari (-12) + 25 - (-8) adalah...', ['5', '13', '21', '45'], 'C', '-12 + 25 = 13, lalu 13 + 8 = 21.'),
      makePg('trial-mat-all', 2, 'Bentuk paling sederhana dari perbandingan 36 : 48 adalah...', ['2 : 3', '3 : 4', '4 : 5', '6 : 8'], 'B', 'Keduanya dibagi FPB = 12, menghasilkan 3 : 4.'),
      makePg('trial-mat-all', 3, 'Jika 4x - 7 = 17, maka nilai x adalah...', ['4', '5', '6', '8'], 'C', '4x = 24, sehingga x = 6.'),
      makePg('trial-mat-all', 4, 'Luas persegi panjang dengan panjang 14 cm dan lebar 9 cm adalah...', ['46 cm²', '63 cm²', '126 cm²', '140 cm²'], 'C', 'Luas = p × l = 14 × 9 = 126 cm².'),
      makePg('trial-mat-all', 5, 'Harga 5 buah buku tulis adalah Rp 22.500,00. Harga 8 buah buku tulis yang sama adalah...', ['Rp 32.000,00', 'Rp 36.000,00', 'Rp 38.500,00', 'Rp 40.000,00'], 'B', 'Harga 1 buku = Rp 4.500, maka 8 buku = Rp 36.000,00.'),
      makePg('trial-mat-all', 6, 'Besar sudut berpelurus dari sudut 65° adalah...', ['25°', '35°', '115°', '125°'], 'C', '180° - 65° = 115°.'),
      makePg('trial-mat-all', 7, 'Keliling lingkaran yang memiliki diameter 14 cm (π = 22/7) adalah...', ['22 cm', '44 cm', '88 cm', '154 cm'], 'B', 'K = π × d = (22/7) × 14 = 44 cm.'),
      makePg('trial-mat-all', 8, 'Hasil dari 3² + 4² - 5⁰ adalah...', ['20', '24', '25', '26'], 'B', '9 + 16 - 1 = 24.'),
      makePg('trial-mat-all', 9, 'Sebuah segitiga siku-siku memiliki panjang sisi siku-siku 6 cm dan 8 cm. Panjang sisi miringnya adalah...', ['10 cm', '12 cm', '14 cm', '15 cm'], 'A', '√(6² + 8²) = √(36 + 64) = √100 = 10 cm.'),
      makePg('trial-mat-all', 10, 'Rata-rata dari data nilai: 70, 80, 85, 75, 90 adalah...', ['78', '80', '82', '84'], 'B', 'Jumlah = 400, dibagi 5 data = 80.'),
    ],
    'trial-ipa-all': [
      makePg('trial-ipa-all', 1, 'Satuan Internasional (SI) untuk besaran pokok panjang dan massa berturut-turut adalah...', ['Sentimeter dan gram', 'Meter dan kilogram', 'Kilometer dan ton', 'Meter dan newton'], 'B', 'Dalam SI, satuan panjang adalah meter (m) dan massa adalah kilogram (kg).'),
      makePg('trial-ipa-all', 2, 'Perubahan wujud zat dari padat langsung menjadi gas disebut...', ['Mencair', 'Menguap', 'Menyublim', 'Mengkristal'], 'C', 'Padat menjadi gas disebut menyublim, misalnya kapur barus.'),
      makePg('trial-ipa-all', 3, 'Organel sel tumbuhan yang berfungsi sebagai tempat berlangsungnya fotosintesis adalah...', ['Mitokondria', 'Kloroplas', 'Ribosom', 'Lisosom'], 'B', 'Kloroplas mengandung klorofil untuk fotosintesis.'),
      makePg('trial-ipa-all', 4, 'Gaya tarik bumi yang menyebabkan benda selalu jatuh ke bawah disebut...', ['Gaya gesek', 'Gaya pegas', 'Gaya gravitasi', 'Gaya magnet'], 'C', 'Gaya gravitasi menarik benda menuju pusat bumi.'),
      makePg('trial-ipa-all', 5, 'Sebuah benda bermassa 4 kg didorong dengan percepatan 3 m/s². Besar gaya yang bekerja adalah...', ['7 N', '12 N', '1,33 N', '24 N'], 'B', 'Hukum II Newton: F = m × a = 4 × 3 = 12 N.'),
      makePg('trial-ipa-all', 6, 'Bagian darah yang berfungsi mengikat dan mengedarkan oksigen ke seluruh tubuh adalah...', ['Sel darah putih (leukosit)', 'Sel darah merah (eritrosit)', 'Keping darah (trombosit)', 'Plasma darah'], 'B', 'Eritrosit mengandung hemoglobin yang mengikat oksigen.'),
      makePg('trial-ipa-all', 7, 'Contoh pesawat sederhana jenis bidang miring dalam kehidupan sehari-hari adalah...', ['Gunting dan tang', 'Sekrup dan tangga', 'Katrol timba air', 'Jungkat-jungkit'], 'B', 'Tangga dan sekrup bekerja berdasarkan prinsip bidang miring.'),
      makePg('trial-ipa-all', 8, 'Lapisan atmosfer bumi yang mengandung ozon untuk melindungi bumi dari sinar ultraviolet adalah...', ['Troposfer', 'Stratosfer', 'Mesosfer', 'Termosfer'], 'B', 'Lapisan ozon berada di stratosfer.'),
      makePg('trial-ipa-all', 9, 'Alat optik yang digunakan untuk melihat benda-benda berukuran sangat kecil (mikroorganisme) adalah...', ['Teleskop', 'Periskop', 'Mikroskop', 'Lup'], 'C', 'Mikroskop berfungsi mengamati objek mikroskopis.'),
      makePg('trial-ipa-all', 10, 'Hubungan antara kerbau dan burung jalak yang saling menguntungkan disebut simbiosis...', ['Parasitisme', 'Komensalisme', 'Mutualisme', 'Netralisme'], 'C', 'Simbiosis mutualisme adalah hubungan saling menguntungkan dua makhluk hidup.'),
    ],
    'trial-pkn-all': [
      makePg('trial-pkn-all', 1, 'Dasar negara Republik Indonesia yang tercantum dalam Pembukaan UUD 1945 alinea ke-4 adalah...', ['Bhinneka Tunggal Ika', 'Pancasila', 'Sumpah Pemuda', 'Proklamasi Kemerdekaan'], 'B', 'Pancasila adalah dasar negara Republik Indonesia.'),
      makePg('trial-pkn-all', 2, 'Lambang sila keempat Pancasila yang berbunyi Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan adalah...', ['Bintang', 'Rantai emas', 'Pohon beringin', 'Kepala banteng'], 'D', 'Kepala banteng melambangkan sila ke-4 Pancasila.'),
      makePg('trial-pkn-all', 3, 'Lembaga negara yang bertugas menyiapkan rancangan dasar negara sebelum kemerdekaan RI adalah...', ['BPUPKI', 'KNIP', 'MPR', 'DPR'], 'A', 'BPUPKI dibentuk untuk mempersiapkan kemerdekaan dan dasar negara Indonesia.'),
      makePg('trial-pkn-all', 4, 'Norma yang bersumber dari hati nurani manusia dan mengatur tentang baik dan buruknya perbuatan disebut norma...', ['Hukum', 'Kesopanan', 'Kesusilaan', 'Adat'], 'C', 'Norma kesusilaan bersumber dari bisikan hati nurani manusia.'),
      makePg('trial-pkn-all', 5, 'Semboyan Bhinneka Tunggal Ika yang berarti berbeda-beda tetapi tetap satu jua berasal dari kitab...', ['Negarakertagama', 'Sutasoma', 'Pararaton', 'Arjunawiwaha'], 'B', 'Tertulis dalam Kitab Sutasoma karya Mpu Tantular.'),
      makePg('trial-pkn-all', 6, 'Salah satu contoh perilaku mengamalkan sila ke-2 Pancasila di lingkungan sekolah adalah...', ['Menghargai teman yang sedang beribadah', 'Menjenguk teman yang sakit tanpa membeda-bedakan', 'Melaksanakan piket kelas hanya jika dilihat guru', 'Memaksakan pendapat pribadi saat musyawarah'], 'B', 'Menjenguk dan menolong sesama mencerminkan nilai kemanusiaan yang adil dan beradab.'),
      makePg('trial-pkn-all', 7, 'Hari lahirnya Sumpah Pemuda yang mempersatukan pemuda Indonesia diperingati setiap tanggal...', ['1 Juni', '17 Agustus', '28 Oktober', '10 November'], 'C', 'Sumpah Pemuda diikrarkan pada 28 Oktober 1928.'),
      makePg('trial-pkn-all', 8, 'Bentuk negara Indonesia menurut Pasal 1 Ayat (1) UUD NRI Tahun 1945 adalah...', ['Negara Serikat', 'Negara Kesatuan yang berbentuk Republik', 'Negara Monarki Konstitusional', 'Negara Persemakmuran'], 'B', 'Pasal 1 Ayat (1) menyatakan Indonesia adalah Negara Kesatuan yang berbentuk Republik.'),
      makePg('trial-pkn-all', 9, 'Cara penyelesaian masalah bersama di kelas seperti pemilihan ketua kelas sebaiknya dilakukan melalui...', ['Pemaksaan kehendak', 'Musyawarah untuk mufakat', 'Pertengkaran antar kelompok', 'Penunjukan sepihak tanpa alasan'], 'B', 'Musyawarah mufakat adalah ciri khas demokrasi Pancasila.'),
      makePg('trial-pkn-all', 10, 'Sebagai pelajar, wujud cinta tanah air yang paling tepat di era digital adalah...', ['Menyebarkan berita hoaks di media sosial', 'Belajar tekun dan menggunakan internet secara positif dan santun', 'Menghindari semua teman dari daerah berbeda', 'Mengabaikan tata tertib sekolah'], 'B', 'Pelajar mencintai tanah air dengan belajar giat dan beretika di ruang digital.'),
    ],
    'trial-pai-all': [
      makePg('trial-pai-all', 1, 'Kitab suci yang diturunkan Allah SWT kepada Nabi Muhammad SAW sebagai pedoman hidup umat Islam adalah...', ['Taurat', 'Zabur', 'Injil', 'Al-Qur\'an'], 'D', 'Al-Qur\'an adalah kitab suci yang diwahyukan kepada Nabi Muhammad SAW.'),
      makePg('trial-pai-all', 2, 'Rukun Islam yang pertama adalah...', ['Mendirikan shalat', 'Mengucapkan dua kalimat syahadat', 'Menunaikan zakat', 'Berpuasa di bulan Ramadan'], 'B', 'Rukun Islam diawali dengan membaca dua kalimat syahadat.'),
      makePg('trial-pai-all', 3, 'Asmaul Husna "Al-\'Alim" memiliki arti bahwa Allah SWT Maha...', ['Mendengar', 'Melihat', 'Mengetahui', 'Bijaksana'], 'C', 'Al-\'Alim berarti Allah Maha Mengetahui segala sesuatu.'),
      makePg('trial-pai-all', 4, 'Perilaku jujur dalam ucapan dan perbuatan dalam Islam dikenal dengan sifat terpuji...', ['Amanah', 'Siddiq', 'Fathanah', 'Tabligh'], 'B', 'Siddiq berarti benar atau jujur.'),
      makePg('trial-pai-all', 5, 'Membersihkan diri dari hadas kecil sebelum melaksanakan shalat dilakukan dengan cara...', ['Tayammum jika ada air', 'Berwudhu', 'Mandi besar', 'Istinja saja'], 'B', 'Wudhu dilakukan untuk menyucikan diri dari hadas kecil.'),
      makePg('trial-pai-all', 6, 'Berbakti, menghormati, dan mendoakan kedua orang tua disebut juga dengan istilah...', ['Birrul walidain', 'Silaturahmi', 'Qanaah', 'Tawakal'], 'A', 'Birrul walidain berarti berbuat baik dan berbakti kepada kedua orang tua.'),
      makePg('trial-pai-all', 7, 'Jumlah rakaat shalat fardhu sehari semalam bagi umat Islam adalah...', ['15 rakaat', '17 rakaat', '19 rakaat', '21 rakaat'], 'B', 'Subuh 2 + Dzuhur 4 + Ashar 4 + Maghrib 3 + Isya 4 = 17 rakaat.'),
      makePg('trial-pai-all', 8, 'Sikap berserah diri kepada Allah SWT setelah berusaha dan berdoa secara maksimal disebut...', ['Takabur', 'Tawakal', 'Riya', 'Hasad'], 'B', 'Tawakal adalah berserah diri kepada Allah setelah ikhtiar maksimal.'),
      makePg('trial-pai-all', 9, 'Nabi yang terkenal dengan ketabahan luar biasa saat diuji penyakit kulit dan kehilangan harta benda adalah Nabi...', ['Nabi Ayyub a.s.', 'Nabi Yunus a.s.', 'Nabi Musa a.s.', 'Nabi Sulaiman a.s.'], 'A', 'Nabi Ayyub a.s. menjadi teladan kesabaran dalam menghadapi ujian.'),
      makePg('trial-pai-all', 10, 'Ketika teman yang berbeda keyakinan sedang menjalankan ibadahnya, sikap yang sesuai dengan ajaran Islam adalah...', ['Mengganggunya', 'Menghormati dan menjaga ketenangan', 'Memaksanya ikut acara kita', 'Mengejeknya'], 'B', 'Islam mengajarkan toleransi (tasamuh) dalam kehidupan bermasyarakat.'),
    ],
    'trial-pak-all': [
      makePg('trial-pak-all', 1, 'Kitab suci agama Kristen terdiri dari dua bagian utama, yaitu...', ['Perjanjian Lama dan Perjanjian Baru', 'Taurat dan Mazmur saja', 'Injil dan Kisah Para Rasul saja', 'Wahyu dan Surat Kiriman'], 'A', 'Alkitab terdiri atas Perjanjian Lama dan Perjanjian Baru.'),
      makePg('trial-pak-all', 2, 'Hukum yang terutama dan pertama yang diajarkan Tuhan Yesus adalah mengasihi Allah dengan segenap hati dan...', ['Membenci orang yang bersalah', 'Mengasihi sesama manusia seperti diri sendiri', 'Menghindari semua pergaulan', 'Mencari pujian dari sesama'], 'B', 'Hukum Kasih mencakup mengasihi Tuhan dan mengasihi sesama manusia (Matius 22:37-39).'),
      makePg('trial-pak-all', 3, 'Doa yang diajarkan langsung oleh Tuhan Yesus kepada murid-murid-Nya dikenal sebagai...', ['Doa Syukur', 'Doa Bapa Kami', 'Doa Penyerahan', 'Doa Pengakuan'], 'B', 'Doa Bapa Kami terdapat dalam Matius 6:9-13.'),
      makePg('trial-pak-all', 4, 'Buah Roh menurut Galatia 5:22-23 antara lain adalah...', ['Iri hati dan perselisihan', 'Kasih, sukacita, damai sejahtera, dan kesabaran', 'Kemarahan dan keegoisan', 'Kesombongan dan kebencian'], 'B', 'Kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan, kelemahlembutan, penguasaan diri.'),
      makePg('trial-pak-all', 5, 'Hari Raya Paskah dalam iman Kristen diperingati untuk mengenang...', ['Kelahiran Yesus di Betlehem', 'Kebangkitan Yesus Kristus dari kematian', 'Turunnya Roh Kudus', 'Pembaptisan di Sungai Yordan'], 'B', 'Paskah adalah perayaan kebangkitan Tuhan Yesus Kristus.'),
      makePg('trial-pak-all', 6, 'Jika seorang teman melakukan kesalahan kepada kita di sekolah, sikap Kristen yang benar adalah...', ['Membalas perbuatannya', 'Memaafkan dan mengampuni dengan tulus', 'Menjauhinya selamanya', 'Membicarakannya di belakang'], 'B', 'Tuhan Yesus mengajarkan untuk saling mengampuni.'),
      makePg('trial-pak-all', 7, 'Dalam perumpamaan "Orang Samaria yang Murah Hati", sesama manusia yang harus kita tolong adalah...', ['Hanya keluarga dekat', 'Hanya teman satu kelas', 'Setiap orang yang membutuhkan pertolongan tanpa memandang perbedaan', 'Orang yang selalu membalas jasa kita'], 'C', 'Kasih kepada sesama tidak mengenal batas suku, agama, atau latar belakang.'),
      makePg('trial-pak-all', 8, 'Sepuluh Hukum Tuhan (Dasa Titah) diberikan Allah melalui Nabi...', ['Musa', 'Daud', 'Elia', 'Yosua'], 'A', 'Allah memberikan Sepuluh Firman kepada Musa di Gunung Sinai.'),
      makePg('trial-pak-all', 9, 'Sikap rendah hati di lingkungan sekolah dapat diwujudkan dengan cara...', ['Merasa paling pintar di kelas', 'Mau mendengar nasihat guru dan menghargai pendapat teman', 'Menolak kerja kelompok', 'Meremehkan teman yang kesulitan'], 'B', 'Kerendahan hati tampak dari kesediaan menghargai orang lain dan mendengar nasihat.'),
      makePg('trial-pak-all', 10, 'Hari Raya Pentakosta memperingati peristiwa...', ['Kenaikan Yesus ke Surga', 'Turunnya Roh Kudus atas para rasul', 'Perjamuan Malam Terakhir', 'Kelahiran Yohanes Pembaptis'], 'B', 'Pentakosta adalah hari pencurahan Roh Kudus.'),
    ],
    'trial-pkt-all': [
      makePg('trial-pkt-all', 1, 'Tanda salib dalam doa umat Katolik diucapkan dengan menyebut nama...', ['Bapa dan Putra dan Roh Kudus', 'Para Malaikat Kudus', 'Para Nabi Perjanjian Lama', 'Santo dan Santa'], 'A', 'Tanda salib: Dalam nama Bapa dan Putra dan Roh Kudus.'),
      makePg('trial-pkt-all', 2, 'Sakramen yang pertama kali diterima seseorang untuk menjadi anggota Gereja Katolik adalah...', ['Sakramen Krisma', 'Sakramen Baptis', 'Sakramen Imamat', 'Sakramen Perkawinan'], 'B', 'Sakramen Baptis merupakan pintu masuk kehidupan Kristen dalam Gereja Katolik.'),
      makePg('trial-pkt-all', 3, 'Perayaan utama umat Katolik untuk mengenang Perjamuan Malam Terakhir dan kurban Kristus adalah...', ['Perayaan Ekaristi (Misa Kudus)', 'Doa Novena saja', 'Jalan Salib saja', 'Pemberkatan Rumah'], 'A', 'Ekaristi adalah sumber dan puncak seluruh hidup Kristiani.'),
      makePg('trial-pkt-all', 4, 'Lima Perintah Gereja yang pertama mengajak umat Katolik untuk...', ['Bekerja tanpa henti', 'Merayakan hari raya yang disamakan dengan hari Minggu dan mengikuti Misa', 'Menghindari kegiatan sosial', 'Berpuasa sepanjang tahun'], 'B', 'Umat Katolik diajak merayakan hari Minggu dan hari raya wajib dengan mengikuti Ekaristi.'),
      makePg('trial-pkt-all', 5, 'Sakramen pengampunan dosa dan pendamaian kembali dengan Allah dan sesama disebut Sakramen...', ['Ekaristi', 'Tobat (Rekonsiliasi)', 'Krisma', 'Pengurapan Orang Sakit'], 'B', 'Sakramen Tobat memberikan pengampunan dosa dari Allah melalui Gereja.'),
      makePg('trial-pkt-all', 6, 'Tokoh Bunda Yesus Kristus yang sangat dihormati dalam tradisi Gereja Katolik sebagai teladan iman adalah...', ['Marta', 'Maria', 'Elisabet', 'Magdalena'], 'B', 'Bunda Maria menjadi teladan ketaatan dan iman kepada Allah.'),
      makePg('trial-pkt-all', 7, 'Masa persiapan selama 40 hari sebelum perayaan Paskah bagi umat Katolik disebut masa...', ['Adven', 'Prapaskah', 'Pentakosta', 'Natal'], 'B', 'Masa Prapaskah berlangsung 40 hari untuk bertobat, berdoa, dan berderma sebelum Paskah.'),
      makePg('trial-pkt-all', 8, 'Ajaran Yesus tentang delapan sabda yang membawa sukacita rohani disebut...', ['Sabda Bahagia', 'Kitab Pengkhotbah', 'Mazmur Daud', 'Amsal Salomo'], 'A', 'Sabda Bahagia disampaikan Yesus dalam Khotbah di Bukit (Matius 5).'),
      makePg('trial-pkt-all', 9, 'Wujud kepedulian sosial pelajar Katolik di sekolah terhadap teman yang terkena musibah adalah...', ['Acuh tak acuh', 'Menggalang bantuan dan mendoakannya dengan tulus', 'Menyalahkan keadaannya', 'Menghindari pertemuan'], 'B', 'Iman Katolik diwujudkan lewat tindakan kasih nyata bagi sesama.'),
      makePg('trial-pkt-all', 10, 'Pemimpin tertinggi Gereja Katolik sedunia yang berkedudukan di Vatikan disebut...', ['Uskup Agung', 'Paus', 'Diakon', 'Katekis'], 'B', 'Paus adalah pemimpin Gereja Katolik sedunia dan Uskup Roma.'),
    ],
  };

  return { exams, questionsMap };
}

export function buildPasQuestionsMap(): Record<string, Question[]> {
  const ppknViiId = 'pas-draft-h1-ppkn-vii';
  const ipaViiiId = 'pas-draft-h1-ipa-viii';
  const ipaIxId = 'pas-draft-h1-ipa-ix';
  const pjokViiId = 'pas-draft-h4-pjok-vii';
  const pjokIxId = 'pas-draft-h4-pjok-ix';
  const pktViiId = 'pas-draft-h5-pkt-vii';
  const pktViiiId = 'pas-draft-h5-pkt-viii';
  const pktIxId = 'pas-draft-h5-pkt-ix';
  const P = 2.5; // 40 soal x 2.5 = 100
  const P8 = 5; // 20 soal x 5 = 100
  const P9 = 10; // 30 soal x 10 = 300 (dinormalisasi ke skala 100)

  return {
    [ppknViiId]: [
      makePg(
        ppknViiId,
        1,
        'Hari lahir Pancasila diperingati setiap tanggal...',
        ['1 Mei', '1 Juni', '17 Agustus', '22 Juni'],
        'B',
        'Hari lahir Pancasila diperingati setiap tanggal 1 Juni sesuai pidato Ir. Soekarno pada sidang BPUPKI 1 Juni 1945.',
        P
      ),
      makePg(
        ppknViiId,
        2,
        'Panitia Sembilan dibentuk untuk...',
        [
          'Menyusun teks proklamasi',
          'Menyepakati rumusan dasar negara',
          'Menentukan presiden pertama Indonesia',
          'Melaksanakan upacara kemerdekaan',
        ],
        'B',
        'Panitia Sembilan dibentuk untuk membahas dan menyepakati rumusan dasar negara Indonesia.',
        P
      ),
      makePg(
        ppknViiId,
        3,
        'Tokoh yang mengetik teks proklamasi adalah...',
        ['Sayuti Melik', 'Achmad Soebardjo', 'Mohammad Hatta', 'Laksamana Maeda'],
        'A',
        'Sayuti Melik adalah tokoh yang mengetik naskah teks Proklamasi Kemerdekaan Indonesia.',
        P
      ),
      makePg(
        ppknViiId,
        4,
        'Pancasila pertama kali dikemukakan dalam sidang...',
        ['BPUPKI', 'PPKI', 'KNIP', 'MPR'],
        'A',
        'Istilah Pancasila pertama kali dikemukakan oleh Ir. Soekarno dalam sidang pertama BPUPKI.',
        P
      ),
      makePg(
        ppknViiId,
        5,
        'Rumusan awal Pancasila yang diusulkan dalam Piagam Jakarta berbeda pada sila pertama karena...',
        [
          'Menyebutkan kewajiban menjalankan syariat Islam bagi pemeluknya',
          'Tidak mencantumkan kata "Ketuhanan"',
          'Memiliki enam sila dalam Pancasila',
          'Hanya mengutamakan satu agama',
        ],
        'A',
        'Sila pertama pada Piagam Jakarta berbunyi "Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya".',
        P
      ),
      makePg(
        ppknViiId,
        6,
        'Teks Proklamasi dirumuskan di rumah...',
        ['Mohammad Hatta', 'Soekarno', 'Laksamana Maeda', 'Sayuti Melik'],
        'C',
        'Naskah teks Proklamasi dirumuskan di kediaman Laksamana Tadashi Maeda di Jalan Imam Bonjol No. 1, Jakarta.',
        P
      ),
      makePg(
        ppknViiId,
        7,
        'Nilai-nilai keadilan di dalam Pancasila memiliki makna...',
        [
          'Sama rasa, sama rata, dan sama bahagia',
          'Yang mampu wajib menjadi donator',
          'Kekeluargaan dan kegotongroyongan',
          'Yang lemah selalu mengharapkan bantuan',
        ],
        'C',
        'Keadilan sosial dalam Pancasila dimaknai dengan semangat kekeluargaan dan kegotongroyongan.',
        P
      ),
      makePg(
        ppknViiId,
        8,
        'Proklamasi kemerdekaan Indonesia dibacakan di...',
        ['Istana Merdeka', 'Rengasdengklok', 'Rumah Soekarno, Pegangsaan Timur 56', 'Gedung BPUPKI'],
        'C',
        'Proklamasi kemerdekaan Indonesia dibacakan di kediaman Ir. Soekarno, Jalan Pegangsaan Timur No. 56 Jakarta.',
        P
      ),
      makePg(
        ppknViiId,
        9,
        'Salah satu bentuk penerapan sila keadilan sosial adalah...',
        [
          'Mendukung kebijakan pemerintah tanpa kritik',
          'Membantu sesama tanpa memandang status sosial',
          'Mementingkan kepentingan pribadi di atas kepentingan umum',
          'Hanya memperjuangkan hak sendiri',
        ],
        'B',
        'Membantu sesama tanpa membeda-bedakan status sosial merupakan wujud nyata keadilan sosial.',
        P
      ),
      makePg(
        ppknViiId,
        10,
        'Tokoh yang mengusulkan istilah "Pancasila" sebagai dasar negara adalah...',
        ['Mohammad Hatta', 'Soepomo', 'Soekarno', 'Achmad Soebardjo'],
        'C',
        'Ir. Soekarno menyampaikan istilah Pancasila sebagai dasar negara pada 1 Juni 1945.',
        P
      ),
      makePg(
        ppknViiId,
        11,
        'Panitia Sembilan diketuai oleh...',
        ['Mohammad Hatta', 'Soekarno', 'Soepomo', 'Ki Hadjar Dewantara'],
        'B',
        'Panitia Sembilan diketuai oleh Ir. Soekarno dengan wakil ketua Drs. Mohammad Hatta.',
        P
      ),
      makePg(
        ppknViiId,
        12,
        'Perubahan dalam teks proklamasi yang diketik oleh Sayuti Melik adalah...',
        [
          'Kata "tempoh" diubah menjadi "tempo"',
          'Nama negara diubah dari Nusantara menjadi Indonesia',
          'Kalimat terakhir ditambahkan setelah diskusi panjang',
          'Teks awal ditulis dalam bahasa daerah',
        ],
        'A',
        'Salah satu perubahan pengetikan oleh Sayuti Melik adalah mengubah kata "tempoh" menjadi "tempo".',
        P
      ),
      makePg(
        ppknViiId,
        13,
        'Konsep demokrasi dalam Pancasila terdapat pada sila...',
        ['Pertama', 'Kedua', 'Ketiga', 'Keempat'],
        'D',
        'Nilai kerakyatan dan demokrasi permusyawaratan/perwakilan terkandung dalam sila keempat Pancasila.',
        P
      ),
      makePg(
        ppknViiId,
        14,
        'Salah satu nilai yang terkandung dalam Piagam Jakarta adalah...',
        [
          'Kebebasan tanpa batas',
          'Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluknya',
          'Pemerintah yang bersifat otoriter',
          'Persatuan dalam satu suku',
        ],
        'B',
        'Piagam Jakarta memuat rumusan sila pertama "Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya".',
        P
      ),
      makePg(
        ppknViiId,
        15,
        'Panitia Sembilan menghasilkan rumusan dasar negara yang dikenal sebagai...',
        ['UUD 1945', 'Teks Proklamasi', 'Piagam Jakarta', 'Pancasila versi final'],
        'C',
        'Hasil kerja Panitia Sembilan pada 22 Juni 1945 dikenal sebagai Piagam Jakarta (Jakarta Charter).',
        P
      ),
      makePg(
        ppknViiId,
        16,
        'Mengembangkan sikap adil terhadap sesama, merupakan butir pengamalan Pancasila sila ke...',
        ['5', '4', '3', '2'],
        'A',
        'Mengembangkan sikap adil terhadap sesama adalah pengamalan sila ke-5 Pancasila (Keadilan Sosial bagi Seluruh Rakyat Indonesia).',
        P
      ),
      makePg(
        ppknViiId,
        17,
        'Rumusan Pancasila yang dikemukakan oleh Moh. Yamin sila kedua berbunyi...',
        ['Peri Kemanusiaan', 'Keadilan sosial', 'Musyawarah', 'Keadilan rakyat'],
        'A',
        'Dalam usulan lisan Moh. Yamin pada 29 Mei 1945, sila kedua berbunyi Peri Kemanusiaan.',
        P
      ),
      makePg(
        ppknViiId,
        18,
        'Tujuan dibentuknya BPUPKI adalah...',
        [
          'Mempersiapkan kemerdekaan Indonesia',
          'Membentuk panitia kemerdekaan',
          'Menyelidiki kemerdekaan Indonesia',
          'Mengusahakan kemerdekaan Indonesia',
        ],
        'A',
        'BPUPKI dibentuk untuk mempelajari dan mempersiapkan hal-hal penting menuju kemerdekaan Indonesia.',
        P
      ),
      makePg(
        ppknViiId,
        19,
        'Ir. Soekarno berpidato dan mengajukan usul tentang konsepsi dasar negara Indonesia yang diberi nama Pancasila dengan urutan pertama...',
        [
          'Internasionalisme atau peri kemanusiaan',
          'Kesejahteraan sosial',
          'Nasionalisme atau kebangsaan Indonesia',
          'Ketuhanan yang berkebudayaan',
        ],
        'C',
        'Dalam pidato 1 Juni 1945, urutan pertama usulan Ir. Soekarno adalah Kebangsaan Indonesia (Nasionalisme).',
        P
      ),
      makePg(
        ppknViiId,
        20,
        'Ketika akan mengambil pemungutan suara untuk menentukan bentuk negara, para pendiri negara diliputi suasana berikut, kecuali...',
        ['Toleransi', 'Permufakatan', 'Religius', 'Perdebatan'],
        'D',
        'Sidang berlangsung penuh toleransi, permufakatan, dan suasana religius, bukan perdebatan yang memecah belah.',
        P
      ),
      makePg(
        ppknViiId,
        21,
        'Para perumus Pancasila dalam bermusyawarah sangat menghargai perbedaan pendapat. Mereka menjunjung tinggi...',
        ['Kerja keras', 'Kesukuan', 'Toleransi', 'Egoisme'],
        'C',
        'Menghargai perbedaan pendapat saat bermusyawarah merupakan wujud sikap toleransi.',
        P
      ),
      makePg(
        ppknViiId,
        22,
        'Persatuan dalam masyarakat dapat terwujud jika...',
        [
          'Setiap individu mengutamakan kepentingan sendiri',
          'Ada kerja sama dan sikap saling menghargai',
          'Semua orang memiliki pendapat yang sama',
          'Setiap kelompok berjalan sendiri-sendiri tanpa komunikasi',
        ],
        'B',
        'Persatuan terwujud melalui kerja sama dan saling menghargai di tengah keberagaman.',
        P
      ),
      makePg(
        ppknViiId,
        23,
        'Salah satu keputusan penting dalam sidang PPKI adalah...',
        [
          'Membubarkan BPUPKI',
          'Membentuk Komite Nasional Indonesia Pusat',
          'Mengubah sistem pemerintahan',
          'Menghapus konstitusi yang telah dibuat',
        ],
        'B',
        'Salah satu keputusan sidang PPKI tanggal 18 Agustus 1945 adalah membentuk Komite Nasional Indonesia Pusat (KNIP).',
        P
      ),
      makePg(
        ppknViiId,
        24,
        'Pembukaan UUD 1945 alinea keempat berisi tentang...',
        [
          'Pembagian kekuasaan dan pemerintahan',
          'Tujuan negara dan rumusan Pancasila',
          'Aturan tentang kewarganegaraan',
          'Hak dan kewajiban pemerintah',
        ],
        'B',
        'Alinea keempat Pembukaan UUD 1945 memuat tujuan negara, ketentuan UUD, bentuk negara, dan rumusan Pancasila.',
        P
      ),
      makePg(
        ppknViiId,
        25,
        'Warna merah pada lambang sila kedua Pancasila melambangkan...',
        [
          'Kesetiaan dan kedamaian',
          'Kekuatan dan keberanian',
          'Keseimbangan dan kebersamaan',
          'Kejujuran dan kemurnian',
        ],
        'B',
        'Warna merah pada perisai lambang rantai emas sila kedua melambangkan kekuatan dan keberanian.',
        P
      ),
      makePg(
        ppknViiId,
        26,
        'Akar menjalar pada pohon beringin berfungsi untuk...',
        [
          'Melindungi pohon dari hama',
          'Membantu pohon menyerap air dan udara',
          'Mempercepat pertumbuhan daun',
          'Mengurangi dampak erosi tanah',
        ],
        'B',
        'Akar gantung/menjalar pada pohon beringin membantu menyerap air dan udara untuk pertumbuhan pohon.',
        P
      ),
      makePg(
        ppknViiId,
        27,
        'Memotong rambut bagi siswa laki-laki bertujuan untuk...',
        [
          'Mengikuti tren model rambut',
          'Menjaga kerapian dan disiplin',
          'Menunjukkan status sosial',
          'Membedakan siswa kaya dan kurang mampu',
        ],
        'B',
        'Aturan potongan rambut siswa di sekolah bertujuan menjaga kerapian diri serta melatih kedisiplinan.',
        P
      ),
      makePg(
        ppknViiId,
        28,
        'Pada saat tugas kelompok, murid belajar tentang...',
        [
          'Bekerja sendiri tanpa bantuan orang lain',
          'Cara menghindari tanggung jawab',
          'Pentingnya kerja sama dan menghargai pendapat',
          'Menyelesaikan tugas secara cepat tanpa diskusi',
        ],
        'C',
        'Kerja kelompok melatih murid bekerja sama dan menghargai pendapat teman.',
        P
      ),
      makePg(
        ppknViiId,
        29,
        'Contoh norma dalam kehidupan bermasyarakat adalah...',
        [
          'Tidak mengucapkan salam saat bertemu orang lain',
          'Gotong royong membersihkan lingkungan',
          'Berbicara kasar kepada tetangga',
          'Mengabaikan peraturan yang berlaku',
        ],
        'B',
        'Gotong royong membersihkan lingkungan adalah contoh penerapan norma dalam masyarakat.',
        P
      ),
      makePg(
        ppknViiId,
        30,
        'Mengucapkan salam saat berkunjung ke rumah orang lain mencerminkan...',
        [
          'Sikap individualisme',
          'Norma kesopanan',
          'Kebiasaan yang tidak perlu',
          'Hak pribadi setiap individu',
        ],
        'B',
        'Mengucapkan salam saat bertamu merupakan wujud pelaksanaan norma kesopanan.',
        P
      ),
      makePg(
        ppknViiId,
        31,
        'Warna dasar putih pada sila ketiga melambangkan...',
        [
          'Keadilan dan kesejahteraan',
          'Persatuan dan kemurnian',
          'Keberanian dan kejujuran',
          'Kebijaksanaan dan kepemimpinan',
        ],
        'B',
        'Warna dasar putih pada lambang pohon beringin sila ketiga melambangkan kesucian, kemurnian, dan persatuan.',
        P
      ),
      makePg(
        ppknViiId,
        32,
        'Salah satu ciri kelompok sosial adalah...',
        [
          'Terdiri atas individu yang berbeda tanpa tujuan bersama',
          'Tidak memiliki norma yang mengatur hubungan antar anggota',
          'Memiliki kepentingan bersama',
          'Tidak ada interaksi di antara anggotanya',
        ],
        'C',
        'Kelompok sosial terbentuk karena adanya kesamaan tujuan atau kepentingan bersama serta interaksi antaranggota.',
        P
      ),
      makePg(
        ppknViiId,
        33,
        'Interaksi sosial penting bagi manusia karena...',
        [
          'Membantu memenuhi kebutuhan fisik dan emosional',
          'Mengurangi perbedaan sosial',
          'Menjadikan manusia lebih mandiri',
          'Membuat manusia tidak memerlukan orang lain',
        ],
        'A',
        'Sebagai makhluk sosial, manusia membutuhkan interaksi sosial untuk memenuhi kebutuhan hidup fisik maupun emosional.',
        P
      ),
      makePg(
        ppknViiId,
        34,
        'Salah satu contoh norma yang diterapkan di sekolah adalah...',
        [
          'Murid boleh datang sesuka hati',
          'Menggunakan seragam sesuai aturan',
          'Mengabaikan nasihat guru',
          'Meninggalkan kelas saat pelajaran berlangsung',
        ],
        'B',
        'Mengenakan seragam sesuai ketentuan tata tertib adalah contoh pelaksanaan norma di lingkungan sekolah.',
        P
      ),
      makePg(
        ppknViiId,
        35,
        'Aturan-aturan yang berisi petunjuk tingkah laku yang harus atau tidak boleh dilakukan manusia dan bersifat mengikat disebut...',
        ['Hukum', 'Adat istiadat', 'Norma', 'Mores'],
        'C',
        'Norma adalah aturan atau ketentuan yang mengikat warga masyarakat berisi petunjuk tingkah laku.',
        P
      ),
      makePg(
        ppknViiId,
        36,
        '"Kamu harus beribadah", pernyataan tersebut menunjukkan pelaksanaan norma...',
        ['Hukum', 'Kesusilaan', 'Kesopanan', 'Agama'],
        'D',
        'Perintah untuk beribadah kepada Tuhan Yang Maha Esa merupakan wujud pelaksanaan norma agama.',
        P
      ),
      makePg(
        ppknViiId,
        37,
        'Norma yang bersumber pada ajaran agama, filsafat, nilai kebudayaan atau ideologi yang dianut oleh masyarakat disebut...',
        ['Norma kesusilaan', 'Norma hukum', 'Norma moral', 'Norma agama'],
        'C',
        'Norma moral berlandaskan nilai kebudayaan, filsafat, ideologi, dan ajaran kebaikan yang diyakini masyarakat.',
        P
      ),
      makePg(
        ppknViiId,
        38,
        'Norma-norma yang ada dalam masyarakat, kecuali norma...',
        ['Agama', 'Hukum', 'Keluarga', 'Kesopanan'],
        'C',
        'Empat norma pokok dalam masyarakat meliputi norma agama, kesusilaan, kesopanan, dan hukum.',
        P
      ),
      makePg(
        ppknViiId,
        39,
        'Berbuat baik kepada sesama manusia, termasuk dalam penerapan norma...',
        ['Agama', 'Kesopanan', 'Kesusilaan', 'Hukum'],
        'C',
        'Berbuat baik kepada sesama manusia lahir dari hati nurani sebagai penerapan norma kesusilaan.',
        P
      ),
      makePg(
        ppknViiId,
        40,
        'Ciri-ciri norma hukum, kecuali...',
        [
          'Aturan dibuat oleh badan / lembaga berwenang',
          'Sanksi bersifat fleksibel',
          'Aturan berisi perintah dan larangan',
          'Aturan tentang perilaku manusia dalam pergaulan masyarakat',
        ],
        'B',
        'Sanksi norma hukum bersifat tegas, memaksa, dan mengikat, bukan fleksibel.',
        P
      ),
    ],
    [ipaViiiId]: [
      makePg(
        ipaViiiId,
        1,
        'Tiga macam zat makanan penghasil energi bagi tubuh adalah...',
        [
          'Karbohidrat, protein, dan vitamin',
          'Karbohidrat, lemak, dan mineral',
          'Karbohidrat, vitamin, dan lemak',
          'Protein, karbohidrat, dan lemak',
        ],
        'D',
        'Zat makanan penghasil energi (kalori) bagi tubuh adalah karbohidrat, protein, dan lemak.',
        P8
      ),
      makePg(
        ipaViiiId,
        2,
        'Ketika melakukan uji makanan dengan biuret, tampak muncul warna ungu pada bahan makanan. Hal ini menunjukkan bahwa...',
        [
          'Makanan mengandung lemak',
          'Makanan mengandung karbohidrat',
          'Makanan mengandung cukup air',
          'Makanan mengandung protein',
        ],
        'D',
        'Reagen Biuret berubah warna menjadi ungu apabila bahan makanan positif mengandung protein.',
        P8
      ),
      makePg(
        ipaViiiId,
        3,
        'Saat berpuasa kadar gula dalam darah menjadi rendah. Makanan yang paling cocok untuk segera memulihkan kondisi tubuh adalah...',
        ['Telur', 'Air putih', 'Kurma', 'Daging'],
        'C',
        'Kurma mengandung gula sederhana alami yang cepat diserap tubuh untuk memulihkan kadar glukosa darah.',
        P8
      ),
      makePg(
        ipaViiiId,
        4,
        'Seorang remaja putri berusia 14 tahun, dengan aktivitas fisik sedang, membutuhkan asupan energi yang cukup untuk pertumbuhan dan kegiatan sehari-hari. Nutrien utama yang menjadi sumber energi terbesar bagi tubuh adalah...',
        ['Vitamin', 'Mineral', 'Karbohidrat dan lemak', 'Air'],
        'C',
        'Karbohidrat dan lemak merupakan sumber energi utama terbesar bagi aktivitas tubuh manusia.',
        P8
      ),
      makePg(
        ipaViiiId,
        5,
        'Vitamin berikut yang berperan penting dalam pembekuan darah dan banyak ditemukan pada sayuran hijau seperti brokoli dan bayam adalah...',
        ['Vitamin C', 'Vitamin K', 'Vitamin B12', 'Vitamin A'],
        'B',
        'Vitamin K berperan penting membantu pembentukan protrombin dalam proses pembekuan darah.',
        P8
      ),
      makePg(
        ipaViiiId,
        6,
        'Penyakit yang diakibatkan oleh kekurangan yodium dalam makanan dan adanya kandungan kapur yang tinggi pada air minum dinamakan...',
        ['Rabun Senja', 'Merasmus', 'Penyakit Gondok', 'Kwasiorkor'],
        'C',
        'Kekurangan yodium menyebabkan pembengkakan kelenjar tiroid yang dikenal sebagai penyakit gondok.',
        P8
      ),
      makePg(
        ipaViiiId,
        7,
        'Urutan saluran pencernaan manusia yang benar adalah...',
        [
          'Mulut, kerongkongan, lambung, usus halus, usus besar dan anus',
          'Mulut, kerongkongan, lambung, usus besar, usus halus dan anus',
          'Mulut, kerongkongan, usus besar, usus halus dan anus',
          'Mulut, lambung, kerongkongan, usus halus, usus besar dan anus',
        ],
        'A',
        'Saluran pencernaan manusia berurutan dari mulut → kerongkongan → lambung → usus halus → usus besar → anus.',
        P8
      ),
      makePg(
        ipaViiiId,
        8,
        'Proses perubahan makanan dari ukuran besar menjadi ukuran kecil dengan bantuan gigi disebut pencernaan makanan secara...',
        ['Kimiawi', 'Intrasel', 'Mekanis', 'Ekstrasel'],
        'C',
        'Penghalusan ukuran makanan secara fisik oleh gigi di rongga mulut disebut pencernaan mekanis.',
        P8
      ),
      makePg(
        ipaViiiId,
        9,
        'Enzim yang berfungsi untuk mengubah lemak menjadi gliserol yaitu...',
        ['Lipase', 'Amilase', 'Renin', 'Tripsin'],
        'A',
        'Enzim lipase memecah lemak (lipid) menjadi asam lemak dan gliserol.',
        P8
      ),
      makePg(
        ipaViiiId,
        10,
        'Kadar air dari sisa makanan diatur oleh...',
        ['Poros usus', 'Usus besar', 'Usus halus', 'Usus dua belas jari'],
        'B',
        'Usus besar (kolon) berfungsi menyerap dan mengatur kadar air pada sisa makanan sebelum menjadi feses.',
        P8
      ),
      makePg(
        ipaViiiId,
        11,
        'Berikut ini yang bukan merupakan fungsi darah adalah...',
        [
          'mengangkut sisa hasil metabolisme',
          'meneruskan rangsang dari lingkungan',
          'membunuh kuman yang masuk ke dalam tubuh',
          'mengangkut oksigen dan karbon dioksida',
        ],
        'B',
        'Meneruskan rangsang dari lingkungan merupakan fungsi sistem saraf, bukan fungsi darah.',
        P8
      ),
      makePg(
        ipaViiiId,
        12,
        'Jenis sel darah yang berfungsi dalam proses pembekuan darah adalah...',
        ['sel darah merah', 'plasma darah', 'keping darah', 'sel darah putih'],
        'C',
        'Keping darah (trombosit) berperan utama dalam proses pembekuan darah saat terjadi luka.',
        P8
      ),
      makePg(
        ipaViiiId,
        13,
        'Tangan Nia terluka saat memotong wortel, lalu dengan cepat dia menutup luka dengan ibu jarinya. Beberapa saat kemudian lukanya tidak berdarah lagi. Bagian darah yang berperan dalam penutupan luka tersebut adalah...',
        [
          'serum dan fibrinogen',
          'fibrinogen dan keping darah',
          'keping darah dan plasma darah',
          'plasma darah dan serum',
        ],
        'B',
        'Keping darah (trombosit) bersama protein fibrinogen membentuk benang fibrin untuk menutup luka.',
        P8
      ),
      makePg(
        ipaViiiId,
        14,
        'Peredaran darah yang aliran darahnya dari jantung ke seluruh tubuh dan kembali ke jantung disebut peredaran darah...',
        ['besar', 'tertutup', 'tunggal', 'rangkap'],
        'A',
        'Peredaran darah besar (sistemik) mengalirkan darah dari jantung ke seluruh tubuh lalu kembali ke jantung.',
        P8
      ),
      makePg(
        ipaViiiId,
        15,
        'Fungsi proses pernapasan bagi tubuh adalah sebagai berikut, kecuali...',
        [
          'memasukkan oksigen',
          'menghasilkan energi untuk oksidasi makanan',
          'merawat alat peredaran darah',
          'mengeluarkan sisa oksidasi, yaitu karbondioksida',
        ],
        'C',
        'Merawat alat peredaran darah bukan termasuk fungsi langsung dari proses pernapasan.',
        P8
      ),
      makePg(
        ipaViiiId,
        16,
        'Berikut ini nama organ penyusun sistem pernapasan pada manusia:\n1) rongga hidung\n2) alveolus\n3) bronkus\n4) Faring\n5) bronkiolus\nUrutan yang benar masuknya udara pernapasan adalah...',
        ['1-2-3-4-5', '1-4-3-5-2', '2-3-4-5-1', '1-3-4-5-2'],
        'B',
        'Alur masuknya udara pernapasan sesuai opsi yang tersedia: rongga hidung (1) → faring (4) → bronkus (3) → bronkiolus (5) → alveolus (2).',
        P8
      ),
      makePg(
        ipaViiiId,
        17,
        'Proses bernapas dibedakan antara pernapasan dada dan pernapasan perut. Pada pernapasan dada yang berkontraksi adalah otot-otot...',
        [
          'Antar rusuk dan diafragma',
          'Diafragma dan pengangkat rusuk',
          'Antar rusuk, pengangkat rusuk dan diafragma',
          'Antar rusuk dan pengangkat rusuk',
        ],
        'D',
        'Pernapasan dada digerakkan oleh kontraksi otot antartulang rusuk dan otot pengangkat rusuk.',
        P8
      ),
      makePg(
        ipaViiiId,
        18,
        'Organ pernapasan yang berperan sebagai alat penyaring dan penghangat adalah...',
        ['Bronkiolus', 'Bronkus', 'Hidung', 'Trakea'],
        'C',
        'Rongga hidung memiliki rambut hidung dan selaput lendir untuk menyaring debu serta menghangatkan udara.',
        P8
      ),
      makePg(
        ipaViiiId,
        19,
        'Udara yang didapatkan pada saat kita menghembuskan napas sekuat-kuatnya disebut udara...',
        ['Komplementer', 'Tidal', 'Suplementer', 'Residu'],
        'D',
        'Sesuai kunci jawaban pada naskah soal guru (D).',
        P8
      ),
      makePg(
        ipaViiiId,
        20,
        'Gangguan pernapasan yang biasanya disebabkan karena terlalu banyak merokok adalah...',
        ['Kanker paru-paru', 'Pneumonia', 'Salesma', 'Dipteri'],
        'A',
        'Zat karsinogenik dalam asap rokok meningkatkan risiko kanker paru-paru secara signifikan.',
        P8
      ),
    ],
    [ipaIxId]: [
      makePg(
        ipaIxId,
        1,
        'Proses bertambahnya ukuran fisik, seperti tinggi badan dan berat badan, disebut...',
        ['Perkembangan', 'Pertumbuhan', 'Reproduksi', 'Adaptasi'],
        'B',
        'Pertumbuhan adalah pertambahan ukuran fisik (tinggi, berat, volume) yang bersifat kuantitatif dan ireversibel.',
        P9
      ),
      makePg(
        ipaIxId,
        2,
        'Kemampuan bayi untuk merangkak, berdiri, lalu berjalan adalah contoh dari...',
        ['Pertumbuhan', 'Adaptasi', 'Perkembangan', 'Reproduksi'],
        'C',
        'Perkembangan merupakan proses pematangan fungsi organ dan kemampuan motorik makhluk hidup.',
        P9
      ),
      makePg(
        ipaIxId,
        3,
        'Berikut ini adalah tahapan siklus hidup manusia secara berurutan...',
        [
          'Remaja – Bayi – Anak-anak – Dewasa',
          'Bayi – Anak-anak – Remaja – Dewasa',
          'Dewasa – Anak-anak – Bayi – Remaja',
          'Anak-anak – Remaja – Bayi – Dewasa',
        ],
        'B',
        'Tahapan siklus hidup manusia pascakelahiran berlangsung berurutan: Bayi → Anak-anak → Remaja → Dewasa.',
        P9
      ),
      makePg(
        ipaIxId,
        4,
        'Sistem koordinasi tubuh manusia terlaksana oleh adanya...',
        [
          'Otak dan sistem saraf',
          'Otak dan sumsum tulang belakang',
          'Sistem saraf dan hormon',
          'Hormon dan sumsum tulang belakang',
        ],
        'C',
        'Sistem koordinasi manusia dijalankan bersama oleh sistem saraf dan sistem hormon (endokrin).',
        P9
      ),
      makePg(
        ipaIxId,
        5,
        'Sistem koordinasi manusia yang berfungsi mengatur dan mengendalikan semua aktivitas tubuh dengan respons cepat dan singkat adalah...',
        ['Sistem endokrin', 'Sistem peredaran darah', 'Sistem saraf', 'Sistem pencernaan'],
        'C',
        'Sistem saraf menghantarkan impuls listrik sehingga menghasilkan respons yang cepat dan singkat.',
        P9
      ),
      makePg(
        ipaIxId,
        6,
        'Bagian dari sel saraf (neuron) yang berfungsi menerima impuls dari neuron lain dan menghantarkannya menuju badan sel adalah...',
        ['Akson', 'Dendrit', 'Mielin', 'Sinapsis'],
        'B',
        'Dendrit adalah juluran pendek neuron yang menerima rangsangan dan meneruskannya ke badan sel saraf.',
        P9
      ),
      makePg(
        ipaIxId,
        7,
        'Perhatikan gambar berikut!\nBagian otak yang berfungsi sebagai pusat keseimbangan tubuh ditunjukkan oleh...',
        ['1', '2', '3', '4'],
        'B',
        'Nomor 2 menunjuk otak kecil (cerebellum) yang berfungsi mengatur keseimbangan dan koordinasi gerak tubuh.',
        P9,
        '/assets/questions/ipa-ix-q7-otak.png'
      ),
      makePg(
        ipaIxId,
        8,
        'Ketika tangan tidak sengaja menyentuh benda panas, tubuh akan secara otomatis (Gerak Refleks) menarik tangan. Jalur impuls saraf pada peristiwa ini adalah...',
        [
          'Reseptor - saraf sensorik - otak - saraf motorik - efektor',
          'Reseptor - saraf sensorik - sumsum tulang belakang - saraf motorik - efektor',
          'Efektor - saraf motorik - otak - saraf sensorik - reseptor',
          'Saraf motorik - reseptor - sumsum tulang belakang - saraf sensorik - efektor',
        ],
        'B',
        'Gerak refleks diproses melalui sumsum tulang belakang: reseptor → saraf sensorik → sumsum tulang belakang → saraf motorik → efektor.',
        P9
      ),
      makePg(
        ipaIxId,
        9,
        'Penyakit kehilangan kemampuan untuk peduli terhadap diri sendiri adalah penyakit...',
        ['Epilepsi', 'Parkison', 'Alzheimer', 'Amnesia'],
        'C',
        'Alzheimer ditandai penurunan daya ingat progresif hingga kehilangan kemampuan mengurus diri sendiri.',
        P9
      ),
      makePg(
        ipaIxId,
        10,
        'Berikut ini adalah fungsi hormon adrenalin, kecuali...',
        [
          'Meningkatkan detak jantung',
          'Mempercepat pernapasan',
          'Menurunkan kadar gula darah',
          'Melebarkan pupil mata',
        ],
        'C',
        'Hormon adrenalin justru meningkatkan kadar gula darah (glukosa) sebagai energi siap pakai, bukan menurunkannya.',
        P9
      ),
      makePg(
        ipaIxId,
        11,
        'Jika seseorang mengalami kerusakan pada bagian retina matanya, dampak yang paling mungkin terjadi adalah...',
        [
          'Tidak dapat membedakan warna',
          'Kesulitan melihat dalam kondisi gelap',
          'Penglihatan menjadi kabur atau hilang',
          'Mata menjadi sangat sensitif terhadap cahaya',
        ],
        'C',
        'Retina berisi sel fotoreseptor penangkap bayangan cahaya; kerusakannya membuat penglihatan kabur hingga hilang.',
        P9
      ),
      makePg(
        ipaIxId,
        12,
        'Gangguan mata yang tidak bisa melihat benda dekat dengan jelas adalah...',
        ['Miopi', 'Atigmatisma', 'Presbiopi', 'Hipermetropi'],
        'D',
        'Hipermetropi (rabun dekat) terjadi ketika bayangan jatuh di belakang retina sehingga benda dekat tampak kabur.',
        P9
      ),
      makePg(
        ipaIxId,
        13,
        'Telinga kita hanya mampu mendengar suara yang frekuensinya antara...',
        ['20 Hz – 100 Hz', '20 Hz – 1000 Hz', '20 Hz – 20.000 Hz', '100 Hz – 50.000 Hz'],
        'C',
        'Bunyi audiosonik yang dapat didengar telinga manusia memiliki rentang frekuensi 20 Hz hingga 20.000 Hz.',
        P9
      ),
      makePg(
        ipaIxId,
        14,
        'Membran timpani yang menangkap getaran suara terdapat di bagian...',
        ['Telinga luar', 'Telinga tengah', 'Telinga dalam', 'Saluran eustachius'],
        'A',
        'Sesuai kunci jawaban pada naskah soal guru (A).',
        P9
      ),
      makePg(
        ipaIxId,
        15,
        'Perhatikan gambar di bawah ini!\nLidah manusia beserta bagian-bagiannya. Bagian yang bernomor 1, 2, dan 3 secara berturut-turut dapat merasakan...',
        [
          'Manis, asin, dan asam',
          'Manis, asin, dan pahit',
          'Manis, asam, dan pahit',
          'Asam, manis, dan pahit',
        ],
        'D',
        'Sesuai kunci jawaban pada naskah soal guru (D).',
        P9,
        '/assets/questions/ipa-ix-q15-lidah.png'
      ),
      makePg(
        ipaIxId,
        16,
        'Berikut ini yang bukan merupakan tujuan pemberian zat aditif adalah...',
        [
          'memberi cita rasa tertentu',
          'menambah nilai gizi',
          'mengawetkan',
          'menurunkan nilai jual',
        ],
        'D',
        'Penambahan zat aditif bertujuan meningkatkan mutu, daya simpan, rasa, atau tampilan makanan, bukan menurunkan nilai jual.',
        P9
      ),
      makePg(
        ipaIxId,
        17,
        'Bahan-bahan berikut ini termasuk pewarna alami, kecuali...',
        ['kunyit', 'tartrazin', 'karamel', 'daun suji'],
        'B',
        'Tartrazin merupakan pewarna makanan sintetis (buatan) berwarna kuning.',
        P9
      ),
      makePg(
        ipaIxId,
        18,
        'Monosodium Glutamat (MSG) adalah zat aditif pada makanan yang berfungsi sebagai...',
        ['pewarna', 'pemanis', 'pengawet', 'penyedap'],
        'D',
        'MSG adalah zat penyedap rasa buatan untuk menguatkan cita rasa gurih (umami) makanan.',
        P9
      ),
      makePg(
        ipaIxId,
        19,
        'Pengertian zat adiktif adalah yang dapat menimbulkan...',
        ['kesenangan', 'kesedihan', 'ketergantungan', 'kesembuhan'],
        'C',
        'Zat adiktif adalah zat yang pemakaiannya dapat menimbulkan kecanduan atau ketergantungan.',
        P9
      ),
      makePg(
        ipaIxId,
        20,
        'Di dalam memulihkan kondisi fisik dan kejiwaan pecandu narkoba, maka dilakukan upaya...',
        ['resuitasi jantung', 'detoksifikasi', 'rehabilitasi', 'imunisasi'],
        'C',
        'Rehabilitasi dilakukan untuk memulihkan kondisi fisik, psikis, dan sosial pecandu narkoba.',
        P9
      ),
      makePg(
        ipaIxId,
        21,
        'Fungsi dari testis pada alat reproduksi pria adalah...',
        ['Penghasil Sperma', 'Penghasil Ovum', 'Penghasil Urin', 'Saluran Anak'],
        'A',
        'Testis berfungsi menghasilkan sel kelamin jantan (sperma) serta hormon testosteron.',
        P9
      ),
      makePg(
        ipaIxId,
        22,
        'Perhatikan gambar organ reproduksi wanita berikut!\nYang ditunjukkan dengan huruf M berfungsi sebagai...',
        [
          'Tempat pertumbuhan embrio',
          'Tempat keluarnya janin',
          'Tempat penghasil sel telur',
          'Tempat terjadinya kelahiran',
        ],
        'C',
        'Huruf M menunjuk ovarium (indung telur) yang berfungsi menghasilkan sel telur (ovum).',
        P9,
        '/assets/questions/ipa-ix-q22-reproduksi-wanita.png'
      ),
      makePg(
        ipaIxId,
        23,
        'Perhatikan gambar berikut!\nBagian yang ditunjuk oleh huruf X berfungsi untuk...',
        [
          'Mematikan sperma',
          'Memproduksi sperma',
          'Menjaga suhu sperma',
          'Membuang sperma',
        ],
        'B',
        'Huruf X menunjuk testis yang berfungsi memproduksi sel sperma.',
        P9,
        '/assets/questions/ipa-ix-q23-reproduksi-pria.png'
      ),
      makePg(
        ipaIxId,
        24,
        'Berikut ini yang bukan termasuk organ reproduksi wanita adalah...',
        ['Testis', 'Oviduk', 'Ovarium', 'Uterus'],
        'A',
        'Testis merupakan organ reproduksi pada pria, bukan wanita.',
        P9
      ),
      makePg(
        ipaIxId,
        25,
        'Sistem perkembangbiakan pria tersusun dari organ luar yang terdiri dari...',
        ['Sperma dan ovum', 'Vagina dan rahim', 'Penis dan anus', 'Penis dan skrotum'],
        'D',
        'Organ reproduksi luar pria terdiri atas penis dan skrotum (kantung pelindung testis).',
        P9
      ),
      makePg(
        ipaIxId,
        26,
        'Pembentukan ovum terjadi di dalam...',
        ['Tuba fallopi', 'Ovarium', 'Rahim', 'Serviks'],
        'B',
        'Oogenesis (pembentukan sel telur/ovum) berlangsung di dalam ovarium.',
        P9
      ),
      makePg(
        ipaIxId,
        27,
        'Masa ketika seorang anak mengalami pematangan seksual yang disertai perubahan fisik dan psikis disebut masa...',
        ['Menopause', 'Balita', 'PAUD', 'Pubertas'],
        'D',
        'Pubertas adalah masa peralihan menuju dewasa yang ditandai pematangan organ reproduksi serta perubahan fisik dan psikis.',
        P9
      ),
      makePg(
        ipaIxId,
        28,
        'Seorang wanita sudah tidak produktif untuk bereproduksi yang ditandai dengan tidak mengalami menstruasi disebut...',
        ['Oogenis', 'Spermatogenesis', 'Ovulasi', 'Menopause'],
        'D',
        'Menopause adalah berhentinya siklus menstruasi secara alami sebagai tanda berakhirnya masa subur wanita.',
        P9
      ),
      makePg(
        ipaIxId,
        29,
        'Di bawah ini penyakit sistem reproduksi manusia yang dapat mengakibatkan menurunnya sistem kekebalan tubuh seseorang adalah...',
        ['Herpes', 'AIDS', 'Gonore', 'Sifilis'],
        'B',
        'AIDS disebabkan oleh virus HIV yang menyerang sel darah putih sehingga menurunkan sistem kekebalan tubuh.',
        P9
      ),
      makePg(
        ipaIxId,
        30,
        'Kemampuan manusia untuk menghasilkan keturunan baru disebut...',
        ['Respirasi', 'Regenerasi', 'Reproduksi', 'Reaktif'],
        'C',
        'Reproduksi adalah kemampuan makhluk hidup menghasilkan keturunan baru untuk melestarikan jenisnya.',
        P9
      ),
    ],
    [pjokViiId]: [
      makePg(
        pjokViiId,
        1,
        'Keterampilan gerak adalah kemampuan seseorang dalam melakukan...',
        [
          'Aktivitas belajar di kelas',
          'Gerakan tubuh secara terkoordinasi',
          'Kegiatan membaca dan menulis',
          'Aktivitas bermain tanpa aturan',
        ],
        'B',
        'Keterampilan gerak adalah kemampuan seseorang melakukan gerakan tubuh secara terkoordinasi dengan baik.',
        P
      ),
      makePg(
        pjokViiId,
        2,
        'Contoh gerak dasar yang menjadi pondasi keterampilan olahraga adalah...',
        [
          'Strategi permainan',
          'Kerja sama tim',
          'Berjalan, berlari, dan melompat',
          'Peraturan pertandingan',
        ],
        'C',
        'Gerak lokomotor dasar seperti berjalan, berlari, dan melompat menjadi fondasi berbagai cabang olahraga.',
        P
      ),
      makePg(
        pjokViiId,
        3,
        'Tujuan utama melatih keterampilan gerak dalam pembelajaran PJOK yaitu...',
        [
          'Meningkatkan nilai rapor',
          'Membuat murid cepat lelah',
          'Meningkatkan kemampuan bergerak dan kebugaran',
          'Menghafal aturan olahraga',
        ],
        'C',
        'Latihan keterampilan gerak bertujuan meningkatkan kemampuan motorik dan kebugaran jasmani siswa.',
        P
      ),
      makePg(
        pjokViiId,
        4,
        'Salah satu manfaat melatih keterampilan gerak secara rutin yaitu...',
        [
          'Menurunkan minat berolahraga',
          'Meningkatkan risiko cedera',
          'Membuat tubuh kaku',
          'Meningkatkan koordinasi dan keseimbangan',
        ],
        'D',
        'Latihan rutin melatih koordinasi gerak tubuh serta meningkatkan keseimbangan.',
        P
      ),
      makePg(
        pjokViiId,
        5,
        'Supaya latihan keterampilan gerak berjalan efektif, sebaiknya dilakukan dengan cara...',
        [
          'Langsung melakukan gerakan yang sulit',
          'Tanpa aturan dan tujuan',
          'Bertahap dari mudah ke sulit',
          'Dilakukan satu kali saja',
        ],
        'C',
        'Latihan efektif dilakukan secara progresif dan bertahap dari gerakan sederhana menuju kompleks.',
        P
      ),
      makePg(
        pjokViiId,
        6,
        'Gerak dasar berlari termasuk dalam jenis gerak...',
        ['Nonlokomotor', 'Manipulatif', 'Lokomotor', 'Ritmik'],
        'C',
        'Berlari memindahkan tubuh dari satu titik ke titik lain sehingga termasuk gerak lokomotor.',
        P
      ),
      makePg(
        pjokViiId,
        7,
        'Contoh keterampilan gerak dasar yang menjadi dasar untuk olahraga voli yaitu...',
        [
          'Meloncat dan menyeimbangkan tubuh',
          'Melempar dan menangkap bola',
          'Meliukkan tubuh dan membungkuk',
          'Berlari dan melangkah ke belakang',
        ],
        'B',
        'Penguasaan gerak manipulatif melempar dan menangkap bola mendasari pengendalian bola pada permainan voli.',
        P
      ),
      makePg(
        pjokViiId,
        8,
        'Gerakan menyeimbangkan tubuh sangat penting dalam olahraga...',
        ['Senam lantai', 'Sepak bola', 'Bulu tangkis', 'Bola basket'],
        'A',
        'Senam lantai sangat mengandalkan keseimbangan tubuh dalam berbagai sikap dan tumpuan.',
        P
      ),
      makePg(
        pjokViiId,
        9,
        'Latihan yang dilakukan secara teratur dan bertahap akan membantu tubuh...',
        [
          'Cepat lelah',
          'Menolak perubahan',
          'Beradaptasi dan menguatkan koordinasi',
          'Menjadi kaku',
        ],
        'C',
        'Latihan bertahap membantu otot dan saraf beradaptasi sehingga koordinasi gerak makin kuat.',
        P
      ),
      makePg(
        pjokViiId,
        10,
        'Memori otot (muscle memory) terbentuk karena...',
        [
          'Latihan dilakukan satu kali',
          'Latihan dilakukan secara berulang',
          'Tidak pernah melakukan gerakan',
          'Menghafal teori gerak',
        ],
        'B',
        'Pengulangan gerakan secara konsisten membentuk memori otot agar gerakan menjadi otomatis dan akurat.',
        P
      ),
      makePg(
        pjokViiId,
        11,
        'Ketika seseorang berlatih gerakan secara berulang-ulang, otak membentuk...',
        ['Jalur memori gerak', 'Sinyal suara', 'Pikiran abstrak', 'Koordinasi statis'],
        'A',
        'Latihan berulang memperkuat koneksi saraf membentuk jalur memori gerak di otak.',
        P
      ),
      makePg(
        pjokViiId,
        12,
        'Pihak yang dapat memberikan umpan balik dalam pembelajaran PJOK yaitu...',
        [
          'Guru dan teman',
          'Guru, teman, dan diri sendiri',
          'Penonton pertandingan',
          'Wasit saja',
        ],
        'B',
        'Umpan balik dalam PJOK dapat berasal dari guru, teman sebaya, maupun refleksi diri sendiri.',
        P
      ),
      makePg(
        pjokViiId,
        13,
        'Gerak yang melibatkan penggunaan alat atau benda disebut...',
        ['Gerak manipulatif', 'Gerak lokomotor', 'Gerak nonlokomotor', 'Gerak ritmik'],
        'A',
        'Gerak manipulatif adalah keterampilan gerak yang menggunakan objek atau alat seperti bola atau raket.',
        P
      ),
      makePg(
        pjokViiId,
        14,
        'Contoh umpan balik dalam pembelajaran PJOK yaitu...',
        [
          'Menghentikan permainan',
          'Memberikan hukuman',
          'Mengoreksi posisi tubuh saat bergerak',
          'Mengganti peralatan',
        ],
        'C',
        'Umpan balik konstruktif berupa koreksi posisi tubuh membantu perbaikan teknik gerak siswa.',
        P
      ),
      makePg(
        pjokViiId,
        15,
        'Melihat rekaman video latihan termasuk dalam bentuk umpan balik...',
        ['Visual', 'Tertulis', 'Demonstrasi', 'Verbal'],
        'A',
        'Umpan balik visual memanfaatkan pengamatan gambar atau rekaman video gerakan sendiri.',
        P
      ),
      makePg(
        pjokViiId,
        16,
        'Tujuan utama pembelajaran taktik dalam sepak bola yaitu...',
        [
          'Menghafal peraturan pertandingan',
          'Menguasai teknik menendang sejauh mungkin',
          'Membantu pemain mengambil keputusan yang tepat saat bermain',
          'Meningkatkan kekuatan otot kaki',
        ],
        'C',
        'Pembelajaran taktik melatih kecerdasan bermain untuk mengambil keputusan tepat di lapangan.',
        P
      ),
      makePg(
        pjokViiId,
        17,
        'Contoh penerapan pembelajaran taktik sepak bola di sekolah yaitu...',
        [
          'Latihan menendang ke gawang tanpa penjaga',
          'Bermain sepak bola dengan jumlah pemain lebih sedikit',
          'Lari mengelilingi lapangan beberapa putaran',
          'Melakukan peregangan sebelum bermain',
        ],
        'B',
        'Permainan modifikasi (small-sided game) dengan pemain lebih sedikit efektif melatih taktik dan ruang.',
        P
      ),
      makePg(
        pjokViiId,
        18,
        'Pada pembelajaran taktik sepak bola, pergerakan tanpa bola bertujuan untuk...',
        [
          'Menghindari permainan',
          'Membuka ruang dan memberikan dukungan kepada rekan satu tim',
          'Menunggu bola datang sendiri',
          'Mengurangi kerja sama tim',
        ],
        'B',
        'Gerak tanpa bola penting untuk membuka ruang operan dan mendukung rekan yang menguasai bola.',
        P
      ),
      makePg(
        pjokViiId,
        19,
        'Manfaat pembelajaran taktik dalam sepak bola bagi murid adalah...',
        [
          'Membuat murid hanya fokus pada kemenangan',
          'Menurunkan minat bermain sepak bola',
          'Meningkatkan pemahaman permainan, komunikasi, dan sportivitas',
          'Menggantikan pembelajaran teknik sepenuhnya',
        ],
        'C',
        'Pendekatan taktik menumbuhkan pemahaman permainan, kerja sama komunikasi tim, dan sikap sportif.',
        P
      ),
      makePg(
        pjokViiId,
        20,
        'Rotasi pemain dalam olahraga tim bertujuan untuk...',
        [
          'Membingungkan rekan setim',
          'Membuat lawan kehilangan fokus',
          'Mengurangi komunikasi',
          'Menghambat pergerakan sendiri',
        ],
        'B',
        'Rotasi posisi yang terencana mengacaukan penjagaan lawan sehingga mereka kehilangan fokus.',
        P
      ),
      makePg(
        pjokViiId,
        21,
        'Pada lompat jauh, pemanfaatan ruang terlihat pada...',
        ['Gerakan tangan saja', 'Awalan dan pendaratan', 'Kecepatan reaksi', 'Jumlah lompatan'],
        'B',
        'Pemanfaatan lintasan awalan serta bak pendaratan menentukan efektivitas lompatan dalam lompat jauh.',
        P
      ),
      makePg(
        pjokViiId,
        22,
        'Pemain bulu tangkis memanfaatkan ruang dengan cara...',
        [
          'Memukul shuttlecock sembarangan',
          'Menghindari pergerakan',
          'Diam di satu posisi',
          'Mengarahkan shuttlecock ke area kosong',
        ],
        'D',
        'Mengarahkan shuttlecock ke area lapangan yang kosong menyulitkan lawan mengembalikan bola.',
        P
      ),
      makePg(
        pjokViiId,
        23,
        'Tujuan utama melakukan pergerakan dengan bola dalam permainan tim yaitu...',
        [
          'Menunjukkan kemampuan individu semata',
          'Mengulur waktu permainan',
          'Mempertahankan penguasaan bola dan menciptakan peluang',
          'Menghindari kerja sama dengan tim',
        ],
        'C',
        'Membawa bola bertujuan menjaga penguasaan tim sekaligus membuka peluang mencetak skor.',
        P
      ),
      makePg(
        pjokViiId,
        24,
        'Menggiring bola yang baik ditandai dengan...',
        [
          'Bola selalu jauh dari kaki pemain',
          'Pemain berlari secepat mungkin tanpa kontrol',
          'Pemain berhenti setiap kali menyentuh bola',
          'Bola terkontrol dan pemain mampu mengubah arah gerak',
        ],
        'D',
        'Dribbling yang baik menjaga bola tetap dalam kendali dan mudah mengubah arah saat melewati lawan.',
        P
      ),
      makePg(
        pjokViiId,
        25,
        'Hal yang perlu diperhatikan saat mengoper bola yaitu...',
        ['Ketepatan sasaran', 'Posisi wasit di lapangan', 'Kekuatan tendangan saja', 'Kecepatan lari lawan'],
        'A',
        'Akurasi atau ketepatan sasaran ke rekan setim adalah kunci keberhasilan operan.',
        P
      ),
      makePg(
        pjokViiId,
        26,
        'Pertahanan zona menuntut pemain untuk...',
        ['Bermain sendiri', 'Bekerja sama dan berkomunikasi', 'Fokus individu', 'Menyerang cepat'],
        'B',
        'Dalam zone defense, koordinasi, kerja sama, dan komunikasi antarpenjaga wilayah sangat krusial.',
        P
      ),
      makePg(
        pjokViiId,
        27,
        'Pertahanan satu lawan satu lebih menekankan pada...',
        ['Penguasaan ruang', 'Penjagaan individu', 'Rotasi wilayah', 'Formasi tetap'],
        'B',
        'Strategi man-to-man defense menugaskan tiap pemain menjaga satu pemain lawan secara langsung.',
        P
      ),
      makePg(
        pjokViiId,
        28,
        'Pemilihan strategi bertahan yang tepat akan...',
        [
          'Menghambat kerja sama',
          'Mengurangi peran pemain',
          'Membingungkan tim sendiri',
          'Meningkatkan peluang menang',
        ],
        'D',
        'Pertahanan yang solid menutup peluang lawan dan memperbesar peluang tim meraih kemenangan.',
        P
      ),
      makePg(
        pjokViiId,
        29,
        'Gerakan mencari ruang kosong dalam basket disebut...',
        ['Dribbling', 'Cutting', 'Passing', 'Shooting'],
        'B',
        'Cutting adalah gerakan cepat pemain tanpa bola memotong ke area kosong untuk menerima umpan.',
        P
      ),
      makePg(
        pjokViiId,
        30,
        'Kontrol ruang lebih dominan pada strategi...',
        ['Satu lawan satu', 'Bertahan bebas', 'Pertahanan zona', 'Serangan cepat'],
        'C',
        'Pertahanan zona berfokus menjaga area atau ruang lapangan tertentu daripada individu spesifik.',
        P
      ),
      makePg(
        pjokViiId,
        31,
        'Gerak membungkuk termasuk ke dalam jenis gerak...',
        ['Lokomotor', 'Manipulatif', 'Nonlokomotor', 'Kombinasi'],
        'C',
        'Membungkuk dilakukan di tempat tanpa berpindah posisi sehingga tergolong gerak nonlokomotor.',
        P
      ),
      makePg(
        pjokViiId,
        32,
        'Tujuan utama melakukan gerak membungkuk dengan teknik yang benar yaitu...',
        [
          'Mempercepat gerakan tubuh',
          'Menunjukkan kekuatan otot kaki',
          'Memindahkan tubuh ke tempat lain',
          'Menghindari cedera',
        ],
        'D',
        'Teknik membungkuk yang tepat melindungi punggung dan persendian dari risiko cedera.',
        P
      ),
      makePg(
        pjokViiId,
        33,
        'Bagian tubuh yang paling berperan saat melakukan gerak membungkuk yaitu...',
        [
          'Lengan dan pergelangan tangan',
          'Pinggang dan tulang belakang',
          'Leher dan bahu',
          'Telapak kaki',
        ],
        'B',
        'Kelenturan pinggang dan tulang belakang menjadi poros utama ketika tubuh membungkuk.',
        P
      ),
      makePg(
        pjokViiId,
        34,
        'Tahap pertama dalam belajar gerak disebut...',
        ['Tahap asosiatif', 'Tahap otonom', 'Tahap kognitif', 'Tahap analisis'],
        'C',
        'Belajar gerak dimulai dari tahap kognitif (memahami konsep gerakan), lalu asosiatif, dan otonom.',
        P
      ),
      makePg(
        pjokViiId,
        35,
        'Taktik bertahan bertujuan untuk...',
        [
          'Menguasai bola terus-menerus',
          'Mencetak poin sebanyak-banyaknya',
          'Menghalangi lawan mencetak poin',
          'Mempercepat tempo permainan',
        ],
        'C',
        'Tujuan utama bertahan adalah menghambat serangan dan mencegah lawan mencetak skor.',
        P
      ),
      makePg(
        pjokViiId,
        36,
        'Teknik dan taktik berbeda dalam hal fokus utama, fokus teknik yaitu...',
        ['Kerja sama tim', 'Pengambilan keputusan', 'Strategi bermain', 'Keterampilan gerak'],
        'D',
        'Teknik berfokus pada penguasaan keterampilan gerak dasar, sedangkan taktik pada penerapan strategi.',
        P
      ),
      makePg(
        pjokViiId,
        37,
        'Tujuan utama mengoper bola adalah...',
        [
          'Memamerkan kemampuan',
          'Mengulur waktu',
          'Menghindari aturan permainan',
          'Melanjutkan serangan tim',
        ],
        'D',
        'Mengoper bola mengalirkan penguasaan ke rekan yang lebih bebas untuk melanjutkan serangan tim.',
        P
      ),
      makePg(
        pjokViiId,
        38,
        'Rotasi pertahanan dilakukan ketika...',
        ['Tim menyerang', 'Pemain kelelahan', 'Ada ruang kosong', 'Wasit meniup peluit'],
        'C',
        'Pemain bertahan melakukan rotasi saat muncul celah atau ruang kosong yang ditinggalkan rekan.',
        P
      ),
      makePg(
        pjokViiId,
        39,
        'Kelemahan pertahanan satu lawan satu yaitu...',
        [
          'Tidak membutuhkan stamina',
          'Mudah ditembus jika pemain lengah',
          'Tidak perlu konsentrasi',
          'Menutup semua ruang',
        ],
        'B',
        'Jika satu pemain kehilangan fokus atau kalah duel kecepatan, pertahanan satu lawan satu mudah ditembus.',
        P
      ),
      makePg(
        pjokViiId,
        40,
        'Umpan balik internal diperoleh dari...',
        ['Guru atau pelatih', 'Teman sekelompok', 'Pengalaman tubuh sendiri', 'Alat bantu latihan'],
        'C',
        'Umpan balik internal (intrinsik) dirasakan langsung dari kesadaran sensori dan pengalaman tubuh sendiri.',
        P
      ),
    ],
    [pjokIxId]: [
      makePg(
        pjokIxId,
        1,
        'Salah satu teknik badan pada permainan sepak bola adalah...',
        [
          'Cara menyundul',
          'Melempar bola',
          'Berlari dan merubah arah',
          'Menangkap dan menerkam bola',
        ],
        'C',
        'Teknik gerak badan (tanpa bola) dalam sepak bola antara lain berlari dan mengubah arah gerakan.',
        P
      ),
      makePg(
        pjokIxId,
        2,
        'Menendang bola mengenai tengah-tengah kaki bagian dalam merupakan teknik menendang bola menggunakan...',
        ['Kaki bagian dalam', 'Kaki bagian luar', 'Punggung kaki', 'Punggung kaki bagian dalam'],
        'A',
        'Perkenaan pada sisi tengah kaki bagian dalam adalah teknik menendang dengan kaki bagian dalam.',
        P
      ),
      makePg(
        pjokIxId,
        3,
        'Pada permainan sepak bola, offside terjadi apabila...',
        [
          'Saat pemain mencetak gol',
          'Saat pemain berada di depan garis gawang lawan tanpa ada dua pemain lawan di antara mereka dan garis gawang',
          'Saat pemain melakukan pelanggaran keras',
          'Saat pemain melakukan selebrasi setelah mencetak gol',
        ],
        'B',
        'Offside terjadi ketika pemain penyerang berada di area lawan lebih dekat ke garis gawang daripada bola dan pemain belakang kedua terakhir lawan saat bola diumpan.',
        P
      ),
      makePg(
        pjokIxId,
        4,
        'Formasi dalam permainan sepak bola dapat diartikan sebagai...',
        [
          'Pertahanan pemain belakang',
          'Penyerangan pemain depan',
          'Penempatan pemain',
          'Kombinasi serangan',
        ],
        'C',
        'Formasi adalah sistem pengaturan atau penempatan posisi pemain di lapangan dalam bertahan maupun menyerang.',
        P
      ),
      makePg(
        pjokIxId,
        5,
        'Barisan depan pada permainan sepak bola dipersiapkan terutama untuk...',
        ['Pertahanan', 'Penyerangan', 'Back', 'Pengumpan'],
        'B',
        'Pemain barisan depan (penyerang/striker) bertugas utama melakukan serangan dan mencetak gol.',
        P
      ),
      makePg(
        pjokIxId,
        6,
        'Bagian kaki yang digunakan untuk menggiring bola, sama dengan bagian kaki yang digunakan untuk...',
        ['Menendang', 'Menahan', 'Mengontrol', 'Menggiring'],
        'A',
        'Bagian kaki yang dipakai menggiring bola (kaki bagian dalam, luar, dan punggung kaki) sama dengan untuk menendang bola.',
        P
      ),
      makePg(
        pjokIxId,
        7,
        'Berikut yang bukan tujuan dari menggiring bola adalah...',
        [
          'Guna mendekati sasaran',
          'Melewati lawan',
          'Guna memberikan bola pada teman',
          'Menghambat permainan',
        ],
        'C',
        'Sesuai kunci jawaban pada naskah soal guru (C).',
        P
      ),
      makePg(
        pjokIxId,
        8,
        'Tujuan dari menyundul bola dengan gerakan melayang adalah...',
        ['Mencetak gol', 'Mengumpan', 'Menghambat pergerakan lawan', 'Melewati hadangan lawan'],
        'A',
        'Menyundul bola sambil melayang (diving header) umumnya dilakukan untuk menyambut umpan guna mencetak gol.',
        P
      ),
      makePg(
        pjokIxId,
        9,
        'Dribbling dalam sepak bola adalah...',
        [
          'Menendang bola ke arah gawang',
          'Mengoper bola kepada teman satu tim',
          'Menggiring bola melewati pemain lawan',
          'Melempar bola ke dalam gawang lawan',
        ],
        'C',
        'Dribbling adalah teknik membawa atau menggiring bola melewati penguasaan lawan.',
        P
      ),
      makePg(
        pjokIxId,
        10,
        'Pemain dalam sepak bola yang diperbolehkan menggunakan semua anggota badan selama dalam batas garis 16 meter adalah...',
        ['Pemain bertahan', 'Penjaga gawang', 'Pemain tengah', 'Penyerang'],
        'B',
        'Hanya penjaga gawang (kiper) yang diperbolehkan menyentuh bola dengan tangan di dalam kotak penaltinya.',
        P
      ),
      makePg(
        pjokIxId,
        11,
        'Umpan bola yang banyak dilakukan untuk memberikan bola jarak jauh antara satu pemain kepada pemain yang lain menggunakan kaki bagian...',
        ['Kaki bagian dalam', 'Kaki bagian luar', 'Telapak kaki', 'Punggung kaki'],
        'D',
        'Punggung kaki menghasilkan tendangan bertenaga untuk umpan lambung jarak jauh.',
        P
      ),
      makePg(
        pjokIxId,
        12,
        'Selain untuk mengumpan bola, gerakan menendang bola juga digunakan untuk...',
        ['Menahan', 'Menembak ke gawang', 'Menggiring', 'Mengontrol bola'],
        'B',
        'Menendang bola (shooting) digunakan untuk menembak keras ke arah gawang lawan.',
        P
      ),
      makePg(
        pjokIxId,
        13,
        'Berikut yang bukan bagian kaki yang dapat digunakan untuk mengontrol bola adalah...',
        ['Kaki bagian dalam', 'Punggung kaki', 'Kaki bagian luar', 'Telapak kaki'],
        'D',
        'Sesuai kunci jawaban pada naskah soal guru (D).',
        P
      ),
      makePg(
        pjokIxId,
        14,
        'Ketika wasit memberikan tendangan bebas, pemain harus...',
        [
          'Pemain boleh bermain dengan tangannya',
          'Pemain harus berdiri 9 meter dari bola',
          'Pemain boleh menggiring bola secepat mungkin',
          'Pemain harus mencetak gol langsung',
        ],
        'B',
        'Pemain bertahan wajib menjaga jarak minimal 9,15 meter (sekitar 9 meter) dari posisi bola tendangan bebas.',
        P
      ),
      makePg(
        pjokIxId,
        15,
        'Tendangan bebas langsung dalam sepak bola terjadi ketika...',
        [
          'Tendangan yang diambil dari sudut lapangan',
          'Tendangan yang diambil tanpa rintangan dari pemain lawan',
          'Tendangan yang diambil setelah terjadinya pelanggaran tertentu',
          'Tendangan yang diambil setelah bola keluar dari lapangan',
        ],
        'C',
        'Tendangan bebas langsung diberikan wasit setelah pemain lawan melakukan pelanggaran tertentu di luar kotak penalti.',
        P
      ),
      makePg(
        pjokIxId,
        16,
        'Jika pemain bertahan melakukan pelanggaran di dalam kotak penalti, maka keuntungan bagi tim lawan adalah...',
        [
          'Mendapatkan tendangan bebas',
          'Mendapatkan tendangan sudut',
          'Mendapatkan tendangan gawang',
          'Mendapatkan tendangan penalti',
        ],
        'D',
        'Pelanggaran oleh pemain bertahan di dalam kotak penaltinya sendiri berbuah hukuman tendangan penalti.',
        P
      ),
      makePg(
        pjokIxId,
        17,
        'Pertandingan atau event olahraga bola voli profesional disebut...',
        ['World cup', 'Europa cup', 'Indonesia open', 'Bundes liga cup'],
        'C',
        'Sesuai kunci jawaban pada naskah soal guru (C).',
        P
      ),
      makePg(
        pjokIxId,
        18,
        'Tosser merupakan pemain dalam olahraga, yaitu...',
        ['Bola voli', 'Softball', 'Bulu tangkis', 'Sepak bola'],
        'A',
        'Tosser (setter) adalah pengumpan bola dalam permainan bola voli.',
        P
      ),
      makePg(
        pjokIxId,
        19,
        'Pada permainan bola voli, istilah libero disebut juga...',
        ['Set upper', 'Striker', 'Offensive player', 'Defensive player'],
        'D',
        'Libero adalah pemain spesialis bertahan (defensive player) dalam tim bola voli.',
        P
      ),
      makePg(
        pjokIxId,
        20,
        'Teknik dalam bola voli yang dilakukan setelah gagal melakukan blocking adalah...',
        ['Servis', 'Tip', 'Passing', 'Dig'],
        'D',
        'Dig adalah teknik penyelamatan bola keras hasil smash lawan setelah bola lolos dari bendungan (block).',
        P
      ),
      makePg(
        pjokIxId,
        21,
        'Peran penting dalam permainan bola voli adalah sebagai berikut, kecuali...',
        ['Tosser', 'Defender', 'Jumper', 'Spiker'],
        'C',
        'Posisi resmi dalam bola voli meliputi tosser (setter), spiker (smasher), dan defender/libero; jumper bukan istilah posisi.',
        P
      ),
      makePg(
        pjokIxId,
        22,
        'Tosser dalam permainan bola voli memiliki tugas untuk...',
        ['Smasher', 'Pengumpan bola', 'Lob bola', 'Servis bola'],
        'B',
        'Tosser bertugas mengatur serangan dengan mengumpan bola matang kepada spiker/smasher.',
        P
      ),
      makePg(
        pjokIxId,
        23,
        'Pada waktu melakukan servis, posisi tangan yang akan memukul bola berada di bawah, maka disebut servis...',
        ['Atas', 'Bawah', 'Samping', 'Belakang'],
        'B',
        'Ayunan lengan memukul bola dari arah bawah pinggang disebut servis bawah.',
        P
      ),
      makePg(
        pjokIxId,
        24,
        'Satu regu dalam permainan bola voli memenangkan satu set bila telah mencapai angka...',
        ['25', '15', '21', '11'],
        'A',
        'Dalam sistem rally point bola voli, satu set reguler dimenangkan saat mencapai angka 25 (selisih minimal 2 poin).',
        P
      ),
      makePg(
        pjokIxId,
        25,
        'Posisi 3 pada pemain bola voli, yaitu...',
        ['Smasher', 'Tosser', 'Libero', 'Server'],
        'B',
        'Posisi 3 (tengah depan dekat net) umumnya ditempati oleh pengumpan (tosser) dalam formasi serangan.',
        P
      ),
      makePg(
        pjokIxId,
        26,
        'Pemain yang bertugas memberi umpan kepada penyerang dalam bola voli dinamakan...',
        ['Smasher', 'Tosser', 'Libero', 'Server'],
        'B',
        'Pemain pengumpan dalam bola voli disebut tosser atau setter.',
        P
      ),
      makePg(
        pjokIxId,
        27,
        'Pukulan sajian bola pertama yang dilakukan pada awal permainan bola voli disebut pukulan...',
        ['Servis', 'Smash', 'Passing', 'Block'],
        'A',
        'Servis merupakan pukulan pembuka untuk memulai permainan bola voli.',
        P
      ),
      makePg(
        pjokIxId,
        28,
        'Servis yang bolanya dilambungkan ke atas disebut...',
        ['Tennis servis', 'Servis atas', 'Servis bawah', 'Overhead servis'],
        'C',
        'Sesuai kunci jawaban pada naskah soal guru (C).',
        P
      ),
      makePg(
        pjokIxId,
        29,
        'Induk olahraga permainan bola voli di Indonesia adalah...',
        ['PSSI', 'PTMSI', 'PERBASASI', 'PBVSI'],
        'D',
        'PBVSI adalah singkatan dari Persatuan Bola Voli Seluruh Indonesia.',
        P
      ),
      makePg(
        pjokIxId,
        30,
        'Pemain yang bertugas sebagai penyerang dalam bola voli dinamakan...',
        ['Smasher', 'Tosser', 'Libero', 'Server'],
        'A',
        'Smasher (spiker) bertugas melakukan pukulan keras serangan ke daerah lawan.',
        P
      ),
      makePg(
        pjokIxId,
        31,
        'Gerakan guling depan sering disebut dengan istilah...',
        ['Forward roll', 'Back roll', 'Handspring', 'Headspring'],
        'A',
        'Guling ke depan dalam senam lantai disebut forward roll.',
        P
      ),
      makePg(
        pjokIxId,
        32,
        'Senam dengan menggunakan peti sebagai rintangan termasuk dalam senam...',
        ['Alat', 'Irama', 'Lantai', 'SKJ'],
        'C',
        'Sesuai kunci jawaban pada naskah soal guru (C).',
        P
      ),
      makePg(
        pjokIxId,
        33,
        'Gerakan handstand sangat membutuhkan kekuatan...',
        ['Kaki', 'Tangan', 'Badan', 'Tungkai'],
        'B',
        'Handstand menumpu seluruh berat badan pada kedua telapak tangan sehingga menuntut kekuatan otot lengan dan tangan.',
        P
      ),
      makePg(
        pjokIxId,
        34,
        'Gerakan meloncat dan melentingkan badan di udara membutuhkan...',
        ['Kekuatan kaki', 'Kelenturan', 'Kekuatan badan', 'Ketepatan'],
        'A',
        'Tolakan meloncat ke udara bertumpu utama pada kekuatan otot kaki.',
        P
      ),
      makePg(
        pjokIxId,
        35,
        'Berdiri dengan kepala dalam senam lantai disebut...',
        ['Sikap lilin', 'Headstand', 'Handstand', 'Meroda'],
        'B',
        'Headstand adalah gerakan sikap tegak terbalik bertumpu pada kepala dan kedua tangan.',
        P
      ),
      makePg(
        pjokIxId,
        36,
        'Senam pertama kali diperkenalkan pada zaman...',
        ['Yunani kuno', 'Prasejarah', 'Babilonia', 'Persia kuno'],
        'A',
        'Senam (gymnastics) mulai berkembang sejak zaman Yunani Kuno.',
        P
      ),
      makePg(
        pjokIxId,
        37,
        'Senam yang membutuhkan gerakan keseimbangan, kekuatan, dan kelentukan adalah senam...',
        ['Lantai', 'Irama', 'Kebugaran jasmani', 'Senam pagi'],
        'A',
        'Senam lantai memadukan unsur keseimbangan, kekuatan, ketangkasan, dan kelentukan tubuh.',
        P
      ),
      makePg(
        pjokIxId,
        38,
        'Fungsi senam lantai adalah...',
        [
          'Melatih keseimbangan',
          'Melatih kecepatan',
          'Pembentukan otot perut',
          'Pembentukan otot kaki',
        ],
        'A',
        'Berbagai gerakan senam lantai berfungsi utama melatih keseimbangan, kelenturan, dan koordinasi tubuh.',
        P
      ),
      makePg(
        pjokIxId,
        39,
        'Nama induk organisasi senam Indonesia adalah...',
        ['PSSI', 'PRSI', 'PERSANI', 'IAG'],
        'C',
        'PERSANI adalah Persatuan Senam Indonesia.',
        P
      ),
      makePg(
        pjokIxId,
        40,
        'Senam kebugaran pada kekuatan otot lengan dan otot dada adalah latihan...',
        ['Sit up', 'Pull up', 'Squat jump', 'Back up'],
        'B',
        'Pull up melatih kekuatan otot lengan, bahu, dan tubuh bagian atas.',
        P
      ),
    ],
    [pktViiId]: [
      makePg(
        pktViiId,
        1,
        'Tanggung jawab manusia terhadap kemampuan yang dianugerahi Allah adalah dengan cara...',
        [
          'Memahaminya dengan benar',
          'Mengakuinya dengan baik',
          'Mengembangkannya secara bertanggung jawab',
          'Menjalankan kehendak-Nya',
        ],
        'C',
        'Talenta dan kemampuan anugerah Allah wajib dikembangkan secara tekun dan bertanggung jawab.',
        P
      ),
      makePg(
        pktViiId,
        2,
        'Allah menempatkan manusia pertama di taman...',
        ['Taman Firdaus', 'Taman Getsemani', 'Bukit Zaitun', 'Taman Vatikan'],
        'A',
        'Allah menempatkan Adam dan Hawa di Taman Firdaus (Taman Eden).',
        P
      ),
      makePg(
        pktViiId,
        3,
        'Tindakan manusia yang mencerminkan diri sebagai citra Allah adalah...',
        [
          'Merenungkan segala kebaikan',
          'Membaca buku cerita',
          'Merenungkan segala kekurangan',
          'Memberi makan orang yang lapar',
        ],
        'D',
        'Tindakan kasih nyata seperti memberi makan sesama yang lapar mencerminkan diri sebagai citra Allah.',
        P
      ),
      makePg(
        pktViiId,
        4,
        'Perbedaan antara manusia dengan makhluk hidup ciptaan Tuhan yang lain adalah...',
        [
          'Dapat tumbuh dan berkembang',
          'Mempunyai naluri',
          'Membutuhkan makanan untuk hidup',
          'Memiliki akal budi dan kehendak',
        ],
        'D',
        'Manusia dianugerahi akal budi, hati nurani, dan kehendak bebas yang membedakannya dari ciptaan lain.',
        P
      ),
      makePg(
        pktViiId,
        5,
        'Perbuatan berikut yang tidak sesuai dengan martabat manusia sebagai citra Allah adalah...',
        [
          'Mengunjungi orang yang telah menyakitinya di rumah sakit',
          'Mendoakan orang yang telah membencinya',
          'Berteman dengan orang yang berbeda agama',
          'Membuang sampah di sembarangan tempat',
        ],
        'D',
        'Membuang sampah sembarangan merusak ciptaan Tuhan dan tidak mencerminkan tanggung jawab citra Allah.',
        P
      ),
      makePg(
        pktViiId,
        6,
        'Tujuan Allah menciptakan manusia di bumi adalah...',
        [
          'Ikut serta dalam karya penciptaan Allah',
          'Ikut menciptakan seperti Allah',
          'Menikmati ciptaan Allah di dunia ini',
          'Menguasai semua ciptaan Tuhan',
        ],
        'A',
        'Allah memanggil manusia untuk bekerja sama memelihara serta melanjutkan karya penciptaan-Nya.',
        P
      ),
      makePg(
        pktViiId,
        7,
        'Menurut Kej. 1: 26-28, manusia berkuasa atas..., kecuali',
        [
          'Manusia yang lain',
          'Burung-burung di udara',
          'Ikan-ikan di laut',
          'Binatang merayap di bumi',
        ],
        'A',
        'Allah memberi manusia kuasa atas ikan, burung, dan binatang di bumi, bukan untuk menindas sesama manusia.',
        P
      ),
      makePg(
        pktViiId,
        8,
        'Berikut perbuatan manusia, yang tidak mencerminkan citra Allah yang diberi kuasa atas bumi ini, yaitu...',
        [
          'Menanam dan merawat pohon',
          'Memakan buah-buahan yang enak',
          'Menangkap ikan dengan bahan peledak',
          'Ikut serta menjaga kelestarian alam di sekitarnya',
        ],
        'C',
        'Menangkap ikan memakai bahan peledak merusak ekosistem dan bertentangan dengan tugas menjaga alam.',
        P
      ),
      makePg(
        pktViiId,
        9,
        'Berikut perbuatan yang bukan merupakan konsekuensi sebagai citra Allah adalah saling...',
        ['Mengasihi', 'Menghormati', 'Bekerjasama', 'Membunuh'],
        'D',
        'Membunuh merusak martabat hidup manusia dan bertentangan dengan citra Allah yang penuh kasih.',
        P
      ),
      makePg(
        pktViiId,
        10,
        'Istilah "Citra" biasanya dikaitkan dengan suatu nilai yang dianggap baik berupa...',
        [
          'Tindakan, sifat atau karakter',
          'Perasaan positif-negatif',
          'Relasi-hobi',
          'Gaya',
        ],
        'A',
        'Citra mencerminkan sifat, karakter, dan tindakan baik yang memancarkan gambaran Allah.',
        P
      ),
      makePg(
        pktViiId,
        11,
        'Allah menciptakan manusia secitra dengan-Nya, sehingga manusia mempunyai tugas...',
        [
          'Melaksanakan kehendak Allah sesukanya',
          'Melaksanakan kehendak Allah dengan segala konsekuensinya',
          'Selalu mengingat kebaikan Allah',
          'Menceritakan kebaikan-kebaikan Allah',
        ],
        'B',
        'Manusia sebagai citra Allah dipanggil setia menjalankan kehendak-Nya beserta segala tanggung jawabnya.',
        P
      ),
      makePg(
        pktViiId,
        12,
        'Manusia sebagai makhluk yang diciptakan secitra dengan Allah mampu menampilkan kecitraan tersebut melalui...',
        [
          'Pemberontakan dan ketidakpuasan',
          'Keberanian dalam bertindak',
          'Kata dan perbuatan yang sopan',
          'Demonstrasi dan reformasi',
        ],
        'C',
        'Kecitraan dengan Allah tampak dalam tutur kata yang santun dan perbuatan baik sehari-hari.',
        P
      ),
      makePg(
        pktViiId,
        13,
        'Manusia dipanggil oleh Allah untuk memelihara dunia yang telah diciptakan-Nya dengan...',
        [
          'Keinginan dan kebahagiaan sendiri',
          'Kehendak Allah sehingga semua orang merasakan kebahagiaan yang adil dan damai',
          'Keinginan kelompok-kelompok yang kuat saja',
          'Taraf pendidikan yang tinggi',
        ],
        'B',
        'Memelihara dunia harus selaras dengan kehendak Allah demi keadilan dan damai sejahtera bersama.',
        P
      ),
      makePg(
        pktViiId,
        14,
        'Kelebihan manusia sebagai makhluk ciptaan Tuhan...',
        ['Dapat berkembang biak', 'Bisa berbicara', 'Mempunyai nafsu', 'Memiliki akal budi'],
        'D',
        'Akal budi memampukan manusia berpikir, menimbang moral, dan mengenal Tuhan.',
        P
      ),
      makePg(
        pktViiId,
        15,
        'Berikut adalah contoh tindakan manusia yang sesuai dengan statusnya sebagai citra Allah...',
        [
          'Menolong nenek yang memiliki cucu cantik',
          'Membakar hutan dan membuat perkebunan baru',
          'Mau berdonor darah jika ada bayarannya',
          'Menolak ajakan teman untuk menyontek saat ujian semester',
        ],
        'D',
        'Menjunjung kejujuran dengan menolak menyontek mencerminkan martabat luhur sebagai citra Allah.',
        P
      ),
      makePg(
        pktViiId,
        16,
        'Akibat tindakan manusia yang tidak mencerminkan sebagai citra Allah, bukan hanya menghancurkan martabat manusia di masanya, tetapi juga menghancurkan...',
        ['Tumbuh-tumbuhan', 'Binatang', 'Sumber alam', 'Generasi mendatang'],
        'D',
        'Kerusakan moral dan lingkungan akan berdampak buruk bagi kehidupan generasi mendatang.',
        P
      ),
      makePg(
        pktViiId,
        17,
        'Manusia diciptakan sebagai makhluk yang tidak bisa hidup sendiri dan selalu membutuhkan orang lain. Maka manusia juga disebut makhluk...',
        ['Makhluk sosial', 'Makhluk kreatif', 'Makhluk pemalas', 'Makhluk hidup'],
        'A',
        'Manusia adalah makhluk sosial yang membutuhkan relasi dan bantuan sesamanya.',
        P
      ),
      makePg(
        pktViiId,
        18,
        'Dokumen Gereja yang mengatakan bahwa manusia dipanggil untuk membangun relasi dengan Sang Pencipta, yaitu dokumen...',
        ['Gaudium et Spes', 'Nostra Aetate', 'Lumen Gentium', 'Humanae Vitae'],
        'A',
        'Konstitusi Pastoral Gaudium et Spes menegaskan panggilan manusia membangun relasi dengan Allah dan sesama.',
        P
      ),
      makePg(
        pktViiId,
        19,
        'Sebagai pelajar, usaha yang dapat Anda lakukan untuk mengembangkan talenta yang dianugerahkan Tuhan adalah...',
        [
          'Memahami dan berpikir keras',
          'Berusaha mengembangkannya dengan berlatih, belajar tanpa putus asa',
          'Menyimpan kemampuan tersebut',
          'Memberitahukannya kepada orang tua dan guru',
        ],
        'B',
        'Talenta berkembang lewat latihan rutin dan semangat belajar yang pantang menyerah.',
        P
      ),
      makePg(
        pktViiId,
        20,
        'Perumpamaan tentang talenta yang berbeda-beda mau menjelaskan...',
        ['Kerajaan Allah', 'Kemampuan manusia', 'Keterbatasan', 'Kekacauan pikiran'],
        'B',
        'Perumpamaan talenta menggambarkan keragaman kemampuan yang diberikan Tuhan kepada setiap manusia untuk dikembangkan.',
        P
      ),
      makePg(
        pktViiId,
        21,
        'Adanya perbedaan kemampuan, fisik maupun talenta antara manusia yang satu dengan manusia yang lainnya, menunjukkan bahwa manusia itu...',
        ['Makhluk yang berkuasa', 'Pribadi yang unik', 'Makhluk yang baik', 'Pribadi yang mandiri'],
        'B',
        'Setiap manusia diciptakan sebagai pribadi yang unik dan istimewa dengan kekhasannya masing-masing.',
        P
      ),
      makePg(
        pktViiId,
        22,
        'Mensyukuri diri sebagai laki-laki dan perempuan dilakukan dengan cara...',
        [
          'Mengembangkan kepribadian sebagai laki-laki dan perempuan dengan maksimal',
          'Mengolah kelebihan',
          'Menguasai kemampuan dan keunikan',
          'Membayar kebaikan dan keterampilan',
        ],
        'A',
        'Rasa syukur atas jati diri diwujudkan dengan mengembangkan kepribadian secara utuh dan positif.',
        P
      ),
      makePg(
        pktViiId,
        23,
        'Menjadi seorang laki-laki atau perempuan adalah...',
        ['Pilihan sendiri', 'Program orang tua', 'Anugerah Allah', 'Program pemerintah'],
        'C',
        'Kodrat sebagai laki-laki atau perempuan merupakan anugerah luhur dari Allah Sang Pencipta.',
        P
      ),
      makePg(
        pktViiId,
        24,
        'Faktor yang tidak termasuk usaha mengembangkan talenta adalah...',
        [
          'Berani mencoba tanpa takut gagal',
          'Merasa sudah puas dengan keadaannya',
          'Percaya diri',
          'Siap membantu siapa pun yang membutuhkan',
        ],
        'B',
        'Cepat merasa puas menghambat seseorang untuk terus berlatih dan mengembangkan talentanya.',
        P
      ),
      makePg(
        pktViiId,
        25,
        'Kemampuan yang berbeda-beda, yang dimiliki manusia, yang membuat mereka unik satu sama lain merupakan...',
        ['Keinginan dirinya', 'Kehendak orang tua', 'Keinginan teman', 'Kehendak Allah'],
        'D',
        'Keberagaman kemampuan pada setiap pribadi terjadi atas kehendak dan kebijaksanaan Allah.',
        P
      ),
      makePg(
        pktViiId,
        26,
        'Laki-laki dan perempuan diciptakan oleh Allah berarti mereka mempunyai...',
        ['Martabat yang sama', 'Tugas yang sama', 'Fungsi yang sama', 'Anugerah yang sama'],
        'A',
        'Keduanya diciptakan secitra dengan Allah sehingga memiliki derajat dan martabat yang sederajat.',
        P
      ),
      makePg(
        pktViiId,
        27,
        'Yang menjadi pendidik yang pertama dan utama dalam keluarga adalah...',
        ['Saudara dan saudari', 'Orang tua', 'Keluarga terdekat', 'Para guru'],
        'B',
        'Orang tua memegang peran sebagai pendidik pertama dan utama bagi anak-anaknya dalam iman dan karakter.',
        P
      ),
      makePg(
        pktViiId,
        28,
        'Tanggung jawab anak sebagai pelajar di sekolah adalah...',
        [
          'Mendengar teman yang sedang ngobrol',
          'Mendengar pelajaran dengan tekun dan tenang',
          'Main games sembunyi-sembunyi',
          'Berdoa supaya dapat nilai plus',
        ],
        'B',
        'Pelajar bertanggung jawab mengikuti pembelajaran dengan tekun, tenang, dan penuh hormat.',
        P
      ),
      makePg(
        pktViiId,
        29,
        'Sebagai anggota Gereja dan masyarakat sebaiknya kita perlu...',
        [
          'Ikut menolong kalau dibutuhkan',
          'Mengulur-ngulur waktu dalam bekerja',
          'Tertutup pada kegiatan masyarakat lingkungan',
          'Ikut terlibat dalam hidup bersama',
        ],
        'D',
        'Umat Katolik dipanggil aktif terlibat membangun kehidupan bersama di Gereja maupun masyarakat.',
        P
      ),
      makePg(
        pktViiId,
        30,
        'Yang disebut sebagai keluarga adalah...',
        [
          'Orang tua, nenek dan paman',
          'Anak, nenek dan orang tua',
          'Bapak, Ibu dan anak',
          'Kakek, nenek, orang tua dan anak',
        ],
        'C',
        'Keluarga inti terdiri atas ayah (bapak), ibu, dan anak.',
        P
      ),
      makePg(
        pktViiId,
        31,
        'Hidup kita tidak terlepas dari peranan orang lain, oleh karena itu kita sebaiknya...',
        [
          'Berdoa untuk diri sendiri',
          'Rajin berdoa agar sehat',
          'Mensyukuri kehadiran orang lain',
          'Tidak perlu berteman',
        ],
        'C',
        'Kita patut bersyukur atas kehadiran dan peran sesama yang menopang kehidupan kita.',
        P
      ),
      makePg(
        pktViiId,
        32,
        'Fungsi sekolah bagi seorang siswa adalah...',
        ['Tempat bermain', 'Tempat istirahat', 'Tempat berkumpul', 'Tempat belajar'],
        'D',
        'Sekolah terutama berfungsi sebagai tempat belajar menimba ilmu dan membentuk karakter.',
        P
      ),
      makePg(
        pktViiId,
        33,
        'Doa yang diajarkan oleh Yesus adalah...',
        ['Doa Salam Maria', 'Doa Bapa Kami', 'Doa Kemuliaan', 'Doa permohonan'],
        'B',
        'Yesus secara langsung mengajarkan Doa Bapa Kami kepada para murid-Nya.',
        P
      ),
      makePg(
        pktViiId,
        34,
        'Dalam Gereja Katolik ada Perintah Allah. Berapa jumlahnya...',
        ['5 Perintah', '15 Perintah', '20 Perintah', '10 Perintah'],
        'D',
        'Dalam tradisi iman Katolik dikenal Sepuluh Perintah Allah (Dasatitah).',
        P
      ),
      makePg(
        pktViiId,
        35,
        'Orang Katolik menghormati Bunda Maria secara khusus pada bulan...',
        ['Mei dan Oktober', 'Januari dan Mei', 'Oktober dan Desember', 'Juni dan Juli'],
        'A',
        'Dalam tradisi Gereja Katolik, bulan Mei dikenal sebagai bulan Maria dan Oktober sebagai bulan Rosario.',
        P
      ),
      makePg(
        pktViiId,
        36,
        'Hari kelahiran Yesus Kristus dirayakan pada hari...',
        ['Paskah', 'Pentakosta', 'Natal', 'Epifani'],
        'C',
        'Hari Raya Natal memperingati kelahiran Yesus Kristus Sang Juru Selamat.',
        P
      ),
      makePg(
        pktViiId,
        37,
        'Allah menciptakan Hawa untuk menemani Adam. Hawa diciptakan dari tulang... Adam',
        ['Rusuk', 'Paha', 'Punggung', 'Kaki'],
        'A',
        'Dalam kisah penciptaan Kitab Kejadian, Hawa dibentuk dari tulang rusuk Adam.',
        P
      ),
      makePg(
        pktViiId,
        38,
        'Keterbatasan kelompok atau masyarakat mengubah pandangan dan kebiasaan disebut keterbatasan...',
        ['Sistem budaya', 'Psikologis', 'Intelektual', 'Fisik'],
        'A',
        'Hambatan yang berasal dari tradisi, kebiasaan, dan cara pandang kelompok termasuk keterbatasan sistem budaya.',
        P
      ),
      makePg(
        pktViiId,
        39,
        'Berikut yang bukan keterbatasan fisik yaitu...',
        ['Lambat berpikir', 'Buta', 'Tuli', 'Bisu'],
        'A',
        'Lambat berpikir tergolong keterbatasan intelektual/kognitif, bukan keterbatasan fisik.',
        P
      ),
      makePg(
        pktViiId,
        40,
        'Sebelum masa Natal kita memasuki masa adven. Apa arti adven...',
        ['Penantian', 'Memimpin', 'Menyelamatkan', 'Berwenang'],
        'A',
        'Adven (adventus) berarti kedatangan atau masa penantian penuh harap menyambut kedatangan Kristus.',
        P
      ),
    ],
    [pktViiiId]: [
      makePg(
        pktViiiId,
        1,
        'Yesus menyelamatkan semua orang, terutama bagi mereka yang...',
        ['Pandai dan terpelajar', 'Taat dan patuh', 'Miskin & menderita', 'Memiliki harta'],
        'C',
        'Dalam karya-Nya, Yesus memberi perhatian khusus kepada kaum miskin, lemah, dan menderita.',
        P
      ),
      makePg(
        pktViiiId,
        2,
        'Orang yang telah mengucapkan janji baptis dan dibaptis, berarti tanda dia sudah...',
        ['Pertobatan', 'Pengorbanan', 'Perjanjian', 'Kesuksesan'],
        'A',
        'Sakramen Baptis menandai pertobatan dan kelahiran baru sebagai murid Kristus.',
        P
      ),
      makePg(
        pktViiiId,
        3,
        'Malaikat berpesan kepada Maria agar anaknya nanti apabila sudah lahir...',
        [
          'Dipersembahkan kepada imam',
          'Diberi nama Yesus, dan menjadi penyelamat',
          'Supaya diberikan kepada Elisabeth',
          'Disatukan dengan Yohanes Pembaptis',
        ],
        'B',
        'Malaikat Gabriel menyampaikan agar anak itu dinamai Yesus karena Ia akan menyelamatkan umat-Nya.',
        P
      ),
      makePg(
        pktViiiId,
        4,
        'Dalam Perjanjian Lama, janji Allah ditandai dengan gejala alam berupa pelangi, yang mengisyaratkan...',
        [
          'Kekuasaan Allah yang luar biasa',
          'Allah mencintai manusia dan menginginkan manusia hidup selamat',
          'Adanya hubungan yang baik antara surga-bumi',
          'Adanya rahmat tersembunyi dalam diri Yesus',
        ],
        'B',
        'Pelangi setelah air bah zaman Nuh menjadi tanda kasih dan kesetiaan Allah menyelamatkan manusia.',
        P
      ),
      makePg(
        pktViiiId,
        5,
        'Orang yang mengikuti kehendak Allah sering menemukan... namun siapa yang bertahan akan diselamatkan',
        ['Dukungan', 'Pujian', 'Saudara', 'Risiko - cobaan'],
        'D',
        'Mengikuti kehendak Allah kerap menghadapi risiko dan cobaan, tetapi kesetiaan membawa keselamatan.',
        P
      ),
      makePg(
        pktViiiId,
        6,
        'Yesus menyebut kita sebagai sahabat-Nya apabila mau...',
        [
          'Berkorban untuk guru',
          'Melaksanakan kehendak Bapa',
          'Mendalami Injil',
          'Menghafal Kitab Suci',
        ],
        'B',
        'Yesus memanggil kita sahabat-Nya apabila kita setia melakukan perintah dan kehendak Bapa.',
        P
      ),
      makePg(
        pktViiiId,
        7,
        'Yesus pernah mewartakan bahwa diri-Nya adalah pemenuhan janji Allah yang diwartakan lewat perumpamaan tentang...',
        [
          'Domba yang hilang',
          'Garam dan terang dunia',
          'Seorang penabur',
          'Penggarap kebun anggur',
        ],
        'D',
        'Melalui perumpamaan penggarap kebun anggur, Yesus menegaskan perutusan Sang Putra sebagai pemenuhan janji Allah.',
        P
      ),
      makePg(
        pktViiiId,
        8,
        'Para nabi dipakai Allah untuk...',
        [
          'Menyampaikan Firman Allah',
          'Menyatukan Firman Allah',
          'Menyampaikan korban persembahan',
          'Mengajarkan hukum kemasyarakatan',
        ],
        'A',
        'Nabi adalah utusan Allah yang dipanggil menyampaikan sabda dan kehendak-Nya kepada umat.',
        P
      ),
      makePg(
        pktViiiId,
        9,
        'Janji Allah yang telah dimulai sejak zaman nabi terpenuhi dalam diri...',
        ['Santo dan Santa', 'Para Martir', 'Yesus Kristus', 'Bapa Bangsa'],
        'C',
        'Seluruh nubuat dan janji keselamatan Allah dalam Perjanjian Lama digenapi dalam diri Yesus Kristus.',
        P
      ),
      makePg(
        pktViiiId,
        10,
        'Inti dan pokok pewartaan dan tindakan Yesus adalah...',
        ['Kebahagiaan', 'Hidup enak', 'Kerajaan Allah', 'Surga'],
        'C',
        'Kerajaan Allah adalah pusat seluruh sabda, perumpamaan, dan mukjizat Yesus.',
        P
      ),
      makePg(
        pktViiiId,
        11,
        'Kerajaan Allah diperuntukkan bagi...',
        ['Orang benar', 'Para imam', 'Kaum miskin', 'Seluruh umat manusia'],
        'D',
        'Warta keselamatan Kerajaan Allah terbuka bagi semua orang tanpa terkecuali.',
        P
      ),
      makePg(
        pktViiiId,
        12,
        'Allah merajai hidup manusia untuk...',
        ['Berkuasa', 'Menyelamatkan manusia', 'Memimpin', 'Berwenang'],
        'B',
        'Kerajaan Allah berarti Allah hadir merajai hidup manusia untuk membawa keselamatan dan damai.',
        P
      ),
      makePg(
        pktViiiId,
        13,
        'Yesus menggunakan perumpamaan dengan maksud...',
        [
          'Menjadi lebih pintar',
          'Agar pewartaan dan ajaran-Nya mudah dimengerti',
          'Membuat cerita lebih seru',
          'Agar lebih menarik',
        ],
        'B',
        'Perumpamaan memakai kisah sehari-hari agar masyarakat mudah memahami makna Kerajaan Allah.',
        P
      ),
      makePg(
        pktViiiId,
        14,
        'Dasar dan motif Yesus mengadakan mukjizat...',
        [
          'Pembenaran',
          'Kekuasaan mutlak',
          'Kepuasan para murid',
          'Pemberitaan tentang Kerajaan Allah',
        ],
        'D',
        'Mukjizat Yesus merupakan tanda nyata kehadiran dan pewartaan Kerajaan Allah yang menyelamatkan.',
        P
      ),
      makePg(
        pktViiiId,
        15,
        'Orang yang baik dan benar apabila sudah berjanji, maka harus...',
        [
          'Menepati janjinya dengan baik dan penuh syukur',
          'Mencari korban untuk memenuhi janjinya',
          'Memikirkan dan merenungkan kebaikannya',
          'Menghapus apa yang sudah pernah diucapkan',
        ],
        'A',
        'Menepati janji menunjukkan kesetiaan dan tanggung jawab moral sebagai pengikut Kristus.',
        P
      ),
      makePg(
        pktViiiId,
        16,
        'Janji yang baik adalah janji yang diucapkan dengan serius, penuh kesadaran dan...',
        ['Sakral', 'Keramaian', 'Menegangkan', 'Hiruk pikuk'],
        'A',
        'Janji sejati diucapkan secara sadar, tulus, dan bersifat sakral di hadapan Tuhan dan sesama.',
        P
      ),
      makePg(
        pktViiiId,
        17,
        'Dalam Kitab Suci, janji Allah pada manusia telah dinubuatkan oleh...',
        ['Imam', 'Raja', 'Nabi-nabi', 'Hakim'],
        'C',
        'Para nabi dalam Perjanjian Lama menubuatkan kedatangan Mesias sebagai penggenapan janji Allah.',
        P
      ),
      makePg(
        pktViiiId,
        18,
        'Sebelum meninggalkan dunia, Tuhan Yesus telah berjanji akan memberikan sesuatu kepada para murid-Nya yaitu...',
        [
          'Sawah, ladang yang subur dan makmur',
          'Raja yang sangat memperhatikan rakyatnya',
          'Sahabat yang baik dan benar',
          'Roh Kudus sebagai pembimbing hidup manusia',
        ],
        'D',
        'Yesus menjanjikan pengutusan Roh Kudus (Penolong) untuk membimbing para murid-Nya.',
        P
      ),
      makePg(
        pktViiiId,
        19,
        'Pemenuhan janji Allah dalam diri Yesus ditulis dalam Kitab Suci...',
        ['Perjanjian Lama', '10 Perintah Allah', 'Perjanjian Baru', 'Hukum Taurat'],
        'C',
        'Karya penyelamatan dan penggenapan janji Allah dalam diri Yesus Kristus dicatat dalam Perjanjian Baru.',
        P
      ),
      makePg(
        pktViiiId,
        20,
        'Alasan Allah ingin solider dengan manusia adalah...',
        [
          'Dia ingin menguasai manusia',
          'Ingin menunjukkan kehebatan-Nya',
          'Allah memberikan kebebasan kepada manusia',
          'Ingin mengalami suka-duka seperti yang dialami manusia',
        ],
        'D',
        'Melalui inkarnasi Yesus, Allah solider dengan manusia dan turut merasakan suka-duka hidup manusia.',
        P
      ),
      makePg(
        pktViiiId,
        21,
        'Yesus memanggil murid-murid-Nya untuk...',
        [
          'Tinggal dan hidup bersama-Nya',
          'Mewartakan Sabda Tuhan',
          'Menyembuhkan orang sakit',
          'Merayakan hari sabat',
        ],
        'A',
        'Yesus memanggil para murid agar tinggal bersama-Nya sebelum diutus mewartakan Kabar Gembira.',
        P
      ),
      makePg(
        pktViiiId,
        22,
        'Tuhan memberikan talenta kepada setiap orang agar digunakan demi...',
        ['Kesenangan hati', 'Kemuliaan-Nya', 'Penebusan dosa', 'Kesenangannya sendiri'],
        'B',
        'Talenta dikembangkan untuk melayani sesama dan memuliakan nama Tuhan.',
        P
      ),
      makePg(
        pktViiiId,
        23,
        'Setiap orang dipanggil untuk mengabdi Tuhan secara khusus, yaitu dalam...',
        [
          'Dalam setiap pekerjaan mereka',
          'Dalam keluarga sendiri',
          'Dalam masyarakat',
          'Dalam diri sendiri',
        ],
        'A',
        'Setiap orang dapat mengabdi kepada Tuhan melalui kesetiaan dalam panggilan hidup dan pekerjaannya.',
        P
      ),
      makePg(
        pktViiiId,
        24,
        'Mengikuti Yesus berarti...',
        [
          'Percaya sepenuhnya kepada Dia yang memanggil kita',
          'Yakin bahwa panggilan itu sungguh mulia',
          'Siap untuk mengikuti-Nya melalui jalan salib – kemuliaan',
          'Mencontoh semangat Yesus selama hidup-Nya',
        ],
        'C',
        'Mengikuti Yesus menuntut kesediaan memanggul salib perjuangan menuju kemuliaan bersama-Nya.',
        P
      ),
      makePg(
        pktViiiId,
        25,
        'Mengikuti Yesus bukan semata-mata usaha manusia, melainkan...',
        [
          'Karya Roh Kristus yang membentuk orang beriman menurut Kristus',
          'Jasa orang tua kita',
          'Berkat ajaran guru agama yang telah kita terima',
          'Hasil dari Gereja berkat perayaan ekaristi',
        ],
        'A',
        'Iman dan kesetiaan mengikuti Yesus merupakan buah karya Roh Kudus dalam diri orang beriman.',
        P
      ),
      makePg(
        pktViiiId,
        26,
        'Mukjizat adalah perbuatan yang luar biasa. Alasan Tuhan Yesus membuat mukjizat adalah karena Tuhan Yesus...',
        ['Sungguh putera Maria', 'Adalah seorang malaikat', 'Seorang nabi', 'Sungguh Allah'],
        'D',
        'Kuasa mukjizat Yesus menyatakan keallahan-Nya bahwa Ia sungguh Allah yang penuh belas kasih.',
        P
      ),
      makePg(
        pktViiiId,
        27,
        'Allah menghendaki supaya manusia hidup dan selamat. Berita ini berlaku untuk...',
        [
          'Hanya umat keturunan Yahudi',
          'Semua keturunan dan keluarga Yesus',
          'Semua umat manusia tanpa pandang bulu',
          'Hanya umat kristiani saja',
        ],
        'C',
        'Keselamatan Allah bersifat universal bagi seluruh umat manusia tanpa memandang golongan.',
        P
      ),
      makePg(
        pktViiiId,
        28,
        'Yesus melukiskan Kerajaan Allah sebagai Bapa yang memerintah umat-Nya. Allah dianggap sebagai...',
        [
          'Hakim yang menguasai manusia',
          'Sebagai penguasa bangsa Israel',
          'Bapa yang selalu mencintai dan mengampuni',
          'Sebagai saudara Allah yang penuh kasih',
        ],
        'C',
        'Yesus memperkenalkan Allah sebagai Bapa (Abba) yang mahakasih dan selalu siap mengampuni.',
        P
      ),
      makePg(
        pktViiiId,
        29,
        'Setiap manusia menghendaki hidup selamat maka usaha yang hendaknya dilakukan manusia adalah...',
        [
          'Berusaha mencari harta demi keselamatan',
          'Bertobat sebagai manusia lemah dan berdosa',
          'Mengeluh saat jatuh',
          'Protes dan marah bila dihina orang lain',
        ],
        'B',
        'Langkah utama menanggapi tawaran keselamatan Allah adalah bertobat dan membarui diri.',
        P
      ),
      makePg(
        pktViiId,
        30,
        'Salah satu contoh teladan pimpinan yang melayani yang dilakukan Yesus adalah...',
        [
          'Membangkitkan orang mati',
          'Meredakan angin ribut',
          'Mengusir setan',
          'Mencuci kaki para rasul-Nya',
        ],
        'D',
        'Pada Perjamuan Malam Terakhir, Yesus membasuh kaki para murid sebagai teladan kepemimpinan yang melayani.',
        P
      ),
      makePg(
        pktViiiId,
        31,
        'Risiko perjuangan Yesus menegakkan nilai-nilai Kerajaan Allah adalah...',
        ['Derita dan salib', 'Pembunuhan', 'Peperangan', 'Penganiayaan'],
        'A',
        'Kesetiaan Yesus mewartakan Kerajaan Allah harus ditempuh lewat jalan penderitaan dan wafat di kayu salib.',
        P
      ),
      makePg(
        pktViiiId,
        32,
        'Tuhan Yesus pernah menyembuhkan mata orang buta. Apakah profesi orang buta tersebut?',
        ['PNS', 'Seorang gelandangan', 'Pelajar', 'Pegawai Bait Allah'],
        'B',
        'Bartimeus, orang buta yang disembuhkan Yesus di Yerikho, hidup sebagai pengemis/gelandangan di pinggir jalan.',
        P
      ),
      makePg(
        pktViiiId,
        33,
        'Cinta Bunda Maria kepada Puteranya sungguh luar biasa. Salah satu bukti cinta Bunda Maria tersebut adalah...',
        [
          'Marah kepada para rasul saat Yesus diadili',
          'Marah kepada Pontius Pilatus saat Yesus dihukum',
          'Marah kepada Yusuf dari Arimatea',
          'Mengikuti Yesus dalam jalan salib-Nya',
        ],
        'D',
        'Bunda Maria setia mendampingi Yesus di sepanjang jalan salib hingga berdiri di bawah kaki salib-Nya.',
        P
      ),
      makePg(
        pktViiiId,
        34,
        'Berikut adalah contoh pengalaman kemanusiaan Yesus seperti yang dialami semua manusia, yaitu...',
        [
          'Mampu membuat mukjizat yang luar biasa',
          'Lahir dari seorang ibu, bertumbuh dan berkembang',
          'Lahir atas kuasa Roh Kudus',
          'Menguasai dunia dan menebus manusia',
        ],
        'B',
        'Sebagai manusia sejati, Yesus lahir dari rahim Bunda Maria, bertumbuh, dan berkembang seperti manusia lainnya.',
        P
      ),
      makePg(
        pktViiiId,
        35,
        'Allah menciptakan laki-laki dan perempuan adalah sederajat. Tetapi menurut paham Yahudi, perempuan punya kedudukan...',
        [
          'Tidak diperhitungkan dalam kehidupan',
          'Dijunjung tinggi',
          'Lebih tinggi dibandingkan dengan laki-laki',
          'Menguasai laki-laki',
        ],
        'A',
        'Dalam budaya patriarki Yahudi kala itu, kedudukan perempuan kerap dinomorduakan dan kurang diperhitungkan.',
        P
      ),
      makePg(
        pktViiiId,
        36,
        'Yesus Kristus adalah 100% Allah dan sekaligus 100% manusia. Salah satu ciri ke-Allah-an Yesus adalah...',
        [
          'Makan bersama para murid-Nya',
          'Membangkitkan Lazarus yang sudah mati',
          'Menangis saat Lazarus mati',
          'Sedih saat mau ditangkap di taman Getzemani',
        ],
        'B',
        'Membangkitkan Lazarus dari kematian membuktikan kuasa ilahi Yesus sebagai Allah.',
        P
      ),
      makePg(
        pktViiiId,
        37,
        'Kerajaan Allah adalah karunia dari Allah secara cuma-cuma. Maka sikap manusia sebaiknya...',
        [
          'Memperjuangkan dan mengembangkan nilai yang paling tinggi',
          'Menerima apa saja secara pasrah',
          'Berusaha untuk menjadi orang sukses',
          'Menguasai sesama yang lemah',
        ],
        'A',
        'Karunia Kerajaan Allah ditanggapi dengan aktif memperjuangkan nilai kasih, keadilan, dan damai.',
        P
      ),
      makePg(
        pktViiiId,
        38,
        'Kerajaan Allah merupakan sesuatu yang sangat berharga. Yesus mengumpamakannya dengan...',
        ['Anak yang hilang', 'Harta terpendam', 'Domba yang hilang', 'Dirham yang hilang'],
        'B',
        'Dalam perumpamaan harta terpendam di ladang, Kerajaan Allah digambarkan lebih berharga dari segalanya.',
        P
      ),
      makePg(
        pktViiiId,
        39,
        'Allah mewahyukan diri-Nya melalui Putera-Nya yang tercinta. Maka sikap kita terhadap kebaikan Tuhan adalah...',
        [
          'Membiarkan karena merupakan rahasia Allah',
          'Menanggapi dengan iman sepenuh hati',
          'Belajar teologi yang benar',
          'Rajin ke Gereja',
        ],
        'B',
        'Wahyu Allah ditanggapi dengan penyerahan diri dan iman yang teguh sepenuh hati.',
        P
      ),
      makePg(
        pktViiiId,
        40,
        'Tempat Yesus disalibkan bernama...',
        ['Gunung Muria', 'Bukit Golgota', 'Gunung Sinai', 'Gunung Kelud'],
        'B',
        'Yesus disalibkan di Bukit Golgota (tempat tengkorak) di luar tembok Yerusalem.',
        P
      ),
    ],
    [pktIxId]: [
      makePg(
        pktIxId,
        1,
        'Menurut ajaran Gereja, yang menjadi sumber keselamatan sejati adalah...',
        ['Allah Tri Tunggal', 'Para nabi', 'Iptek', 'Harta yang melimpah'],
        'A',
        'Sumber keselamatan sejati dalam iman Katolik berasal dari Allah Tritunggal Mahakudus.',
        P
      ),
      makePg(
        pktIxId,
        2,
        'Allah sungguh sayang pada umat manusia dan menganugerahkan keselamatan yang bersifat...',
        ['Barter', 'Kontrak', 'Cuma-cuma', 'Balas jasa'],
        'C',
        'Keselamatan adalah rahmat dan kasih karunia Allah yang diberikan secara cuma-cuma (gratis).',
        P
      ),
      makePg(
        pktIxId,
        3,
        'Allah menganugerahkan keselamatan kepada semua orang tanpa pandang bulu..., maksudnya adalah...',
        [
          'Hanya untuk orang yang dikasihi-Nya saja',
          'Semua orang tanpa pilih kasih',
          'Orang yang rajin bekerja',
          'Orang yang baik dan suci',
        ],
        'B',
        'Kasih keselamatan Allah berlaku universal bagi semua orang tanpa membeda-bedakan.',
        P
      ),
      makePg(
        pktIxId,
        4,
        'Siapakah yang diutus Allah untuk menyelamatkan manusia...',
        ['Yesus Kristus', 'Petrus', 'Maria', 'Yusuf'],
        'A',
        'Allah mengutus Putra Tunggal-Nya, Yesus Kristus, sebagai Juru Selamat umat manusia.',
        P
      ),
      makePg(
        pktIxId,
        5,
        'Hal yang paling didambakan manusia dari Allah adalah...',
        ['Kehebatan', 'Kekuatan', 'Keselamatan', 'Kemakmuran'],
        'C',
        'Kerinduan terdalam manusia sebagai makhluk beriman adalah memperoleh keselamatan dari Allah.',
        P
      ),
      makePg(
        pktIxId,
        6,
        'Bukti manusia menanggapi tawaran keselamatan dari Allah tampak dalam usaha...',
        [
          'Mau mengikuti dan melaksanakan ajaran Yesus Kristus',
          'Rela belajar agama yang ada',
          'Banyak memiliki ilmu pengetahuan',
          'Memahami budi pekerti dengan baik',
        ],
        'A',
        'Tanggapan iman diwujudkan melalui kesetiaan mengikuti teladan dan ajaran Yesus Kristus.',
        P
      ),
      makePg(
        pktIxId,
        7,
        'Secara khusus, menurut Kitab Suci, siapakah ciptaan Allah yang mendapatkan tawaran tentang keselamatan hidup?...',
        ['Orang Yahudi', 'Orang Kristen', 'Orang Katolik', 'Semua orang di dunia'],
        'A',
        'Sesuai kunci jawaban pada naskah soal guru (A).',
        P
      ),
      makePg(
        pktIxId,
        8,
        'Ungkapan yang benar sebagai orang beriman dalam menanggapi undangan keselamatan Allah adalah...',
        [
          'Menyediakan hidangan yang disukai Allah',
          'Menjual harta dan menyerahkan ke departemen sosial',
          'Berdoa dengan penuh rasa syukur dan terima kasih atas keselamatan Allah',
          'Selalu bertindak simpati terhadap sesama yang kesulitan',
        ],
        'C',
        'Orang beriman menanggapi anugerah keselamatan dengan doa syukur yang tulus kepada Allah.',
        P
      ),
      makePg(
        pktIxId,
        9,
        'Tindakan menolong orang lain atau sesama akan bermanfaat jika didasari oleh...',
        [
          'Sikap pamrih, mengharapkan balasan jika suatu saat dibutuhkan',
          'Kesadaran dari dalam diri untuk berbuat baik bagi orang lain',
          'Balas jasa, supaya tidak ada beban',
          'Supaya mendapat pahala yang berlimpah dari Allah',
        ],
        'B',
        'Pertolongan yang tulus lahir dari kesadaran hati mengasihi sesama tanpa pamrih.',
        P
      ),
      makePg(
        pktIxId,
        10,
        'Keselamatan yang ditawarkan Allah akan berlangsung sampai dengan...',
        ['Wafatnya Yesus', 'Terbentuknya Gereja', 'Turunnya Roh Kudus', 'Akhir zaman'],
        'D',
        'Karya penyelamatan Allah terus berlangsung sepanjang sejarah hingga akhir zaman.',
        P
      ),
      makePg(
        pktIxId,
        11,
        'Keselamatan adalah anugerah Allah yang didambakan setiap manusia. Mengapa?...',
        [
          'Supaya bersatu dengan Allah yang penuh kedamaian',
          'Supaya hidup enak, tidak perlu lagi bekerja keras',
          'Supaya menjadi manusia yang hebat, sakti dan adidaya',
          'Tidak mengalami kematian dunia',
        ],
        'A',
        'Puncak keselamatan sejati adalah persatuan abadi dengan Allah dalam damai sukacita.',
        P
      ),
      makePg(
        pktIxId,
        12,
        'Dalam karya keselamatan, siapakah pribadi yang dipakai Allah untuk mewahyukan diri-Nya kepada manusia?...',
        ['Yohanes Pembaptis', 'Bunda Maria', 'Yesus Kristus Tuhan', 'Para rasul'],
        'C',
        'Yesus Kristus adalah kepenuhan wahyu Allah yang menyatakan kasih Bapa kepada manusia.',
        P
      ),
      makePg(
        pktIxId,
        13,
        'Dalam kehidupan bersama, Gereja menghargai setiap agama dan perbedaan. Tetapi Gereja tetap mewartakan bahwa...',
        [
          'Gereja yang baik dan benar hanya satu, yaitu Katolik',
          'Memberi bantuan kepada semua orang yang membutuhkan',
          'Yesus Kristus adalah jalan, kebenaran dan hidup',
          'Mengusahakan kesucian hidup yang layak',
        ],
        'C',
        'Sambil menghargai agama lain, Gereja setia mewartakan imannya akan Kristus sebagai jalan, kebenaran, dan hidup.',
        P
      ),
      makePg(
        pktIxId,
        14,
        'Sila pertama Pancasila, Ketuhanan Yang Maha Esa, menunjukkan bahwa negara memberi kebebasan kepada warganya untuk...',
        [
          'Membangun tempat ibadah salah satu agama saja',
          'Memberi kebebasan kepada setiap pemeluk agama untuk beribadah sesuai dengan agama dan kepercayaannya',
          'Menyatukan semua keyakinan yang ada',
          'Beribadah harus seizin pemerintah',
        ],
        'B',
        'Negara menjamin kemerdekaan tiap warga negara memeluk dan beribadah menurut agama serta kepercayaannya.',
        P
      ),
      makePg(
        pktIxId,
        15,
        'Semua penganut agama menghendaki hidup dalam situasi damai, tenteram dan membahagiakan. Oleh karena itu semua penganut agama harus mengedepankan...',
        [
          'Menyatukan semua agama menjadi satu saja',
          'Masing-masing agama saling mengorbankan keyakinannya',
          'Semua manusia wajib menghormati perbedaan yang ada',
          'Rajin melaksanakan ibadah agamanya masing-masing',
        ],
        'C',
        'Kerukunan hidup beragama terbangun bila setiap umat saling menghormati perbedaan keyakinan.',
        P
      ),
      makePg(
        pktIxId,
        16,
        'Ciptaan Allah yang segambar dan secitra dengan Allah adalah...',
        ['Tumbuh-tumbuhan', 'Orang hutan', 'Kingkong', 'Manusia'],
        'D',
        'Hanya manusia yang diciptakan menurut gambar dan rupa (citra) Allah.',
        P
      ),
      makePg(
        pktIxId,
        17,
        'Hubungan yang perlu dibangun dalam rangka toleransi antarumat beragama adalah hubungan yang...',
        [
          'Hubungan yang harmonis dengan Tuhan dan sesama',
          'Hubungan antara imam dengan umatnya',
          'Hubungan antar mereka yang memiliki keyakinan yang sama',
          'Hubungan dengan para nabi dan para rasul',
        ],
        'A',
        'Toleransi terwujud melalui relasi yang harmonis kepada Tuhan dan sesama manusia tanpa memandang agama.',
        P
      ),
      makePg(
        pktIxId,
        18,
        'Yesus memilih dari para pengikut-Nya menjadi para rasul sebanyak...',
        ['11 orang', '12 orang', '13 orang', '14 orang'],
        'B',
        'Yesus memilih dua belas rasul untuk menjadi saksi-saksi pewartaan-Nya.',
        P
      ),
      makePg(
        pktIxId,
        19,
        'Sumber keselamatan bagi orang Katolik adalah...',
        ['Yesus Kristus', 'Brahmana', 'Nabi Muhammad', 'Petrus'],
        'A',
        'Bagi umat Katolik, Yesus Kristus adalah Tuhan dan Juru Selamat sumber keselamatan.',
        P
      ),
      makePg(
        pktIxId,
        20,
        'Ketika membawa bangsa Israel menuju tanah terjanji, nabi Musa digantikan oleh...',
        ['Nabi Yesaya', 'Nabi Amos', 'Nabi Nuh', 'Nabi Yosua'],
        'D',
        'Yosua meneruskan kepemimpinan Musa membawa bangsa Israel memasuki Tanah Terjanji.',
        P
      ),
      makePg(
        pktIxId,
        21,
        'Sikap Yesus dalam hidup beragama menurut Kitab Suci adalah...',
        [
          'Menantang hukum Taurat',
          'Menyelamatkan orang benar',
          'Bergaul dengan siapa saja tanpa melihat latar belakang agamanya',
          'Meniadakan hukum Taurat',
        ],
        'C',
        'Yesus terbuka bersahabat dan menolong semua orang tanpa membedakan suku maupun latar belakangnya.',
        P
      ),
      makePg(
        pktIxId,
        22,
        'Hidup beragama menurut orang Farisi dan ahli-ahli Taurat adalah...',
        [
          'Menjalankan Perintah Allah',
          'Menjalankan hukum kasih',
          'Melaksanakan aturan-aturan dalam hukum Taurat dengan ketat',
          'Mementingkan rasa kemanusiaan',
        ],
        'C',
        'Kaum Farisi dan ahli Taurat menekankan pelaksanaan aturan lahiriah hukum Taurat secara sangat ketat.',
        P
      ),
      makePg(
        pktIxId,
        23,
        'Berapa jumlah KTP yang dibutuhkan untuk mendirikan rumah ibadah di suatu wilayah...',
        ['70', '80', '90', '100'],
        'C',
        'Sesuai Peraturan Bersama Menteri, pendirian rumah ibadah mensyaratkan daftar nama dan KTP pengguna paling sedikit 90 orang.',
        P
      ),
      makePg(
        pktIxId,
        24,
        'Paham yang menganggap bahwa agamanya yang paling benar adalah...',
        ['Liberalisme', 'Fanatisme', 'Proselitisme', 'Idealisme'],
        'B',
        'Fanatisme sempit memandang keyakinan sendiri paling benar sambil menutup diri terhadap toleransi.',
        P
      ),
      makePg(
        pktIxId,
        25,
        'Segala sesuatu yang wajib diberikan kepada seseorang berdasarkan martabatnya sebagai manusia disebut...',
        ['Hak', 'Aturan', 'Kewajiban', 'Sumbangan'],
        'A',
        'Hak asasi adalah sesuatu yang layak diterima dan dihormati pada setiap manusia sesuai martabatnya.',
        P
      ),
      makePg(
        pktIxId,
        26,
        'Segala sesuatu yang dibebankan kepada seseorang untuk dilaksanakan disebut...',
        ['Hak', 'Kewajiban', 'Aturan', 'Sumbangan'],
        'B',
        'Kewajiban adalah tugas atau beban tanggung jawab yang harus dilaksanakan seseorang.',
        P
      ),
      makePg(
        pktIxId,
        27,
        'Sifat yang ditimbulkan oleh sikap yang jujur adalah...',
        ['Fanatisme', 'Egoisme', 'Iman yang teguh', 'Damai sejahtera'],
        'D',
        'Kejujuran menghadirkan ketenangan hati, saling percaya, dan damai sejahtera dalam hidup bersama.',
        P
      ),
      makePg(
        pktIxId,
        28,
        'Adil artinya...',
        [
          'Tidak berpegang pada kebenaran',
          'Tidak menutupi kesalahan',
          'Tidak berat sebelah',
          'Berpegang pada hukum',
        ],
        'C',
        'Adil berarti tidak memihak atau tidak berat sebelah serta memberikan sesuai porsi dan haknya.',
        P
      ),
      makePg(
        pktIxId,
        29,
        'Pandangan Gereja tentang beragama dan hidup beragama tertuang dalam dokumen ajaran Gereja yang bernama...',
        [
          'Nostra Aetate',
          'Sacrosanctum Consilium',
          'Gaudium et Spes',
          'Populorum Progressio',
        ],
        'A',
        'Deklarasi Nostra Aetate (Konsili Vatikan II) membahas hubungan Gereja dengan agama-agama bukan Kristen.',
        P
      ),
      makePg(
        pktIxId,
        30,
        'Ajaran, sistem yang mengatur tata keimanan dan peribadatan kepada Tuhan Yang Maha Kuasa serta tata kaidah yang berhubungan dengan pergaulan manusia dan manusia serta lingkungan merupakan definisi dari...',
        ['Wahyu', 'Agama', 'Iman', 'Religi'],
        'B',
        'Agama mencakup sistem tata keimanan, peribadatan kepada Tuhan, serta tata kaidah hubungan antarsesama dan lingkungan.',
        P
      ),
      makePg(
        pktIxId,
        31,
        'Menurut rasul Yakobus, beriman tidak cukup hanya menjadi pendengar saja. Maksud ungkapan rasul Yakobus tersebut adalah...',
        [
          'Iman harus diwujudkan dalam kehidupan konkret',
          'Iman tidak cukup hanya didengarkan sendiri, tetapi disebarluaskan',
          'Iman yang benar harus mendengarkan suara hati',
          'Orang harus belajar mendengarkan suara hati agar imannya teguh',
        ],
        'A',
        'Rasul Yakobus menegaskan bahwa iman tanpa perbuatan nyata pada hakikatnya adalah mati.',
        P
      ),
      makePg(
        pktIxId,
        32,
        'Kita dipanggil menjadi murid Tuhan Yesus. Sebagai murid, pribadi siapakah yang perlu kita teladani?...',
        ['Tuhan Yesus', 'Murid Tuhan Yesus', 'Para rasul', 'Para uskup'],
        'A',
        'Tuhan Yesus Kristus adalah Guru dan teladan utama yang diikuti oleh setiap murid-Nya.',
        P
      ),
      makePg(
        pktIxId,
        33,
        'Setiap orang memiliki persoalan masing-masing. Sebagai orang beriman, sikap kita saat menghadapi persoalan adalah...',
        [
          'Berserah pada Tuhan dan berjuang semaksimal mungkin',
          'Mencari bantuan pada orang pintar',
          'Menghindari setiap masalah',
          'Melaporkan semua persoalan ke aparat kepolisian',
        ],
        'A',
        'Orang beriman menghadapi cobaan dengan berdoa berserah kepada Tuhan disertai usaha maksimal.',
        P
      ),
      makePg(
        pktIxId,
        34,
        'Allah adalah Allah yang Maha Rahim. Ketika manusia berbuat dosa, Allah selalu memberikan...',
        [
          'Hukuman yang setimpal atas perbuatan manusia',
          'Mengirim utusan untuk mengingatkan manusia',
          'Tidak peduli dengan dosa dan kesalahan manusia',
          'Menawarkan pengampunan dan keselamatan dengan cara bertobat',
        ],
        'D',
        'Allah yang Maharahim senantiasa mengampuni dan menyelamatkan pendosa yang mau bertobat.',
        P
      ),
      makePg(
        pktIxId,
        35,
        'Iman memiliki dimensi personal dan sosial. Yang dimaksud dengan dimensi personal adalah...',
        [
          'Urusan iman kita tidak boleh dicampuri orang lain',
          'Iman adalah hubungan pribadi dengan Allah',
          'Iman berhubungan dengan pribadi kita dengan orang lain',
          'Iman adalah urusan saya dengan agama',
        ],
        'B',
        'Dimensi personal iman merujuk pada relasi batin yang akrab antara pribadi manusia dan Allah.',
        P
      ),
      makePg(
        pktIxId,
        36,
        'Menurut iman Katolik, yang dikehendaki Allah terhadap hidup manusia adalah...',
        [
          'Setiap hari, hidup manusia bahagia',
          'Semua orang hidup selamat',
          'Semua orang harus beragama Katolik',
          'Semua orang harus pergi ke tempat ibadah',
        ],
        'B',
        'Kehendak luhur Allah bagi seluruh ciptaan-Nya adalah agar semua manusia beroleh keselamatan.',
        P
      ),
      makePg(
        pktIxId,
        37,
        'Fungsi hutan bagi kehidupan dunia adalah bagaikan... dunia',
        ['Perut', 'Jantung', 'Paru-paru', 'Mata'],
        'C',
        'Hutan menghasilkan oksigen dan menyerap karbon dioksida sehingga disebut paru-paru dunia.',
        P
      ),
      makePg(
        pktIxId,
        38,
        'Sebagai orang beriman, melestarikan hutan berarti...',
        [
          'Pengabdian pada Tuhan',
          'Penyerahan diri pada Tuhan',
          'Berpasrah pada Tuhan',
          'Mengaku Tuhan adalah baik',
        ],
        'A',
        'Menjaga dan melestarikan alam ciptaan merupakan wujud pengabdian dan syukur kepada Tuhan Sang Pencipta.',
        P
      ),
      makePg(
        pktIxId,
        39,
        'Mengapa manusia tidak bisa dipisahkan dari alam... karena',
        [
          'Manusia dilahirkan dari alam',
          'Alam selalu membutuhkan manusia',
          'Alam merupakan bagian dari hidup manusia',
          'Manusia merupakan bagian dari alam',
        ],
        'D',
        'Manusia hidup, bernapas, dan bergantung pada alam sebagai bagian integral dari ciptaan-Nya.',
        P
      ),
      makePg(
        pktIxId,
        40,
        'Berkaitan dengan alam, pencemaran lingkungan digolongkan ke dalam tiga bentuk pencemaran, yaitu...',
        [
          'Udara, tanah dan nama baik',
          'Udara, tanah dan air',
          'Udara, pikiran dan air',
          'Nama baik, pohon dan udara',
        ],
        'B',
        'Tiga jenis utama pencemaran lingkungan fisik adalah pencemaran udara, tanah, dan air.',
        P
      ),
    ],
  };
}
