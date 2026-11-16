import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Exam,
  ExamSession,
  SchoolProfile,
  SubjectItem,
  User,
} from '../types/cbt';

const HEADMASTER_NAME = 'ANWAR SAID, S.Pd, M.M';
const HEADMASTER_NIP = 'NIP. 19711205 199603 1 002';

const KOP_LINES = {
  pemerintah: 'PEMERINTAH KABUPATEN TAPANULI TENGAH',
  dinas: 'DINAS PENDIDIKAN',
  sekolah: 'UPTD SMP NEGERI 1 PANDAN',
  alamat: 'JL. Ki Hajar Dewantara No. 2 Pandan RT/RW:000/000 Kec. pandan Kab. Tapanuli Tengah',
  kontak: 'Prov. Sumatera Utara Telp.0631371664 Fax. 0631371664 Email: smpn1pandan@gmail.com',
};

function savePdfSafely(doc: jsPDF, filename: string): string {
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
      URL.revokeObjectURL(url);
    }, 1500);
  } catch {
    doc.save(safeName);
  }
  return safeName;
}

function drawOfficialKop(
  doc: jsPDF,
  marginX: number,
  topY: number,
  options?: { classBadge?: string; isLandscape?: boolean }
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // Left CBT emblem box
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(marginX, topY, 16, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CBT', marginX + 8, topY + 9.8, { align: 'center' });

  // Optional right Class badge
  if (options?.classBadge) {
    const rightX = pageWidth - marginX - 18;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.roundedRect(rightX, topY, 18, 16, 2, 2, 'S');
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('KELAS', rightX + 9, topY + 5.2, { align: 'center' });
    doc.setTextColor(67, 56, 202);
    doc.setFontSize(10);
    doc.text(options.classBadge, rightX + 9, topY + 12.2, { align: 'center' });
  }

  // Centered Kop Surat lines
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(KOP_LINES.pemerintah, centerX, topY + 3, { align: 'center' });
  doc.text(KOP_LINES.dinas, centerX, topY + 7, { align: 'center' });

  doc.setTextColor(2, 6, 23);
  doc.setFontSize(13.5);
  doc.text(KOP_LINES.sekolah, centerX, topY + 12, { align: 'center' });

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(KOP_LINES.alamat, centerX, topY + 16.5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text(KOP_LINES.kontak, centerX, topY + 20, { align: 'center' });

  // Double border line
  const lineY = topY + 22.5;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(marginX, lineY, pageWidth - marginX, lineY);
  doc.setLineWidth(0.25);
  doc.line(marginX, lineY + 1.1, pageWidth - marginX, lineY + 1.1);

  return lineY + 6;
}

function getLastTableY(doc: jsPDF, fallbackY: number): number {
  const anyDoc = doc as unknown as { lastAutoTable?: { finalY?: number } };
  return anyDoc.lastAutoTable?.finalY ?? fallbackY;
}

function formatDateId(): string {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function sanitizeFilename(s: string): string {
  return (s || 'Dokumen').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
}

// =========================================================================
// 1. DAFTAR NILAI & HASIL EVALUASI SISWA (PDF)
// =========================================================================
export function downloadDaftarNilaiPdf(params: {
  selectedClass: string;
  selectedExam?: Exam;
  classSessions: {
    student: User;
    attendanceStatus: string;
    score: number;
  }[];
  counts: {
    total: number;
    cbt: number;
    written: number;
    sickPermit: number;
    absent: number;
  };
}): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const marginX = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = drawOfficialKop(doc, marginX, 12, { classBadge: params.selectedClass });

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const titleText = 'DAFTAR NILAI & HASIL EVALUASI SISWA';
  doc.text(titleText, pageWidth / 2, y, { align: 'center' });
  const tw = doc.getTextWidth(titleText);
  doc.setLineWidth(0.35);
  doc.line(pageWidth / 2 - tw / 2, y + 1, pageWidth / 2 + tw / 2, y + 1);
  y += 6;

  // Meta Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, pageWidth - marginX * 2, 19, 1.5, 1.5, 'FD');

  doc.setFontSize(8.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const leftLabelX = marginX + 3;
  const leftValX = marginX + 36;
  const rightLabelX = pageWidth / 2 + 4;
  const rightValX = pageWidth / 2 + 37;

  doc.text('Mata Pelajaran', leftLabelX, y + 5.5);
  doc.text('Rombongan Belajar', leftLabelX, y + 10.5);
  doc.text('Guru Mata Pelajaran', leftLabelX, y + 15.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`: ${params.selectedExam?.subject || '-'}`, leftValX, y + 5.5);
  doc.text(`: Kelas ${params.selectedClass}`, leftValX, y + 10.5);
  doc.text(`: ${params.selectedExam?.teacherName || '-'}`, leftValX, y + 15.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Tanggal Pelaksanaan', rightLabelX, y + 5.5);
  doc.text('Waktu & Durasi', rightLabelX, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`: ${formatDateId()}`, rightValX, y + 5.5);
  const timeStr = params.selectedExam
    ? `${params.selectedExam.startTime} - ${params.selectedExam.endTime} WIB (${params.selectedExam.durationMinutes} Menit)`
    : '-';
  doc.text(`: ${timeStr}`, rightValX, y + 10.5);

  y += 23;

  const statusMap: Record<string, string> = {
    cbt: 'Hadir CBT',
    tertulis: 'Ujian Tertulis',
    sakit: 'Sakit',
    izin: 'Izin Resmi',
    absen: 'Absen / Alpa',
  };

  const rows = params.classSessions.map((item, idx) => {
    const isAbsentOrSick =
      item.attendanceStatus === 'sakit' ||
      item.attendanceStatus === 'izin' ||
      item.attendanceStatus === 'absen';
    return [
      String(idx + 1),
      item.student.nisn || '-',
      item.student.name,
      item.student.gender || '-',
      statusMap[item.attendanceStatus] || 'Hadir CBT',
      isAbsentOrSick ? '-' : String(item.score),
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [['No', 'NISN', 'Nama Lengkap Siswa', 'L/P', 'Status Kehadiran', 'Nilai Akhir']],
    body: rows.length > 0 ? rows : [['-', '-', `Tidak ada siswa di kelas ${params.selectedClass}`, '-', '-', '-']],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 26 },
      2: { fontStyle: 'bold' },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 32 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
    },
  });

  y = getLastTableY(doc, y + 20) + 6;

  // Check if summary + signature fits on current page
  if (y + 58 > pageHeight - 12) {
    doc.addPage();
    y = 18;
  }

  // Rekapitulasi Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, y, pageWidth - marginX * 2, 16, 1.5, 1.5, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`REKAPITULASI KEHADIRAN PESERTA UJIAN KELAS ${params.selectedClass}`, marginX + 3, y + 5);

  const summaryItems = [
    `Jumlah Siswa: ${params.counts.total}`,
    `Hadir CBT: ${params.counts.cbt}`,
    `Ujian Tertulis: ${params.counts.written}`,
    `Sakit / Izin: ${params.counts.sickPermit}`,
    `Absen: ${params.counts.absent}`,
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const colStep = (pageWidth - marginX * 2 - 6) / summaryItems.length;
  summaryItems.forEach((txt, i) => {
    doc.text(txt, marginX + 3 + i * colStep, y + 11.5);
  });

  y += 24;

  // 3-Column Signatures
  const colW = (pageWidth - marginX * 2) / 3;
  const sigCenters = [marginX + colW * 0.5, marginX + colW * 1.5, marginX + colW * 2.5];

  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text('Pengawas Ruang Kelas,', sigCenters[0], y, { align: 'center' });
  doc.text('Guru Mata Pelajaran,', sigCenters[1], y, { align: 'center' });
  doc.text('Mengetahui,', sigCenters[2], y - 4, { align: 'center' });
  doc.text('Kepala Sekolah,', sigCenters[2], y, { align: 'center' });

  const nameY = y + 18;
  doc.setFont('helvetica', 'bold');
  doc.text('Budi Santoso, S.Kom', sigCenters[0], nameY, { align: 'center' });
  doc.text(params.selectedExam?.teacherName || 'Guru Pengampu', sigCenters[1], nameY, { align: 'center' });
  doc.text(HEADMASTER_NAME, sigCenters[2], nameY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NIP. 198509122010011015', sigCenters[0], nameY + 4, { align: 'center' });
  doc.text('NIP. 198007202005012009', sigCenters[1], nameY + 4, { align: 'center' });
  doc.text(HEADMASTER_NIP, sigCenters[2], nameY + 4, { align: 'center' });

  const file = `Daftar_Nilai_Kelas_${sanitizeFilename(params.selectedClass)}_${sanitizeFilename(params.selectedExam?.subject || 'Mapel')}.pdf`;
  return savePdfSafely(doc, file);
}

// =========================================================================
// 2. KARTU PESERTA UJIAN MASSAL (UKURAN PRESISI KTP - 2x4 PER HALAMAN A4)
// =========================================================================
export function downloadKartuPesertaPdf(params: {
  selectedClass: string;
  students: User[];
  schoolProfile: SchoolProfile;
}): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const marginX = 12;
  const gapX = 10;
  const gapY = 8;
  const cardW = (doc.internal.pageSize.getWidth() - marginX * 2 - gapX) / 2; // 88mm (Presisi KTP 85.6x54mm ratio)
  const cardH = 56;

  params.students.forEach((st, idx) => {
    const posInPage = idx % 8;
    if (idx > 0 && posInPage === 0) {
      doc.addPage();
    }
    const col = posInPage % 2;
    const row = Math.floor(posInPage / 2);
    const x = marginX + col * (cardW + gapX);
    const y = 14 + row * (cardH + gapY);

    // Card outer border (KTP Rounded Style)
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.45);
    doc.roundedRect(x, y, cardW, cardH, 2.5, 2.5, 'S');

    // Card Header
    doc.setFillColor(15, 23, 42);
    doc.circle(x + 7.5, y + 6.3, 3.8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('CBT', x + 7.5, y + 7.2, { align: 'center' });

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(5.5);
    doc.text('KARTU TANDA PESERTA UJIAN', x + 48, y + 4.3, { align: 'center' });
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.2);
    doc.text(KOP_LINES.sekolah, x + 48, y + 7.5, { align: 'center' });
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.text(`TA ${params.schoolProfile.academicYear} | ${params.schoolProfile.semester}`, x + 48, y + 10.2, { align: 'center' });

    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.35);
    doc.line(x + 2.5, y + 12, x + cardW - 2.5, y + 12);

    // Body details (Tanpa Sesi Ujian)
    const fields: [string, string, boolean?][] = [
      ['No. Peserta', st.nomorPeserta || `U-26-${idx + 1}`, true],
      ['Nama Siswa', st.name, true],
      ['NISN / Kelas', `${st.nisn || '-'} / ${st.kelas || '-'}`, false],
      ['Ruang Lab', st.ruangUjian || `Ruang Kelas ${st.kelas || ''}`, false],
      ['Username', st.username, true],
      ['Password', st.password || 'siswa123', true],
    ];

    let fy = y + 16.5;
    fields.forEach(([label, val, bold]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.setTextColor(100, 116, 139);
      doc.text(label, x + 3.2, fy);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(label === 'Username' ? 67 : 15, label === 'Username' ? 56 : 23, label === 'Username' ? 202 : 42);
      const valLines = doc.splitTextToSize(`: ${val}`, cardW - 40);
      doc.text(valLines[0] || `: ${val}`, x + 19.5, fy);
      fy += 4.3;
    });

    // Foto 2x3 Box on Right (Tanpa Scan QR)
    const photoX = x + cardW - 18.5;
    const photoY = y + 14.5;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.25);
    doc.roundedRect(photoX, photoY, 15, 20, 1, 1, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Pas Foto', photoX + 7.5, photoY + 9.2, { align: 'center' });
    doc.text('2x3', photoX + 7.5, photoY + 12.2, { align: 'center' });

    // Footer divider
    doc.setDrawColor(226, 232, 240);
    doc.line(x + 2.5, y + 41.5, x + cardW - 2.5, y + 41.5);

    doc.setFontSize(5);
    doc.setTextColor(148, 163, 184);
    doc.text('* Harap dibawa saat ujian', x + 3.2, y + 53);

    // Signature Kepala Sekolah (Bottom Right)
    const sigX = x + cardW - 22;
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.text('Kepala Sekolah,', sigX, y + 44.5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.text(HEADMASTER_NAME, sigX, y + 51.2, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.9);
    doc.setTextColor(100, 116, 139);
    doc.text(HEADMASTER_NIP, sigX, y + 53.8, { align: 'center' });
  });

  if (params.students.length === 0) {
    doc.setFontSize(11);
    doc.text(`Tidak ada data siswa di kelas ${params.selectedClass}`, 105, 40, { align: 'center' });
  }

  return savePdfSafely(doc, `Kartu_Peserta_Ujian_Kelas_${sanitizeFilename(params.selectedClass)}.pdf`);
}

// =========================================================================
// 3. DAFTAR HADIR RUANG UJIAN (PDF)
// =========================================================================
export function downloadDaftarHadirPdf(params: {
  selectedClass: string;
  selectedExam?: Exam;
  students: User[];
  counts: {
    total: number;
    cbt: number;
    written: number;
    sickPermit: number;
    absent: number;
  };
  schoolProfile: SchoolProfile;
}): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const marginX = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = drawOfficialKop(doc, marginX, 12);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('DAFTAR HADIR PESERTA ASESMEN / UJIAN CBT', pageWidth / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Tahun Ajaran ${params.schoolProfile.academicYear} - ${params.schoolProfile.semester}`,
    pageWidth / 2,
    y + 4.5,
    { align: 'center' }
  );
  y += 10;

  // Exam details
  doc.setFontSize(8);
  doc.text(`Mata Pelajaran : ${params.selectedExam?.subject || '-'}`, marginX, y);
  doc.text(`Hari, Tanggal : ${formatDateId()}`, pageWidth - marginX, y, { align: 'right' });
  doc.text(`Tingkat / Kelas : ${params.selectedClass}`, marginX, y + 4.5);
  doc.text(
    `Waktu / Sesi : ${params.selectedExam ? `${params.selectedExam.startTime} - ${params.selectedExam.endTime} WIB` : '-'}`,
    pageWidth - marginX,
    y + 4.5,
    { align: 'right' }
  );
  doc.text(`Guru Pengampu : ${params.selectedExam?.teacherName || '-'}`, marginX, y + 9);
  doc.text(
    `Ruang Ujian : ${params.selectedClass === 'ALL' ? 'Ruang Kelas Masing-Masing' : `Ruang Kelas ${params.selectedClass}`}`,
    pageWidth - marginX,
    y + 9,
    { align: 'right' }
  );
  y += 13;

  const rows = params.students.map((st, idx) => [
    String(idx + 1),
    st.nomorPeserta || `U-26-${idx + 1}`,
    st.nisn || '-',
    st.name,
    st.kelas || '-',
    idx % 2 === 0 ? `${idx + 1}. .........` : '',
    idx % 2 !== 0 ? `${idx + 1}. .........` : '',
    '',
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Nomor Peserta', 'NISN', 'Nama Lengkap Peserta', 'Kelas', 'TTD 1', 'TTD 2', 'Ket']],
    body: rows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [30, 41, 59],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9 },
      1: { cellWidth: 27 },
      2: { cellWidth: 23 },
      3: { fontStyle: 'bold' },
      4: { halign: 'center', cellWidth: 14 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
      7: { halign: 'center', cellWidth: 13 },
    },
  });

  y = getLastTableY(doc, y + 20) + 8;
  if (y + 44 > pageHeight - 12) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Rekapitulasi Kehadiran Peserta:', marginX, y);
  doc.setFont('helvetica', 'normal');
  doc.text('- Jumlah Siswa      : .............. orang', marginX, y + 5);
  doc.text('- Hadir Ujian CBT   : .............. orang', marginX, y + 9.5);
  doc.text('- Ujian Tertulis    : .............. orang', marginX, y + 14);
  doc.text('- Sakit / Izin      : .............. orang', marginX, y + 18.5);
  doc.text('- Absen / Alpa      : .............. orang', marginX, y + 23);

  // Keterangan pengisian kolom Ket di footer daftar hadir
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Keterangan Pengisian Kolom Ket:', marginX, y + 29);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const ketPrefix = 'Centang (';
  doc.text(
    `${ketPrefix}   ) jika menggunakan Android, tulisan tangan jika menggunakan ujian tertulis.`,
    marginX,
    y + 33.5
  );
  const cx = marginX + doc.getTextWidth(ketPrefix) + 0.7;
  const cy = y + 32.7;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.35);
  doc.line(cx, cy, cx + 0.8, cy + 0.8);
  doc.line(cx + 0.8, cy + 0.8, cx + 2.1, cy - 1.0);

  const rightSigX = pageWidth - marginX - 30;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.text('Pengawas Ruang Ujian,', rightSigX, y, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(`(${params.selectedExam?.teacherName || 'Pengawas Ruang'})`, rightSigX, y + 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('NIP. 198203152006042008', rightSigX, y + 24, { align: 'center' });

  return savePdfSafely(
    doc,
    `Daftar_Hadir_Ujian_Kelas_${sanitizeFilename(params.selectedClass)}_${sanitizeFilename(params.selectedExam?.subject || 'Mapel')}.pdf`
  );
}

// =========================================================================
// 4. BERITA ACARA PELAKSANAAN (BAP) (PDF)
// =========================================================================
export function downloadBeritaAcaraPdf(params: {
  selectedClass: string;
  selectedExam?: Exam;
  counts: {
    total: number;
    cbt: number;
    written: number;
    sickPermit: number;
    absent: number;
  };
  schoolProfile: SchoolProfile;
}): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const marginX = 16;
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = drawOfficialKop(doc, marginX, 12);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('BERITA ACARA PELAKSANAAN ASESMEN BERBASIS KOMPUTER (CBT)', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const intro = `Pada hari ini, ${formatDateId()}, bertempat di ${KOP_LINES.sekolah}, telah diselenggarakan Asesmen / Ujian CBT untuk:`;
  const introLines = doc.splitTextToSize(intro, pageWidth - marginX * 2);
  doc.text(introLines, marginX, y);
  y += introLines.length * 4.5 + 3;

  // Detail Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, y, pageWidth - marginX * 2, 31, 2, 2, 'FD');
  doc.setFontSize(8.5);
  const details: [string, string][] = [
    ['Mata Pelajaran', params.selectedExam?.subject || '-'],
    ['Kategori Asesmen', `${params.selectedExam?.examCategory || 'PAS'} (${params.schoolProfile.semester})`],
    ['Rombel / Kelas', `Kelas ${params.selectedClass}`],
    [
      'Waktu Pelaksanaan',
      params.selectedExam
        ? `${params.selectedExam.startTime} s.d. ${params.selectedExam.endTime} WIB (Durasi ${params.selectedExam.durationMinutes} Menit)`
        : '-',
    ],
    [
      'Ruang Ujian',
      params.selectedClass === 'ALL' ? 'Ruang Kelas Masing-Masing' : `Ruang Kelas ${params.selectedClass}`,
    ],
  ];
  details.forEach(([k, v], i) => {
    const dy = y + 6 + i * 5.3;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(k, marginX + 4, dy);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`: ${v}`, marginX + 42, dy);
  });
  y += 38;

  // 1. Keadaan Peserta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. Keadaan Peserta Ujian:', marginX, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`- Jumlah Siswa Terdaftar : ${params.counts.total} Orang`, marginX + 5, y);
  doc.text(`- Hadir Ujian CBT        : ${params.counts.cbt} Orang`, marginX + 5, y + 5);
  doc.text(`- Ujian Tertulis         : ${params.counts.written} Orang`, marginX + 5, y + 10);
  doc.text(`- Sakit / Izin           : ${params.counts.sickPermit} Orang`, marginX + 5, y + 15);
  doc.text(`- Absen / Alpa           : ${params.counts.absent} Orang`, marginX + 5, y + 20);
  y += 28;

  // 2. Catatan Kejadian
  doc.setFont('helvetica', 'bold');
  doc.text('2. Catatan Kejadian Selama Ujian:', marginX, y);
  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.rect(marginX, y, pageWidth - marginX * 2, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const noteLines = doc.splitTextToSize(
    'Pelaksanaan ujian berjalan tertib, server proktor lokal berfungsi dengan lancar tanpa hambatan jaringan. Sistem sensor anti-cheat berjalan normal.',
    pageWidth - marginX * 2 - 6
  );
  doc.text(noteLines, marginX + 3, y + 6);
  y += 27;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  const closingLines = doc.splitTextToSize(
    'Demikian Berita Acara ini dibuat dengan sebenarnya sesuai dengan jalannya pelaksanaan ujian untuk dapat dipergunakan sebagaimana mestinya.',
    pageWidth - marginX * 2
  );
  doc.text(closingLines, marginX, y);
  y += 16;

  // 3-Column Signature
  const colW = (pageWidth - marginX * 2) / 3;
  const sigCenters = [marginX + colW * 0.5, marginX + colW * 1.5, marginX + colW * 2.5];
  doc.setFontSize(8.5);
  doc.text('Proktor Ujian,', sigCenters[0], y, { align: 'center' });
  doc.text('Pengawas Ruang,', sigCenters[1], y, { align: 'center' });
  doc.text('Kepala Sekolah,', sigCenters[2], y, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text('Budi Santoso, S.Kom', sigCenters[0], y + 20, { align: 'center' });
  doc.text(params.selectedExam?.teacherName || 'Guru Pengampu', sigCenters[1], y + 20, { align: 'center' });
  doc.text(HEADMASTER_NAME, sigCenters[2], y + 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NIP. 198509122010011015', sigCenters[0], y + 24, { align: 'center' });
  doc.text('NIP. 198007202005012009', sigCenters[1], y + 24, { align: 'center' });
  doc.text(HEADMASTER_NIP, sigCenters[2], y + 24, { align: 'center' });

  return savePdfSafely(doc, `Berita_Acara_Ujian_${sanitizeFilename(params.selectedExam?.subject || 'Mapel')}.pdf`);
}

// =========================================================================
// 5. LABEL NOMOR MEJA RUANG KELAS (PDF)
// =========================================================================
export function downloadNomorMejaPdf(params: {
  selectedClass: string;
  students: User[];
}): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const marginX = 12;
  const gapX = 5;
  const gapY = 6;
  const cardW = (doc.internal.pageSize.getWidth() - marginX * 2 - gapX * 2) / 3;
  const cardH = 48;

  params.students.forEach((st, idx) => {
    const pos = idx % 15;
    if (idx > 0 && pos === 0) {
      doc.addPage();
    }
    const col = pos % 3;
    const row = Math.floor(pos / 3);
    const x = marginX + col * (cardW + gapX);
    const y = 12 + row * (cardH + gapY);

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(KOP_LINES.sekolah, x + cardW / 2, y + 6, { align: 'center' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(x + 3, y + 8, x + cardW - 3, y + 8);

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7);
    doc.text('NOMOR MEJA UJIAN', x + cardW / 2, y + 14, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(17);
    doc.text(`Meja-${String(idx + 1).padStart(2, '0')}`, x + cardW / 2, y + 24, { align: 'center' });

    doc.line(x + 3, y + 29, x + cardW - 3, y + 29);

    doc.setFontSize(7.5);
    const nameLines = doc.splitTextToSize(st.name, cardW - 6);
    doc.text(nameLines[0] || st.name, x + cardW / 2, y + 34.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`NISN: ${st.nisn || '-'} | Ruang Kelas ${st.kelas || '-'}`, x + cardW / 2, y + 39.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text(`USER: ${st.username}`, x + cardW / 2, y + 44, { align: 'center' });
  });

  return savePdfSafely(doc, `Nomor_Meja_Ruang_Kelas_${sanitizeFilename(params.selectedClass)}.pdf`);
}

// =========================================================================
// 6. LEGER NILAI KELAS (SEMUA MAPEL - A4 LANDSCAPE PDF)
// =========================================================================
export function downloadLegerNilaiPdf(params: {
  selectedLegerClass: string;
  students: User[];
  subjects: SubjectItem[];
  exams: Exam[];
  examSessions: ExamSession[];
  schoolProfile: SchoolProfile;
}): string {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const marginX = 12;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = drawOfficialKop(doc, marginX, 10, { isLandscape: true });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('LEGER REKAPITULASI NILAI ASESMEN SEMUA MATA PELAJARAN', pageWidth / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Kelas ${params.selectedLegerClass} | Tahun Pelajaran ${params.schoolProfile.academicYear} (${params.schoolProfile.semester}) | Total: ${params.students.length} Siswa`,
    pageWidth / 2,
    y + 4.5,
    { align: 'center' }
  );
  y += 9;

  const mainSubjects = params.subjects.slice(0, 8);
  const headRow = [
    'No',
    'NISN',
    'Nama Lengkap Siswa',
    'Agama',
    ...mainSubjects.map(sub => `${sub.code}\n(${sub.kkm})`),
    'Total',
    'Rata2',
    'Rank',
  ];

  const kkmByCol: Record<number, number> = {};
  mainSubjects.forEach((sub, idx) => {
    kkmByCol[4 + idx] = sub.kkm;
  });

  const bodyRows = params.students.map((st, idx) => {
    const studentScores = mainSubjects.map(sub => {
      const matchedExam = params.exams.find(e => e.subject.toLowerCase() === sub.name.toLowerCase());
      if (!matchedExam) return null;
      const ses = params.examSessions.find(
        s => s.examId === matchedExam.id && s.studentId === st.id && s.status === 'submitted'
      );
      return ses?.score ?? null;
    });

    const validScores = studentScores.filter((v): v is number => v !== null);
    const totalScore = validScores.reduce((a, b) => a + b, 0);
    const avg = validScores.length > 0 ? (totalScore / validScores.length).toFixed(1) : '-';
    const rank = validScores.length > 0 ? `#${idx + 1}` : '-';

    return [
      String(idx + 1),
      st.nisn || '-',
      st.name,
      st.agama || 'Islam',
      ...studentScores.map(sc => (sc === null ? '-' : String(sc))),
      validScores.length > 0 ? String(totalScore) : '-',
      avg,
      rank,
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [headRow],
    body: bodyRows.length > 0 ? bodyRows : [['-', '-', `Belum ada siswa di kelas ${params.selectedLegerClass}`, '-', ...mainSubjects.map(() => '-'), '-', '-', '-']],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: 1.8,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9 },
      1: { cellWidth: 23 },
      2: { fontStyle: 'bold', cellWidth: 52 },
      3: { halign: 'center', cellWidth: 20 },
    },
    didParseCell: data => {
      if (data.section === 'body') {
        const colIdx = data.column.index;
        if (colIdx >= 4 && colIdx < 4 + mainSubjects.length) {
          data.cell.styles.halign = 'center';
          const num = parseFloat(String(data.cell.raw));
          const kkm = kkmByCol[colIdx];
          if (!isNaN(num) && kkm && num < kkm) {
            data.cell.styles.textColor = [225, 29, 72];
            data.cell.styles.fontStyle = 'bold';
          }
        } else if (colIdx >= 4 + mainSubjects.length) {
          data.cell.styles.halign = 'center';
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  y = getLastTableY(doc, y + 20) + 6;
  if (y + 32 > pageHeight - 10) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('* Nilai warna merah menunjukkan nilai di bawah KKM mata pelajaran tersebut.', marginX, y);

  const rightX = pageWidth - marginX - 35;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.2);
  doc.text('Mengetahui,', rightX, y + 4, { align: 'center' });
  doc.text('Kepala Sekolah,', rightX, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(HEADMASTER_NAME, rightX, y + 23, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(HEADMASTER_NIP, rightX, y + 27, { align: 'center' });

  return savePdfSafely(doc, `Leger_Nilai_Kelas_${sanitizeFilename(params.selectedLegerClass)}.pdf`);
}

// =========================================================================
// 7. KARTU PESERTA TUNGGAL (StudentCardModal)
// =========================================================================
export function downloadSingleStudentCardPdf(params: {
  student: User;
  schoolProfile: SchoolProfile;
}): string {
  return downloadKartuPesertaPdf({
    selectedClass: params.student.kelas || 'Siswa',
    students: [params.student],
    schoolProfile: params.schoolProfile,
  });
}

// =========================================================================
// 8. REKAP RIWAYAT & BUKTI HASIL UJIAN SISWA (StudentExamHistoryView)
// =========================================================================
export function downloadStudentHistoryPdf(params: {
  currentUser: User;
  items: {
    subject: string;
    code: string;
    category: string;
    score: number;
    kkm: number;
    status: string;
    completedDate: string;
    violationsCount: number;
  }[];
}): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const marginX = 14;
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = drawOfficialKop(doc, marginX, 12);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('REKAPITULASI RIWAYAT & HASIL ASESMEN CBT SISWA', pageWidth / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama Siswa : ${params.currentUser.name}`, marginX, y);
  doc.text(`NISN : ${params.currentUser.nisn || '-'}`, marginX, y + 4.5);
  doc.text(`Kelas : ${params.currentUser.kelas || '-'} (${params.currentUser.ruangUjian || '-'})`, pageWidth - marginX, y, { align: 'right' });
  y += 10;

  const rows = params.items.map((item, idx) => [
    String(idx + 1),
    item.category,
    item.subject,
    item.completedDate,
    String(item.kkm),
    String(item.score),
    item.status,
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Kategori', 'Mata Pelajaran', 'Waktu Selesai', 'KKM', 'Nilai', 'Status']],
    body: rows.length > 0 ? rows : [['-', '-', 'Belum ada riwayat ujian', '-', '-', '-', '-']],
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.2 },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
      6: { halign: 'center', cellWidth: 22 },
    },
  });

  return savePdfSafely(doc, `Rekap_Nilai_${sanitizeFilename(params.currentUser.name)}.pdf`);
}

export function downloadStudentReceiptPdf(params: {
  currentUser: User;
  item: {
    subject: string;
    code: string;
    category: string;
    score: number;
    kkm: number;
    completedDate: string;
    totalQuestions: number;
    correctCount: number;
    timeSpentMinutes: number;
    violationsCount: number;
  };
}): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const marginX = 16;
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = drawOfficialKop(doc, marginX, 12);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('TANDA BUKTI HASIL ASESMEN BERBASIS KOMPUTER (CBT)', pageWidth / 2, y, { align: 'center' });
  y += 9;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama Siswa        : ${params.currentUser.name}`, marginX, y);
  doc.text(`NISN / No Peserta : ${params.currentUser.nisn || '-'} / ${params.currentUser.nomorPeserta || '-'}`, marginX, y + 5);
  doc.text(`Kelas / Ruang     : ${params.currentUser.kelas || '-'} (${params.currentUser.ruangUjian || '-'})`, marginX, y + 10);

  doc.text(`Mata Pelajaran : ${params.item.subject}`, pageWidth - marginX, y, { align: 'right' });
  doc.text(`Kategori Ujian : ${params.item.category} (${params.item.code})`, pageWidth - marginX, y + 5, { align: 'right' });
  doc.text(`Waktu Selesai  : ${params.item.completedDate}`, pageWidth - marginX, y + 10, { align: 'right' });
  y += 18;

  // Score Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, y, pageWidth - marginX * 2, 32, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('HASIL PEROLEHAN NILAI AKHIR', pageWidth / 2, y + 7, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(15, 23, 42);
  doc.text(String(params.item.score), pageWidth / 2, y + 20, { align: 'center' });
  doc.setFontSize(9);
  const statusStr = params.item.score >= params.item.kkm ? 'TUNTAS' : 'REMEDIAL';
  doc.text(`Standar KKM: ${params.item.kkm}  |  STATUS: ${statusStr}`, pageWidth / 2, y + 28, { align: 'center' });
  y += 38;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [['Parameter Asesmen', 'Capaian', 'Keterangan']],
    body: [
      ['Jumlah Butir Soal Terjawab', `${params.item.totalQuestions} Soal`, '100% Lengkap'],
      ['Jawaban Benar', `${params.item.correctCount} Soal`, 'Bobot Poin Penuh'],
      ['Durasi Pengerjaan', `${params.item.timeSpentMinutes || 75} Menit`, 'Tepat Waktu'],
      [
        'Integritas Sensor Keamanan',
        params.item.violationsCount > 0 ? `${params.item.violationsCount}x Pelanggaran` : 'Tertib',
        'Tervalidasi Sistem',
      ],
    ],
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
  });

  y = getLastTableY(doc, y + 30) + 12;
  const sigX = pageWidth - marginX - 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Kepala Sekolah,', sigX, y, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(HEADMASTER_NAME, sigX, y + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(HEADMASTER_NIP, sigX, y + 22, { align: 'center' });

  return savePdfSafely(
    doc,
    `Bukti_Nilai_${sanitizeFilename(params.item.subject)}_${sanitizeFilename(params.currentUser.name)}.pdf`
  );
}
