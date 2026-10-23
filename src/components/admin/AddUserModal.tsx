import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, UserCheck } from 'lucide-react';
import { Role } from '../../types/cbt';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: Role;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, defaultRole = 'guru' }) => {
  const { addUser, classes, subjects } = useCBT();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    role: defaultRole,
    nip: '',
    nisn: '',
    agama: 'Islam' as 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu',
    kelas: classes[0]?.name || 'VII-1',
    mapel: subjects[0]?.name || 'Matematika',
    ruangUjian: 'Lab Komputer 01',
    sesiUjian: 'Sesi 1 (07.30 - 09.30)',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim()) return;

    addUser({
      name: formData.name.trim(),
      username: formData.username.trim().toLowerCase(),
      password: formData.password.trim() || `${formData.role}123`,
      email: formData.email.trim() || `${formData.username.toLowerCase()}@sekolah.sch.id`,
      role: formData.role,
      nip: formData.role === 'guru' || formData.role === 'admin' ? formData.nip.trim() : undefined,
      nisn: formData.role === 'siswa' ? formData.nisn.trim() : undefined,
      agama: formData.role === 'siswa' ? formData.agama : undefined,
      kelas: formData.role === 'siswa' ? formData.kelas : undefined,
      mapel: formData.role === 'guru' ? formData.mapel : undefined,
      ruangUjian: formData.role === 'siswa' ? formData.ruangUjian : undefined,
      sesiUjian: formData.role === 'siswa' ? formData.sesiUjian : undefined,
      nomorPeserta: formData.role === 'siswa' ? `U-24-${formData.kelas}-${Math.floor(100 + Math.random() * 900)}` : undefined,
      statusLogin: 'offline',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tambah Akun Pengguna CBT</h3>
              <p className="text-xs text-slate-500">Buat akses login untuk Admin, Guru, atau Siswa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Peran Pengguna (Role)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'guru', 'siswa'] as Role[]).map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center capitalize transition-colors ${
                    formData.role === r
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {r === 'admin' ? 'Administrator' : r === 'guru' ? 'Guru / Pengawas' : 'Siswa Peserta'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Dra. Hj. Siti Rohmah, M.Pd"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username Login <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: guru_matika"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password Login
              </label>
              <input
                type="text"
                placeholder={`Default: ${formData.role}123`}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Pengguna
            </label>
            <input
              type="email"
              placeholder="nama@sekolah.sch.id"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Conditional Fields based on Role */}
          {formData.role === 'guru' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  NIP Pegawai
                </label>
                <input
                  type="text"
                  placeholder="19800101 200501 1 001"
                  value={formData.nip}
                  onChange={e => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mata Pelajaran Binaan
                </label>
                <input
                  type="text"
                  placeholder="Matematika Peminatan"
                  value={formData.mapel}
                  onChange={e => setFormData({ ...formData, mapel: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none"
                />
              </div>
            </div>
          )}

          {formData.role === 'siswa' && (
            <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    NISN Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0068192000"
                    value={formData.nisn}
                    onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Agama Siswa <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.agama}
                    onChange={e => setFormData({ ...formData, agama: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none font-semibold text-indigo-700"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kelas / Rombel
                  </label>
                  <select
                    value={formData.kelas}
                    onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none font-mono"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.tingkat})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ruang Lab Ujian
                  </label>
                  <select
                    value={formData.ruangUjian}
                    onChange={e => setFormData({ ...formData, ruangUjian: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none"
                  >
                    <option value="Lab Komputer 01">Lab Komputer 01</option>
                    <option value="Lab Komputer 02">Lab Komputer 02</option>
                    <option value="Lab Komputer 03">Lab Komputer 03</option>
                  </select>
                </div>
              </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sesi Ujian
                  </label>
                  <select
                    value={formData.sesiUjian}
                    onChange={e => setFormData({ ...formData, sesiUjian: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none"
                  >
                    <option value="Sesi 1 (07.30 - 09.30)">Sesi 1 (07.30 - 09.30)</option>
                    <option value="Sesi 2 (10.00 - 12.00)">Sesi 2 (10.00 - 12.00)</option>
                    <option value="Sesi 3 (13.00 - 15.00)">Sesi 3 (13.00 - 15.00)</option>
                  </select>
                </div>
              </div>
          )}

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
              Simpan Pengguna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
