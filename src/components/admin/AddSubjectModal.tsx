import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, BookOpen } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ isOpen, onClose }) => {
  const { addSubject, users } = useCBT();
  const teachers = users.filter(u => u.role === 'guru');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    kkm: 75,
    guruPengampu: teachers[0]?.name || '',
    tingkat: 'Kelas XII',
    kelompok: 'Peminatan' as 'Umum' | 'Peminatan' | 'Pilihan',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    addSubject({
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      kkm: Number(formData.kkm) || 75,
      guruPengampu: formData.guruPengampu || 'Belum Ditentukan',
      tingkat: formData.tingkat,
      kelompok: formData.kelompok,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tambah Mata Pelajaran</h3>
              <p className="text-xs text-slate-500">Daftarkan mapel baru ke kurikulum ujian CBT</p>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kode Mapel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="MAT-12"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none uppercase font-mono font-bold"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Mata Pelajaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Fisika Peminatan"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nilai KKM Minimal
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={formData.kkm}
                onChange={e => setFormData({ ...formData, kkm: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kelompok Mapel
              </label>
              <select
                value={formData.kelompok}
                onChange={e => setFormData({ ...formData, kelompok: e.target.value as 'Umum' | 'Peminatan' | 'Pilihan' })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
              >
                <option value="Umum">Umum (Wajib)</option>
                <option value="Peminatan">Peminatan</option>
                <option value="Pilihan">Pilihan / Mulok</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tingkat Sasaran
            </label>
            <select
              value={formData.tingkat}
              onChange={e => setFormData({ ...formData, tingkat: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
            >
              <option value="Semua Tingkat">Semua Tingkat (X, XI, XII)</option>
              <option value="Kelas X">Kelas X (Fase E)</option>
              <option value="Kelas XI">Kelas XI (Fase F)</option>
              <option value="Kelas XII">Kelas XII</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Guru Pengampu Utama
            </label>
            <input
              type="text"
              placeholder="Pilih atau ketik nama guru pengampu"
              value={formData.guruPengampu}
              onChange={e => setFormData({ ...formData, guruPengampu: e.target.value })}
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
              Simpan Mapel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
