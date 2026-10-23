import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, UserPlus } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const { addUser, classes } = useCBT();
  const [name, setName] = useState('');
  const [nisn, setNisn] = useState('');
  const [kelas, setKelas] = useState(classes[0]?.name || 'VII-1');
  const [jurusan, setJurusan] = useState('Reguler');
  const [agama, setAgama] = useState<'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu'>('Islam');
  const [ruangUjian, setRuangUjian] = useState('Lab Komputer 01');
  const [sesiUjian, setSesiUjian] = useState('Sesi 1 (07.30 - 09.30)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nisn.trim()) return;

    addUser({
      name,
      username: nisn.trim(),
      role: 'siswa',
      nisn: nisn.trim(),
      kelas,
      jurusan,
      agama,
      ruangUjian,
      sesiUjian,
      nomorPeserta: `U-24-${kelas.replace(/\s+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`,
      email: `${nisn.trim()}@siswa.sch.id`,
    });

    setName('');
    setNisn('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Tambah Peserta Ujian Baru</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Siswa *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Muhammad Ilham"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NISN (10 Digit) *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={nisn}
                onChange={e => setNisn(e.target.value)}
                placeholder="0068192099"
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jurusan / Program
              </label>
              <input
                type="text"
                value={jurusan}
                onChange={e => setJurusan(e.target.value)}
                placeholder="Reguler"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Agama Siswa (Wajib untuk Ujian Agama) *
              </label>
              <select
                value={agama}
                onChange={e => setAgama(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen Protestan</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas / Rombel ({classes.length} Pilihan)
              </label>
              <select
                value={kelas}
                onChange={e => setKelas(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.tingkat})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ruang Lab Ujian
              </label>
              <select
                value={ruangUjian}
                onChange={e => setRuangUjian(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Lab Komputer 01">Lab Komputer 01</option>
                <option value="Lab Komputer 02">Lab Komputer 02</option>
                <option value="Lab Komputer 03">Lab Komputer 03</option>
                <option value="Ruang Kelas Utama">Ruang Kelas Utama</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sesi Ujian
            </label>
            <select
              value={sesiUjian}
              onChange={e => setSesiUjian(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="Sesi 1 (07.30 - 09.30)">Sesi 1 (07.30 - 09.30)</option>
              <option value="Sesi 2 (10.00 - 12.00)">Sesi 2 (10.00 - 12.00)</option>
              <option value="Sesi 3 (13.00 - 15.00)">Sesi 3 (13.00 - 15.00)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Simpan Data Siswa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
