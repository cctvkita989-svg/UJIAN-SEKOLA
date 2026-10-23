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
    <div className="min-h-screen bg-[#f7f6f2] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,78,59,0.08),rgba(255,255,255,0))] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Lockup */}
        <div className="text-center">
          <div className="w-13 h-13 rounded-2xl bg-emerald-800 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-sm ring-4 ring-emerald-100/60">
            U
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">
            Ujian Sekolah
          </h1>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-stone-500">
            <span className="font-medium text-stone-700">{schoolProfile.name}</span>
            <span>·</span>
            <span>TA {schoolProfile.academicYear}</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {schoolProfile.examTitle}
          </p>
        </div>

        {/* Main Card */}
        <div className="mt-7 bg-[#fdfdfc] py-8 px-6 sm:px-8 border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="mb-6">
            <h2 className="text-base font-bold text-stone-900">
              Masuk ke Portal Ujian
            </h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
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
                className="block text-xs font-semibold text-stone-700 mb-1.5"
              >
                Username atau NISN Siswa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Contoh: admin, sri.wahyuni, atau ahmad.fauzi"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-stone-50/60 hover:bg-white focus:bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-3 focus:ring-emerald-700/15 focus:border-emerald-800 font-sans transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-stone-700 mb-1.5"
              >
                Password Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-sm bg-stone-50/60 hover:bg-white focus:bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-3 focus:ring-emerald-700/15 focus:border-emerald-800 font-sans transition-all placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
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
              <span className="text-stone-400 text-[11px]">Kendala login ujian?</span>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>Reset Password (Siswa / Admin)</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
                {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>
        </div>

        {/* Tombol Unduh dist.zip untuk Proktor/Pengelola */}
        <div className="mt-5 p-3.5 bg-[#fdfdfc] border border-stone-200/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">File Paket Web (dist.zip)</div>
              <div className="text-[11px] text-stone-500">Unduh paket siap pakai untuk Netlify / server sekolah</div>
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
