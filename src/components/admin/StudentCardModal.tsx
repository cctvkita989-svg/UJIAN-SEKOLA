import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, Printer, QrCode, Download, CheckCircle2 } from 'lucide-react';
import { User } from '../../types/cbt';

interface StudentCardModalProps {
  student: User | null;
  onClose: () => void;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({ student, onClose }) => {
  const { schoolProfile } = useCBT();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!student) return null;

  const handleDownload = () => {
    const cardEl = document.getElementById('printable-student-card');
    if (!cardEl) return;

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Kartu_Ujian_${student.name.replace(/\s+/g, '_')}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: sans-serif; padding: 20px; background: #fff; color: #1e293b; }
    @media print { body { padding: 0 !important; } }
  </style>
</head>
<body>
  <div style="max-width: 500px; margin: 20px auto;">
    ${cardEl.innerHTML}
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 400);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kartu_Ujian_${student.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

    setToastMessage('Kartu peserta berhasil diunduh. Buka file untuk langsung mencetak atau simpan PDF.');
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handlePrint = () => {
    const cardEl = document.getElementById('printable-student-card');
    let printed = false;
    try {
      if (cardEl) {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body style="padding:15px;">${cardEl.innerHTML}</body></html>`);
          doc.close();
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
              printed = true;
            } catch (e) {}
          }, 350);
        }
      }
    } catch (e) {}

    try {
      window.print();
      printed = true;
    } catch (e) {}

    if (printed) {
      setToastMessage('Dialog cetak kartu dibuka.');
    } else {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between no-print bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Kartu Peserta Ujian CBT</h2>
            <p className="text-xs text-slate-500">Pratinjau kartu resmi peserta ujian sekolah</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {toastMessage && (
          <div className="mx-6 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Printable Card Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6" id="printable-student-card">
          <div className="border-2 border-slate-800 rounded-lg p-5 bg-white shadow-xs">
            {/* Header Kop */}
            <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                KARTU PESERTA ASESMEN / UJIAN SEKOLAH
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {schoolProfile.name}
              </h3>
              <p className="text-[11px] text-slate-500">
                NPSN: {schoolProfile.npsn} · Tahun Pelajaran {schoolProfile.academicYear}
              </p>
            </div>

            {/* Content Body */}
            <div className="flex gap-4 items-start">
              {/* Photo Box */}
              <div className="w-24 h-32 border border-slate-300 rounded bg-slate-100 flex flex-col items-center justify-center text-slate-400 shrink-0 text-center p-2">
                <span className="text-[10px] font-medium leading-tight">FOTO 3X4</span>
                <span className="text-[9px] text-slate-400 mt-1">PESERTA</span>
              </div>

              {/* Data Table */}
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">No. Peserta</span>
                  <span className="col-span-2 font-bold font-mono text-slate-900">
                    {student.nomorPeserta || 'U-24-001'}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="col-span-2 font-semibold text-slate-900">
                    {student.name}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">NISN</span>
                  <span className="col-span-2 font-mono text-slate-800">
                    {student.nisn || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Kelas</span>
                  <span className="col-span-2 font-semibold text-slate-800">
                    {student.kelas || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Agama</span>
                  <span className="col-span-2 font-semibold text-indigo-700">
                    {student.agama || 'Islam'}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Ruang & Sesi</span>
                  <span className="col-span-2 text-slate-800">
                    {student.ruangUjian || `Ruang Kelas ${student.kelas}`} · {student.sesiUjian}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Username CBT</span>
                  <span className="col-span-2 font-mono text-indigo-700 font-medium">
                    {student.username}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Signatures & QR */}
            <div className="mt-5 pt-3 border-t border-dashed border-slate-300 flex items-end justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className="p-1 border border-slate-300 rounded bg-slate-50">
                  <QrCode className="w-9 h-9 text-slate-700" />
                </div>
                <div className="text-[9px] text-slate-400 leading-tight">
                  Verifikasi Validitas
                  <br />
                  Sistem CBT Sekolah
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-500 text-[10px]">Ketua Panitia Ujian,</p>
                <div className="h-8"></div>
                <p className="font-bold underline text-slate-800">Bpk. Suryadi, M.Kom</p>
                <p className="text-[9px] text-slate-400 font-mono">NIP. 19780512 200501 1 004</p>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-center"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-xs cursor-pointer active:scale-95 text-center"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Kartu (HTML/PDF)
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer active:scale-95 text-center"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Kartu Peserta
          </button>
        </div>
      </div>
    </div>
  );
};
