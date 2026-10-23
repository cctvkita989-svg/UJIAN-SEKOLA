import React from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, ShieldCheck, GraduationCap, UserCheck, CheckCircle2 } from 'lucide-react';
import { User } from '../../types/cbt';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, users } = useCBT();

  if (!isOpen) return null;

  const admins = users.filter(u => u.role === 'admin');
  const teachers = users.filter(u => u.role === 'guru');
  const students = users.filter(u => u.role === 'siswa');

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#fdfdfc] rounded-2xl shadow-xl border border-stone-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Simulasi Masuk & Ganti Peran</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Pilih akun untuk menguji perbedaan hak akses dashboard Admin, Guru, atau Siswa
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Section 1: Admin */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-stone-700 tracking-wider">
                AKUN ADMINISTRATOR CBT (HAK AKSES PENUH)
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-3">
              Dapat mengelola semua pengguna, ruang ujian, sesi, token rilis, rekapitulasi nilai sekolah, dan reset login siswa.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {admins.map(user => {
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-800 bg-emerald-50/60 shadow-xs'
                        : 'border-stone-200/90 hover:border-stone-300 hover:bg-stone-50/80'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                        {user.name}
                        {isSelected && (
                          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                            Aktif Sekarang
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5 font-mono">
                        NIP: {user.nip || '-'} · Username: {user.username}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Guru */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-700 tracking-wider">
                AKUN GURU / TENAGA PENDIDIK
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Dapat mengelola bank soal, membuat paket ujian, mengatur jadwal & opsi, dan memantau ruang ujian secara live.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {teachers.map(user => {
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-start justify-between p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-emerald-700 font-medium mt-0.5">
                        Guru {user.mapel}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Username: {user.username}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Siswa */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-700 tracking-wider">
                AKUN SISWA / PESERTA UJIAN CBT
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Dapat melihat kartu ujian, memasukkan token, mengerjakan ujian dengan timer mundur, dan melihat hasil nilai.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {students.map(user => {
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-start justify-between p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-sky-700 font-medium mt-0.5 font-mono">
                        {user.kelas} · {user.ruangUjian}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        NISN: {user.nisn} · No: {user.nomorPeserta}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200/90 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
