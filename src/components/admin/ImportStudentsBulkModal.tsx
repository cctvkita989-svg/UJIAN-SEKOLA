import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Users,
  Copy,
  Sparkles
} from 'lucide-react';
import { User } from '../../types/cbt';

interface ImportStudentsBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportStudentsBulkModal: React.FC<ImportStudentsBulkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { users, addUser } = useCBT();
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [pasteContent, setPasteContent] = useState('');
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Example template CSV
  const templateCsv = `NISN,Nama Siswa,Kelas,Ruang Ujian,Nomor Peserta,Agama
0068192001,Ahmad Fauzi,VII-1,Lab Komputer 01,U-24-VII1-001,Islam
0068192002,Siti Rahmawati,VII-1,Lab Komputer 01,U-24-VII1-002,Islam
0068192003,Rizky Pratama,VII-2,Lab Komputer 02,U-24-VII2-001,Islam
0068192004,Maria Fransisca,VIII-1,Lab Komputer 03,U-24-VIII1-001,Katolik
0068192005,Daniel Jonathan,IX-1,Lab Komputer 04,U-24-IX1-001,Kristen`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([templateCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Import_800_Siswa_CBT.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadSample800Format = () => {
    setPasteContent(templateCsv);
  };

  const handleProcessImport = () => {
    setParseError(null);
    if (!pasteContent.trim()) {
      setParseError('Data teks masih kosong. Silakan tempelkan daftar siswa Anda.');
      return;
    }

    try {
      const lines = pasteContent
        .trim()
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      let imported = 0;
      // Skip header if line contains 'NISN' or 'Nama'
      const startIdx = lines[0].toLowerCase().includes('nama') || lines[0].toLowerCase().includes('nisn') ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        // Split by comma or tab or semicolon
        const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
        const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));

        if (parts.length >= 2) {
          const nisn = parts[0] || `006819${String(1000 + i)}`;
          const name = parts[1] || `Siswa Baru ${i + 1}`;
          const kelas = parts[2] || 'VII-1';
          const ruang = parts[3] || 'Lab Komputer 01';
          const noPeserta = parts[4] || `U-24-${kelas.replace('-', '')}-${String(i + 1).padStart(3, '0')}`;
          const agama = (parts[5] as any) || 'Islam';

          addUser({
            name,
            username: name.toLowerCase().replace(/[^a-z0-9]/g, '') + String(i + 1),
            role: 'siswa',
            password: 'siswa123',
            email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@siswa.sch.id`,
            nisn,
            kelas,
            jurusan: 'Reguler',
            agama,
            ruangUjian: ruang,
            nomorPeserta: noPeserta,
            sesiUjian: 'Sesi 1 (Serentak 800 Siswa)',
            statusLogin: 'offline',
          });
          imported++;
        }
      }

      if (imported === 0) {
        setParseError('Tidak ada baris data valid yang terdeteksi. Pastikan format kolom sesuai.');
      } else {
        setImportSuccessCount(imported);
        setPasteContent('');
      }
    } catch (e: any) {
      setParseError('Gagal memproses data: ' + e.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        setPasteContent(text);
        setActiveTab('paste');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Data 800 Siswa Sekaligus</h3>
              <p className="text-xs text-slate-400">
                Masukkan data siswa sekolah Anda secara massal via File Excel/CSV atau Salin-Tempel.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {importSuccessCount !== null && (
          <div className="m-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Berhasil Mengimpor {importSuccessCount} Siswa!</span> Data telah tersimpan ke dalam sistem CBT dan langsung siap mengikuti ujian serentak.
            </div>
            <button
              onClick={() => {
                setImportSuccessCount(null);
                onClose();
              }}
              className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 cursor-pointer"
            >
              Lihat Daftar Siswa
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="px-5 pt-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'paste'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📋 Salin-Tempel Teks (Paste dari Excel)
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📁 Upload File CSV / Text
            </button>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer pb-2"
          >
            <Download className="w-3.5 h-3.5" /> Unduh Format Template (.csv)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {activeTab === 'paste' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">
                  Tempel data siswa dari Excel atau tabel di bawah:
                </span>
                <button
                  type="button"
                  onClick={handleLoadSample800Format}
                  className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Isi Contoh Format
                </button>
              </div>

              <textarea
                value={pasteContent}
                onChange={e => setPasteContent(e.target.value)}
                placeholder="Contoh format:&#10;NISN, Nama Siswa, Kelas, Ruang Ujian, Nomor Peserta, Agama&#10;0068192001, Ahmad Fauzi, VII-1, Lab Komputer 01, U-24-VII1-001, Islam&#10;0068192002, Siti Rahmawati, VII-1, Lab Komputer 01, U-24-VII1-002, Islam..."
                rows={9}
                className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs leading-relaxed focus:outline-indigo-500 bg-slate-50/50"
              />

              <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-700">Petunjuk Salin dari Excel / Spreadsheet:</div>
                <p>
                  1. Buat kolom di Excel: <b>NISN | Nama Siswa | Kelas | Ruang Ujian | Nomor Peserta | Agama</b>
                </p>
                <p>2. Blok seluruh baris siswa (hingga 800 baris atau lebih), tekan <b>Ctrl + C</b>, lalu <b>Ctrl + V</b> di kotak atas.</p>
                <p>3. Format pemisah koma, titik koma, atau Tab (copy Excel) otomatis dikenali sistem.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
                <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">Pilih File Data Siswa</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Mendukung format file <b>.csv</b> atau <b>.txt</b> dengan baris data siswa
                </p>
                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                  <UploadCloud className="w-4 h-4" /> Cari File di Komputer
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={handleProcessImport}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Import Sekarang ke Sistem CBT
          </button>
        </div>
      </div>
    </div>
  );
};
