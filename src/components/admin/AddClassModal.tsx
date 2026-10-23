import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, School } from 'lucide-react';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose }) => {
  const { addClass, users } = useCBT();
  const teachers = users.filter(u => u.role === 'guru');

  const [formData, setFormData] = useState({
    name: '',
    tingkat: 'Kelas XII',
    jurusan: 'MIPA (Matematika & Ilmu Alam)',
    waliKelas: teachers[0]?.name || '',
    ruangLab: '',
    totalStudents: 36,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addClass({
      name: formData.name.trim(),
      tingkat: formData.tingkat,
      jurusan: formData.jurusan,
      waliKelas: formData.waliKelas,
      ruangLab: formData.ruangLab.trim() || `Ruang Kelas ${formData.name.trim()}`,
      totalStudents: Number(formData.totalStudents) || 30,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tambah Kelas Baru</h3>
              <p className="text-xs text-slate-500">Daftarkan rombongan belajar peserta ujian</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Rombel / Kelas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: XII MIPA 3, XI IPS 1, X-A"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tingkat
              </label>
              <select
                value={formData.tingkat}
                onChange={e => setFormData({ ...formData, tingkat: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
              >
                <option value="Kelas X">Kelas X (Fase E)</option>
                <option value="Kelas XI">Kelas XI (Fase F)</option>
                <option value="Kelas XII">Kelas XII</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kapasitas Siswa
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.totalStudents}
                onChange={e => setFormData({ ...formData, totalStudents: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Jurusan / Kurikulum
            </label>
            <input
              type="text"
              placeholder="Contoh: MIPA, IPS, Kurikulum Merdeka"
              value={formData.jurusan}
              onChange={e => setFormData({ ...formData, jurusan: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Wali Kelas
            </label>
            <input
              type="text"
              placeholder="Nama Lengkap Wali Kelas & Gelar"
              value={formData.waliKelas}
              onChange={e => setFormData({ ...formData, waliKelas: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Alokasi Ruang Ujian
            </label>
            <input
              type="text"
              placeholder={formData.name ? `Ruang Kelas ${formData.name}` : 'Ruang Kelas (Otomatis sesuai kelas)'}
              value={formData.ruangLab}
              onChange={e => setFormData({ ...formData, ruangLab: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              Simpan Kelas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
