import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { User } from '../../types/cbt';
import { downloadSingleStudentCardPdf } from '../../utils/pdfGenerator';

interface StudentCardModalProps {
  student: User | null;
  onClose: () => void;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({ student, onClose }) => {
  const { schoolProfile } = useCBT();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!student) return null;

  const handleDownloadPdf = () => {
    try {
      const fileName = downloadSingleStudentCardPdf({
        student,
        schoolProfile,
      });
      setToastMessage(`File PDF "${fileName}" berhasil diunduh!`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Gagal mengunduh PDF Kartu Peserta:', err);
      setToastMessage('Gagal membuat file PDF. Silakan coba kembali.');
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handlePrint = () => {
    handleDownloadPdf();
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

        {/* Printable Card Area (Gaya Presisi KTP) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6" id="printable-student-card">
          <div className="border-2 border-slate-800 rounded-xl p-4 bg-white shadow-xs max-w-[440px] mx-auto aspect-[85.6/54] flex flex-col justify-between">
            {/* Header Kop */}
            <div className="text-center border-b-2 border-slate-800 pb-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                KARTU TANDA PESERTA UJIAN
              </div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase leading-tight">
                {schoolProfile.name}
              </h3>
              <p className="text-[10px] text-slate-500">
                NPSN: {schoolProfile.npsn} · TA {schoolProfile.academicYear}
              </p>
            </div>

            {/* Content Body (Tanpa Sesi Ujian & Tanpa QR) */}
            <div className="flex gap-3.5 items-center my-2 flex-1">
              {/* Data Table */}
              <div className="flex-1 min-w-0 space-y-1 text-[11px]">
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">No. Peserta</span>
                  <span className="col-span-2 font-bold font-mono text-slate-900 truncate">
                    : {student.nomorPeserta || 'U-24-001'}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Nama Siswa</span>
                  <span className="col-span-2 font-bold text-slate-900 truncate">
                    : {student.name}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">NISN / Kelas</span>
                  <span className="col-span-2 font-mono text-slate-800 truncate">
                    : {student.nisn || '-'} / {student.kelas || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Ruang Ujian</span>
                  <span className="col-span-2 text-slate-800 font-semibold truncate">
                    : {student.ruangUjian || `Ruang Kelas ${student.kelas}`}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Username</span>
                  <span className="col-span-2 font-mono text-indigo-700 font-bold truncate">
                    : {student.username}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Password</span>
                  <span className="col-span-2 font-mono text-emerald-700 font-bold tracking-wider truncate">
                    : {student.password || 'siswa123'}
                  </span>
                </div>
              </div>

              {/* Photo Box */}
              <div className="w-20 h-26 border border-dashed border-slate-400 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0 text-center p-1.5">
                <span className="text-[10px] font-semibold leading-tight">Pas Foto</span>
                <span className="text-[9px] text-slate-400 mt-0.5">2x3</span>
              </div>
            </div>

            {/* Footer Signatures (Tanpa QR) */}
            <div className="pt-2 border-t border-slate-200 flex items-end justify-between text-[10px]">
              <div className="text-[9px] text-slate-400 italic">
                * Harap dibawa saat ujian
              </div>

              <div className="text-center leading-tight">
                <p className="text-slate-600 text-[9.5px]">Kepala Sekolah,</p>
                <div className="h-5"></div>
                <p className="font-bold underline text-slate-900 text-[10.5px]">ANWAR SAID, S.Pd, M.M</p>
                <p className="text-[8.5px] text-slate-500 font-mono">NIP. 19711205 199603 1 002</p>
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
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-xs cursor-pointer active:scale-95 text-center"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Kartu (PDF)
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer active:scale-95 text-center"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
