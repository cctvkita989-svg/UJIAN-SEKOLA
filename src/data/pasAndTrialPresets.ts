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
  };
}
