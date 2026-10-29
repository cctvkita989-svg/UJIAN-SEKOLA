import React, { useState, useEffect } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  Printer,
  FileText,
  Users,
  Calendar,
  Clock,
  School,
  CheckCircle2,
  QrCode,
  Download,
  X,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Exam, User } from '../../types/cbt';

export interface ExamAdministrationDocsProps {
  initialDocType?: 'kartu_peserta' | 'daftar_hadir' | 'berita_acara' | 'nomor_meja' | 'daftar_nilai';
  initialExamId?: string;
  initialClass?: string;
  onDocTypeChange?: (type: 'kartu_peserta' | 'daftar_hadir' | 'berita_acara' | 'nomor_meja' | 'daftar_nilai') => void;
}

export const ExamAdministrationDocs: React.FC<ExamAdministrationDocsProps> = ({
  initialDocType = 'daftar_nilai',
  initialExamId,
  initialClass,
  onDocTypeChange
}) => {
  const { exams, users, schoolProfile, classes, subjects, examSessions } = useCBT();

  const [activeDocType, setActiveDocType] = useState<'kartu_peserta' | 'daftar_hadir' | 'berita_acara' | 'nomor_meja' | 'daftar_nilai'>(initialDocType);
  const [selectedClass, setSelectedClass] = useState<string>(initialClass || (classes[0]?.name ? classes[0].name : 'VII-1'));
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || exams[0]?.id || '');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isProcessingPrint, setIsProcessingPrint] = useState<boolean>(false);

  useEffect(() => {
    if (initialDocType) {
      setActiveDocType(initialDocType);
    }
  }, [initialDocType]);

  useEffect(() => {
    if (initialExamId) {
      setSelectedExamId(initialExamId);
    }
  }, [initialExamId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDocTypeChange = (type: 'kartu_peserta' | 'daftar_hadir' | 'berita_acara' | 'nomor_meja' | 'daftar_nilai') => {
    setActiveDocType(type);
    if (onDocTypeChange) {
      onDocTypeChange(type);
    }
  };

  const students = users.filter(u => u.role === 'siswa');
  const filteredStudents = selectedClass === 'ALL'
    ? students
    : students.filter(s => s.kelas === selectedClass);

  const selectedExam = exams.find(e => e.id === selectedExamId) || exams[0];

  const classSessions = filteredStudents.map(student => {
    const session = examSessions.find(s => s.studentId === student.id && s.examId === selectedExam?.id)
      || examSessions.find(s => s.studentId === student.id);
    return {
      student,
      session,
      attendanceStatus: session?.attendanceStatus || 'cbt',
      score: session?.score ?? 0,
      isSubmitted: session?.status === 'submitted' || session?.attendanceStatus === 'tertulis'
    };
  });

  // Metrics calculation: Jumlah Siswa, Hadir CBT, Ujian Tertulis, Sakit/Izin, Absen
  const cbtCount = classSessions.filter(cs => cs.attendanceStatus === 'cbt').length;
  const writtenCount = classSessions.filter(cs => cs.attendanceStatus === 'tertulis').length;
  const sickCount = classSessions.filter(cs => cs.attendanceStatus === 'sakit').length;
  const permitCount = classSessions.filter(cs => cs.attendanceStatus === 'izin').length;
  const absentCount = classSessions.filter(cs => cs.attendanceStatus === 'absen').length;

  const getDocumentTitle = () => {
    const cleanExam = (selectedExam?.subject || 'Mapel').replace(/[^a-zA-Z0-9]/g, '_');
    switch (activeDocType) {
      case 'daftar_nilai':
        return `Daftar_Nilai_Kelas_${selectedClass}_${cleanExam}`;
      case 'kartu_peserta':
        return `Kartu_Peserta_Ujian_Kelas_${selectedClass}`;
      case 'daftar_hadir':
        return `Daftar_Hadir_Ujian_Kelas_${selectedClass}_${cleanExam}`;
      case 'berita_acara':
        return `Berita_Acara_Ujian_${cleanExam}`;
      case 'nomor_meja':
        return `Nomor_Meja_Ruang_Kelas_${selectedClass}`;
      default:
        return 'Dokumen_Administrasi_Ujian';
    }
  };

  const handleDownloadHtml = () => {
    const docElement = document.getElementById('printable-exam-document');
    if (!docElement) {
      setToast({ message: 'Elemen dokumen tidak ditemukan.', type: 'error' });
      return;
    }

    const title = getDocumentTitle();
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title.replace(/_/g, ' ')} - ${schoolProfile.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 10mm;
    }
    body {
      background-color: #ffffff;
      color: #0f172a;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 24px;
    }
    @media print {
      body { padding: 0 !important; }
      .print\\:hidden { display: none !important; }
      .no-print { display: none !important; }
    }
    .print-banner-info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 14px 18px;
      border-radius: 10px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #1e40af;
    }
    .print-banner-info button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 9px 18px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .print-banner-info button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="print-banner-info print:hidden no-print">
    <div>
      <strong style="font-size: 14px; display: block; margin-bottom: 3px;">📄 Dokumen Administrasi Ujian Resmi Siap Cetak</strong>
      <span style="color: #3b82f6; font-size: 12px;">Tekan tombol cetak di sebelah kanan atau gunakan pintasan <code>Ctrl + P</code> pada keyboard untuk mencetak langsung atau simpan sebagai PDF.</span>
    </div>
    <button onclick="window.print()">🖨️ Cetak / Simpan PDF Sekarang</button>
  </div>

  <div style="max-width: 960px; margin: 0 auto;">
    ${docElement.innerHTML}
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch(e) {}
      }, 500);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.html`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1200);

    setToast({
      message: `File dokumen "${title}.html" berhasil diunduh. Anda dapat langsung membukanya di browser apa pun untuk mencetak atau menyimpan sebagai PDF.`,
      type: 'success'
    });
  };

  const handlePrint = () => {
    setIsProcessingPrint(true);
    const docElement = document.getElementById('printable-exam-document');
    if (!docElement) {
      setToast({ message: 'Elemen dokumen tidak ditemukan untuk dicetak.', type: 'error' });
      setIsProcessingPrint(false);
      return;
    }

    let printTriggered = false;

    // Strategy 1: Create isolated hidden iframe to bypass parent sandbox modals restriction
    try {
      const existingFrame = document.getElementById('print-execution-frame');
      if (existingFrame) existingFrame.remove();

      const iframe = document.createElement('iframe');
      iframe.id = 'print-execution-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${getDocumentTitle().replace(/_/g, ' ')}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: sans-serif; margin: 0; padding: 12px; color: #0f172a; background: #fff; }
    @media print {
      body { padding: 0 !important; }
      .print\\:hidden { display: none !important; }
    }
  </style>
</head>
<body>
  ${docElement.innerHTML}
</body>
</html>`);
        iframeDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            printTriggered = true;
          } catch (iframeErr) {
            console.warn('Iframe printing blocked by browser:', iframeErr);
          }
        }, 400);
      }
    } catch (err) {
      console.warn('Error setting up print iframe:', err);
    }

    // Strategy 2: Direct window.print() inside try/catch
    try {
      window.print();
      printTriggered = true;
    } catch (topErr) {
      console.warn('Direct window.print() restricted in iframe sandbox:', topErr);
    }

    setIsProcessingPrint(false);

    // Provide user feedback and safety fallback
    if (printTriggered) {
      setToast({
        message: 'Dialog cetak dibuka. Pilih printer fisik Anda atau opsi "Save as PDF" untuk menyimpan berkas resmi.',
        type: 'info'
      });
    } else {
      // If browser sandboxing strictly prevents modal print dialogs, automatically download the ready-to-print HTML/PDF
      handleDownloadHtml();
      setToast({
        message: 'Browser membatasi dialog cetak di dalam pratinjau. Dokumen resmi (.html siap cetak & simpan PDF) telah otomatis diunduh!',
        type: 'info'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST FEEDBACK NOTIFICATION */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-200 border ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : toast.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-indigo-50 text-indigo-900 border-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <FileCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            )}
            <span className="leading-relaxed">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SCREEN CONTROLS (Hidden during printing via print:hidden) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Dokumen Administrasi Ujian Resmi</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cetak berkas fisik siap pakai (Daftar Nilai Siswa Per Kelas Siap Bagikan ke Orang Tua, Kartu Ujian Barcode, Daftar Hadir, Berita Acara, & Label Meja).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isProcessingPrint}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Kirim ke printer atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>{isProcessingPrint ? 'Menyiapkan...' : 'Cetak Dokumen Sekarang (PDF / Print)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Unduh file dokumen mandiri (format HTML/PDF) siap cetak di laptop/PC lain"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Siap Cetak (HTML / PDF)</span>
            </button>
          </div>
        </div>

        {/* DOC TYPE SELECTOR TABS */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => handleDocTypeChange('daftar_nilai')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeDocType === 'daftar_nilai'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Daftar Nilai Siswa Per Kelas (PDF Ortu)</span>
          </button>
          <button
            onClick={() => handleDocTypeChange('kartu_peserta')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeDocType === 'kartu_peserta'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kartu Peserta Ujian (A4 4-in-1)
          </button>
          <button
            onClick={() => handleDocTypeChange('daftar_hadir')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeDocType === 'daftar_hadir'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Daftar Hadir Ruang Ujian
          </button>
          <button
            onClick={() => handleDocTypeChange('berita_acara')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeDocType === 'berita_acara'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Berita Acara Pelaksanaan (BAP)
          </button>
          <button
            onClick={() => handleDocTypeChange('nomor_meja')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeDocType === 'nomor_meja'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Nomor Meja Ruang Kelas
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Pilih Rombel / Kelas:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg outline-none bg-slate-50"
            >
              <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>
                  Kelas {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Pilih Paket Ujian:</span>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg outline-none bg-slate-50 max-w-xs truncate"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  [{ex.examCategory || 'PAS'}] {ex.subject} ({ex.gradeLevel})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE DOCUMENT AREA (Styled specifically for standard A4 Paper)
         ========================================================================= */}
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <div id="printable-exam-document" className="bg-white border border-slate-300 rounded-xl p-4 sm:p-8 min-w-[620px] sm:min-w-0 shadow-sm font-sans text-slate-900 print:border-none print:shadow-none print:p-0 print:min-w-0">

        {/* 0. DAFTAR NILAI RESMI SISWA PER KELAS / PER RUANG (SIAP CETAK / PDF ORANG TUA) */}
        {activeDocType === 'daftar_nilai' && (
          <div className="space-y-6">
              <div className="text-center print:hidden pb-3 border-b border-slate-200">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                  Pratinjau Format Daftar Nilai Kelas Resmi (Siap Dicetak & Dibagikan ke Orang Tua / Wali Siswa)
                </span>
              </div>

              {/* KOP SURAT RESMI */}
              <div className="border-b-4 border-double border-slate-900 pb-3 text-center space-y-1">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0">
                    CBT
                  </div>
                  <div className="flex-1 px-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      PEMERINTAH DAERAH / KEMENTERIAN AGAMA REPUBLIK INDONESIA
                    </div>
                    <div className="text-lg font-black text-slate-950 uppercase tracking-wide leading-tight">
                      {schoolProfile.name}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      NPSN: {schoolProfile.npsn || '10293847'} • {schoolProfile.address || 'Jl. Pendidikan No. 01, Wilayah Terakreditasi'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Website: cbt.sekolah.sch.id • Email: cbt@{schoolProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sekolah'}.sch.id
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl border-2 border-slate-900 flex flex-col items-center justify-center font-mono text-[10px] font-bold text-slate-800 shrink-0">
                    <span>KELAS</span>
                    <span className="text-base font-black text-indigo-700">{selectedClass}</span>
                  </div>
                </div>
              </div>

              {/* JUDUL DOKUMEN & IDENTITAS PENILAIAN */}
              <div className="text-center space-y-0.5">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide underline decoration-slate-400">
                  DAFTAR NILAI & HASIL EVALUASI SISWA PER RUANG KELAS
                </h2>
                <p className="text-xs font-semibold text-slate-700">
                  {selectedExam?.title || 'PENILAIAN AKHIR SEMESTER (PAS) GANJIL'} • TAHUN PELAJARAN {schoolProfile.academicYear} ({schoolProfile.semester})
                </p>
              </div>

              {/* META GRID INFORMASI */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium border border-slate-300 rounded-lg p-3 bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-32 text-slate-500">Mata Pelajaran</span>
                    <span className="font-bold text-slate-900">: {selectedExam?.subject}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500">Rombongan Belajar</span>
                    <span className="font-bold text-slate-900">: Kelas {selectedClass}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500">Guru Mata Pelajaran</span>
                    <span className="font-bold text-slate-900">: {selectedExam?.teacherName || 'Ibu Guru Pengampu, S.Pd'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-32 text-slate-500">Tanggal Pelaksanaan</span>
                    <span className="font-bold text-slate-900">: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500">Waktu & Durasi</span>
                    <span className="font-bold text-slate-900">: {selectedExam?.startTime} - {selectedExam?.endTime} WIB ({selectedExam?.durationMinutes} Menit)</span>
                  </div>
                </div>
              </div>

              {/* TABEL NILAI PESERTA (Tanpa Kolom KKM/Remedial dan Tanpa Kolom Catatan) */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2.5 px-2 border-r border-slate-300 text-center w-10">No</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-32">NISN</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Nama Lengkap Siswa</th>
                      <th className="py-2.5 px-2 border-r border-slate-300 text-center w-12">L/P</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-center w-40">Status Kehadiran</th>
                      <th className="py-2.5 px-3 border-slate-300 text-center w-28">Nilai Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          Tidak ada siswa yang terdaftar di kelas {selectedClass}.
                        </td>
                      </tr>
                    ) : (
                      classSessions.map((item, idx) => {
                        const { student, attendanceStatus, score } = item;

                        let statusLabel = '💻 Hadir CBT';
                        let statusColor = 'text-slate-800';
                        if (attendanceStatus === 'tertulis') {
                          statusLabel = '📝 Ujian Tertulis';
                          statusColor = 'text-purple-800 font-semibold';
                        } else if (attendanceStatus === 'sakit') {
                          statusLabel = '🤒 Sakit';
                          statusColor = 'text-amber-800 font-semibold';
                        } else if (attendanceStatus === 'izin') {
                          statusLabel = '✉️ Izin Resmi';
                          statusColor = 'text-sky-800 font-semibold';
                        } else if (attendanceStatus === 'absen') {
                          statusLabel = '❌ Absen / Alpa';
                          statusColor = 'text-rose-800 font-semibold';
                        }

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2 px-2 border-r border-slate-300 text-center font-mono text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-300 font-mono text-slate-700">
                              {student.nisn || '-'}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-900">
                              {student.name}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-300 text-center font-mono text-slate-600">
                              {idx % 2 === 0 ? 'L' : 'P'}
                            </td>
                            <td className={`py-2 px-3 border-r border-slate-300 text-center ${statusColor}`}>
                              {statusLabel}
                            </td>
                            <td className="py-2 px-3 border-slate-300 text-center font-mono font-bold text-sm text-slate-900">
                              {attendanceStatus === 'sakit' || attendanceStatus === 'izin' || attendanceStatus === 'absen' ? (
                                <span className="text-slate-400 font-normal">-</span>
                              ) : (
                                <span>{score}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* REKAPITULASI HASIL & STATUS KEHADIRAN (Hanya Jumlah Siswa, Hadir CBT, Ujian Tertulis, Sakit/Izin, Absen) */}
              <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50/50 space-y-2 text-xs">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span>Rekapitulasi Kehadiran Peserta Ujian Kelas {selectedClass}</span>
                  <span className="text-slate-500 font-normal normal-case text-[11px]">Metode Pengerjaan & Status Kehadiran</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-slate-700 pt-1">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase">Jumlah Siswa</span>
                    <strong className="font-mono text-sm text-slate-900">{filteredStudents.length} Siswa</strong>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase">Hadir Ujian CBT</span>
                    <strong className="font-mono text-sm text-emerald-700">{cbtCount} Siswa</strong>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase">Ujian Tertulis</span>
                    <strong className="font-mono text-sm text-purple-700">{writtenCount} Siswa</strong>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase">Sakit / Izin</span>
                    <strong className="font-mono text-sm text-amber-700">{sickCount + permitCount} Siswa</strong>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase">Absen</span>
                    <strong className="font-mono text-sm text-rose-700">{absentCount} Siswa</strong>
                  </div>
                </div>
              </div>

              {/* LEMBAR TANDA TANGAN 3 KOLOM RESMI */}
              <div className="grid grid-cols-3 gap-6 pt-6 text-xs font-medium text-center">
                <div className="space-y-12">
                  <div>
                    Pengawas Ruang Kelas,
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">Budi Santoso, S.Kom</div>
                    <div className="font-mono text-slate-500 text-[10px]">NIP. 198509122010011015</div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div>
                    Guru Mata Pelajaran,
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">{selectedExam?.teacherName || 'Ibu Sri Wahyuni, S.Pd'}</div>
                    <div className="font-mono text-slate-500 text-[10px]">NIP. 198007202005012009</div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div>
                    Mengetahui,<br />
                    Kepala Sekolah,
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">Drs. H. Mulyadi, M.Pd</div>
                    <div className="font-mono text-slate-500 text-[10px]">NIP. 197405121999031002</div>
                  </div>
                </div>
              </div>

              <div className="print:hidden p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span>💡 Gunakan tombol di bawah ini atau di bagian atas untuk mencetak dokumen ke printer atau menyimpan sebagai file PDF.</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Sekarang</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadHtml}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF/HTML</span>
                  </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. KARTU PESERTA UJIAN (GRID 2x2 PER A4 SHEET) */}
        {activeDocType === 'kartu_peserta' && (
          <div className="space-y-6">
            <div className="text-center print:hidden pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                Pratinjau Format Kartu Peserta Ujian (Siap Cetak & Digunting)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
              {filteredStudents.map((st, idx) => (
                <div
                  key={st.id}
                  className="border-2 border-slate-800 rounded-lg p-4 bg-white relative flex flex-col justify-between page-break-inside-avoid"
                  style={{ minHeight: '260px' }}
                >
                  {/* KOP KARTU */}
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      CBT
                    </div>
                    <div className="flex-1 text-center pr-4">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        KARTU TANDA PESERTA UJIAN
                      </div>
                      <div className="text-xs font-black text-slate-900 leading-tight uppercase">
                        {schoolProfile.name}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        TA {schoolProfile.academicYear} · Semester {schoolProfile.semester}
                      </div>
                    </div>
                  </div>

                  {/* BODY INFO */}
                  <div className="grid grid-cols-3 gap-3 my-3">
                    <div className="col-span-2 space-y-1 text-xs">
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">No. Peserta</span>
                        <span className="font-mono font-bold text-slate-900">: {st.nomorPeserta || `U-24-${idx + 100}`}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Nama Siswa</span>
                        <span className="font-bold text-slate-900 truncate">: {st.name}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">NISN / Kelas</span>
                        <span className="font-mono text-slate-800">: {st.nisn || '-'} / {st.kelas}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Ruang Lab</span>
                        <span className="font-semibold text-slate-800">: {st.ruangUjian || 'Lab Komputer 01'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Sesi Ujian</span>
                        <span className="text-slate-800">: {st.sesiUjian || 'Sesi 1'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Username</span>
                        <span className="font-mono font-bold text-indigo-700">: {st.username}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Password</span>
                        <span className="font-mono font-bold text-slate-900">: {st.password || 'siswa123'}</span>
                      </div>
                    </div>

                    {/* QR CODE & PHOTO BOX */}
                    <div className="col-span-1 flex flex-col items-center justify-center border border-slate-300 rounded p-1 bg-slate-50">
                      <div className="w-14 h-14 bg-white border border-slate-300 rounded flex items-center justify-center text-slate-800">
                        <QrCode className="w-10 h-10" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase">Scan QR Meja</span>
                      <div className="w-12 h-8 border border-dashed border-slate-300 rounded mt-1 flex items-center justify-center text-[8px] text-slate-400">
                        Foto 2x3
                      </div>
                    </div>
                  </div>

                  {/* TANDA TANGAN KEPSEK / PANITIA */}
                  <div className="pt-2 border-t border-slate-200 flex items-end justify-between text-[10px]">
                    <div className="text-slate-400 italic text-[9px]">
                      * Harap dibawa saat sesi ujian berlangsung
                    </div>
                    <div className="text-center font-medium">
                      <div>Kepala Sekolah / Ketua Panitia</div>
                      <div className="h-6" />
                      <div className="font-bold underline text-slate-900">Drs. H. Mulyadi, M.Pd</div>
                      <div className="font-mono text-[9px] text-slate-500">NIP. 197405121999031002</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. DAFTAR HADIR RUANG UJIAN (FORM RESMI TANDATANGAN) */}
        {activeDocType === 'daftar_hadir' && (
          <div className="space-y-6">
            {/* KOP SURAT RESMI */}
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="text-sm font-bold uppercase tracking-wider text-slate-700">
                PEMERINTAH PROVINSI / DINAS PENDIDIKAN
              </div>
              <div className="text-lg font-black uppercase text-slate-900">
                {schoolProfile.name}
              </div>
              <div className="text-xs text-slate-600">
                {schoolProfile.address} · NPSN: {schoolProfile.npsn}
              </div>
              <div className="mt-2 text-sm font-black underline uppercase text-slate-900">
                DAFTAR HADIR PESERTA ASESMEN / UJIAN CBT
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Tahun Ajaran {schoolProfile.academicYear} — Semester {schoolProfile.semester}
              </div>
            </div>

            {/* HEADER DETAIL UJIAN */}
            <div className="grid grid-cols-2 gap-4 text-xs font-medium py-2">
              <div className="space-y-1">
                <div>Mata Pelajaran : <strong className="font-bold text-slate-900">{selectedExam?.subject}</strong></div>
                <div>Tingkat / Kelas : <strong className="font-mono text-slate-900">{selectedClass}</strong></div>
                <div>Guru Pengampu : <span>{selectedExam?.teacherName}</span></div>
              </div>
              <div className="space-y-1 text-right">
                <div>Hari, Tanggal : <strong className="text-slate-900">Senin, 12 Oktober 2026</strong></div>
                <div>Waktu / Sesi : <strong className="font-mono text-slate-900">{selectedExam?.startTime} - {selectedExam?.endTime} WIB</strong></div>
                <div>Ruang Ujian : <strong className="text-slate-900">{selectedClass === 'ALL' ? 'Ruang Kelas Masing-Masing' : `Ruang Kelas ${selectedClass}`}</strong></div>
              </div>
            </div>

            {/* TABEL DAFTAR HADIR */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-900 border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-900">
                    <th className="py-2 px-2 border-r border-slate-900 text-center w-10">No</th>
                    <th className="py-2 px-3 border-r border-slate-900 w-32">Nomor Peserta</th>
                    <th className="py-2 px-3 border-r border-slate-900 w-28">NISN</th>
                    <th className="py-2 px-3 border-r border-slate-900">Nama Lengkap Peserta</th>
                    <th className="py-2 px-2 border-r border-slate-900 text-center w-20">Kelas</th>
                    <th className="py-2 px-4 border-r border-slate-900 text-center w-36" colSpan={2}>
                      Tanda Tangan Peserta
                    </th>
                    <th className="py-2 px-3 text-center w-20">Ket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {filteredStudents.map((st, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <tr key={st.id} className="h-10">
                        <td className="py-1 px-2 border-r border-slate-900 text-center font-mono">{idx + 1}</td>
                        <td className="py-1 px-3 border-r border-slate-900 font-mono font-semibold">{st.nomorPeserta || `U-24-${idx + 100}`}</td>
                        <td className="py-1 px-3 border-r border-slate-900 font-mono">{st.nisn}</td>
                        <td className="py-1 px-3 border-r border-slate-900 font-bold uppercase">{st.name}</td>
                        <td className="py-1 px-2 border-r border-slate-900 text-center font-mono">{st.kelas}</td>
                        <td className="py-1 px-2 border-r border-slate-900 text-left w-18 text-[11px] text-slate-400 font-mono">
                          {isEven ? `${idx + 1}. .........` : ''}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-900 text-left w-18 text-[11px] text-slate-400 font-mono">
                          {!isEven ? `${idx + 1}. .........` : ''}
                        </td>
                        <td className="py-1 px-2 text-center text-[10px] font-semibold text-slate-700">
                          Hadir
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* FOOTER PENGAWAS */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-xs font-medium">
              <div>
                <p className="font-bold mb-1">Rekapitulasi Kehadiran Peserta:</p>
                <p>• Jumlah Siswa : <strong>{filteredStudents.length}</strong> orang</p>
                <p>• Hadir Ujian CBT : <strong>{cbtCount}</strong> orang</p>
                <p>• Ujian Tertulis : <strong>{writtenCount}</strong> orang</p>
                <p>• Sakit / Izin : <strong>{sickCount + permitCount}</strong> orang</p>
                <p>• Absen / Alpa : <strong>{absentCount}</strong> orang</p>
              </div>

              <div className="text-center space-y-12">
                <div>Pengawas Ruang Ujian,</div>
                <div>
                  <div className="font-bold underline text-slate-900">({selectedExam?.teacherName || 'Pengawas Ruang 01'})</div>
                  <div className="font-mono text-slate-500 text-[11px]">NIP. 198203152006042008</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. BERITA ACARA PELAKSANAAN (BAP) */}
        {activeDocType === 'berita_acara' && (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                PANITIA PELAKSANA ASESMEN / UJIAN CBT
              </div>
              <div className="text-lg font-black uppercase text-slate-900">
                {schoolProfile.name}
              </div>
              <div className="text-xs text-slate-600">
                {schoolProfile.address} · NPSN: {schoolProfile.npsn}
              </div>
              <div className="mt-3 text-sm font-black underline uppercase text-slate-900">
                BERITA ACARA PELAKSANAAN ASESMEN BERBASIS KOMPUTER (CBT)
              </div>
            </div>

            <div className="text-xs leading-relaxed space-y-4">
              <p>
                Pada hari ini, <strong>Senin</strong> tanggal <strong>12</strong> bulan <strong>Oktober</strong> tahun <strong>2026</strong>, bertempat di <strong>{schoolProfile.name}</strong>, telah diselenggarakan Asesmen / Ujian CBT untuk:
              </p>

              <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-1 font-medium">
                <div className="grid grid-cols-4">
                  <span className="text-slate-500">Mata Pelajaran</span>
                  <span className="col-span-3 font-bold text-slate-900">: {selectedExam?.subject}</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="text-slate-500">Kategori Asesmen</span>
                  <span className="col-span-3 font-bold text-slate-900">: {selectedExam?.examCategory || 'PAS'} ({schoolProfile.semester})</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="text-slate-500">Rombel / Kelas</span>
                  <span className="col-span-3 font-bold text-slate-900">: Kelas {selectedClass}</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="text-slate-500">Waktu Pelaksanaan</span>
                  <span className="col-span-3 font-mono font-bold text-slate-900">: {selectedExam?.startTime} s.d. {selectedExam?.endTime} WIB (Durasi {selectedExam?.durationMinutes} Menit)</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="text-slate-500">Ruang Ujian</span>
                  <span className="col-span-3 font-bold text-slate-900">: {selectedClass === 'ALL' ? 'Ruang Kelas Masing-Masing' : `Ruang Kelas ${selectedClass}`}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold">1. Keadaan Peserta Ujian:</div>
                <p className="pl-4">• Jumlah Siswa Terdaftar : <strong>{filteredStudents.length}</strong> Orang</p>
                <p className="pl-4">• Hadir Ujian CBT : <strong>{cbtCount}</strong> Orang</p>
                <p className="pl-4">• Ujian Tertulis : <strong>{writtenCount}</strong> Orang</p>
                <p className="pl-4">• Sakit / Izin : <strong>{sickCount + permitCount}</strong> Orang</p>
                <p className="pl-4">• Absen / Alpa : <strong>{absentCount}</strong> Orang</p>
              </div>

              <div className="space-y-1">
                <div className="font-bold">2. Catatan Kejadian Selama Ujian:</div>
                <div className="p-3 border border-slate-300 rounded text-slate-600 bg-white min-h-[70px]">
                  Pelaksanaan ujian berjalan tertib, server proktor lokal berfungsi dengan lancar tanpa hambatan jaringan. Sistem sensor anti-cheat berjalan normal.
                </div>
              </div>

              <p>
                Demikian Berita Acara ini dibuat dengan sebenarnya sesuai dengan jalannya pelaksanaan ujian untuk dapat dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* SIGNATURE SECTION 3 KOLOM */}
            <div className="grid grid-cols-3 gap-6 pt-10 text-xs font-medium text-center">
              <div className="space-y-14">
                <div>Proktor Ujian,</div>
                <div>
                  <div className="font-bold underline text-slate-900">Budi Santoso, S.Kom</div>
                  <div className="font-mono text-slate-500 text-[10px]">NIP. 198509122010011015</div>
                </div>
              </div>

              <div className="space-y-14">
                <div>Pengawas Ruang,</div>
                <div>
                  <div className="font-bold underline text-slate-900">{selectedExam?.teacherName || 'Ibu Sri Wahyuni, S.Pd'}</div>
                  <div className="font-mono text-slate-500 text-[10px]">NIP. 198007202005012009</div>
                </div>
              </div>

              <div className="space-y-14">
                <div>Kepala Sekolah,</div>
                <div>
                  <div className="font-bold underline text-slate-900">Drs. H. Mulyadi, M.Pd</div>
                  <div className="font-mono text-slate-500 text-[10px]">NIP. 197405121999031002</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. LABEL NOMOR MEJA LAB TEMPEL */}
        {activeDocType === 'nomor_meja' && (
          <div className="space-y-6">
            <div className="text-center print:hidden pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                Label Nomor Meja Siswa (Siap Gunting & Tempel pada Meja Ruang Kelas)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
              {filteredStudents.map((st, idx) => (
                <div
                  key={st.id}
                  className="border-2 border-slate-900 rounded-xl p-4 bg-white text-center flex flex-col justify-between"
                  style={{ minHeight: '180px' }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                    {schoolProfile.name}
                  </div>

                  <div className="my-2">
                    <div className="text-xs text-slate-600 font-semibold uppercase">NOMOR MEJA UJIAN</div>
                    <div className="text-3xl font-black font-mono text-slate-900">
                      Meja-{String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 truncate">{st.name}</div>
                    <div className="font-mono text-[11px] text-slate-600">NISN: {st.nisn} · Ruang Kelas {st.kelas}</div>
                    <div className="font-mono text-[10px] font-bold text-indigo-700">USER: {st.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
