import React from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, Printer, QrCode } from 'lucide-react';
import { User } from '../../types/cbt';

interface StudentCardModalProps {
  student: User | null;
  onClose: () => void;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({ student, onClose }) => {
  const { schoolProfile } = useCBT();

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between no-print">
          <div>
            <h2 className="text-base font-bold text-slate-900">Kartu Peserta Ujian CBT</h2>
            <p className="text-xs text-slate-500">Pratinjau kartu resmi peserta ujian sekolah</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="p-6">
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

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Kartu Peserta
          </button>
        </div>
      </div>
    </div>
  );
};
