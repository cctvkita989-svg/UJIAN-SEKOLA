import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Download,
  KeyRound
} from 'lucide-react';
import { ResetPasswordModal } from './ResetPasswordModal';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

export const LoginPage: React.FC = () => {
  const { login, schoolProfile } = useCBT();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Harap masukkan username dan password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      setIsLoading(false);

      if (!result.success) {
        setErrorMessage(result.message);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#eef4fc] app-bg-root bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.12),rgba(255,255,255,0))] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-100 relative transition-colors duration-200">
      {/* Top Corner Mode Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Lockup */}
        <div className="text-center">
          <div className="w-13 h-13 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-sm ring-4 ring-blue-100/70">
            U
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Ujian Sekolah
          </h1>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{schoolProfile.name}</span>
            <span>·</span>
            <span>TA {schoolProfile.academicYear}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {schoolProfile.examTitle}
          </p>
        </div>

        {/* Main Card */}
        <div className="mt-7 bg-white py-8 px-6 sm:px-8 border border-slate-200/90 rounded-2xl shadow-xs">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">
              Masuk ke Portal Ujian
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Silakan masukkan username/NISN dan password Anda. Hak akses diarahkan otomatis sesuai peran.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Username atau NISN Siswa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Contoh NISN: 3142848459, atau admin / guru"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-3 focus:ring-blue-600/15 focus:border-blue-600 font-sans transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-3 focus:ring-blue-600/15 focus:border-blue-600 font-sans transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Reset Password Link */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 text-[11px]">Kendala login ujian?</span>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Reset Password (Siswa / Admin)</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
                {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick 1-Click Demo Logins */}
            <div className="pt-4 border-t border-slate-200/80 space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 text-center">
                Akses Cepat Pengujian (1-Klik Langsung Masuk):
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => login('admin', 'admin123')}
                  className="py-2 px-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
                  title="Masuk sebagai Administrator / Proktor CBT"
                >
                  🔑 Admin CBT
                </button>
                <button
                  type="button"
                  onClick={() => login('guru1', 'guru123')}
                  className="py-2 px-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
                  title="Masuk sebagai Guru Pengampu"
                >
                  👨‍🏫 Guru Mapel
                </button>
                <button
                  type="button"
                  onClick={() => login('ahmad.fauzi', 'siswa123')}
                  className="py-2 px-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
                  title="Masuk sebagai Siswa Peserta Ujian"
                >
                  👨‍🎓 Siswa Ujian
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Tombol Unduh dist.zip untuk Proktor/Pengelola */}
        <div className="mt-5 p-3.5 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">File Paket Web (dist.zip)</div>
              <div className="text-[11px] text-slate-500">Unduh paket siap pakai untuk Netlify / server sekolah</div>
            </div>
          </div>
          <a
            href="/dist.zip"
            download="dist.zip"
            className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh dist.zip</span>
          </a>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-stone-400 space-y-1">
          <div>NPSN: {schoolProfile.npsn} · Tahun Pelajaran {schoolProfile.academicYear}</div>
          <div>Sistem Ujian Sekolah Berbasis Komputer (CBT) Mandiri</div>
        </div>
      </div>

      {/* Modal Reset Password */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccessLogin={(userLogin, passLogin) => {
          setUsername(userLogin);
          setPassword(passLogin);
          setErrorMessage('');
        }}
      />
    </div>
  );
};
