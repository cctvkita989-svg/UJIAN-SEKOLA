import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  loadSavedCredentials,
  saveLoginCredentials,
  clearSavedCredentials,
  SavedLoginCredentials
} from '../../utils/savedCredentials';

export const LoginPage: React.FC = () => {
  const { login, schoolProfile } = useCBT();

  const [savedAccount, setSavedAccount] = useState<SavedLoginCredentials | null>(() =>
    loadSavedCredentials()
  );
  const [username, setUsername] = useState<string>(() => savedAccount?.username || '');
  const [password, setPassword] = useState<string>(() => savedAccount?.password || '');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClearSavedAccount = () => {
    clearSavedCredentials();
    setSavedAccount(null);
    setUsername('');
    setPassword('');
    setErrorMessage('');
  };

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
        return;
      }

      if (rememberMe) {
        saveLoginCredentials({
          userId: result.userId,
          username: username.trim(),
          password,
          displayName: result.displayName,
          role: result.role,
        });
      } else {
        clearSavedCredentials();
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#eef4fc] app-bg-root bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.12),rgba(255,255,255,0))] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-100 relative transition-colors duration-200">
      {/* Top Corner Install & Mode Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <PWAInstallButton compact />
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
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Masuk ke Portal Ujian
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Silakan masukkan username/NISN dan password Anda. Hak akses diarahkan otomatis sesuai peran.
            </p>
          </div>

          {savedAccount && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 flex items-center justify-between gap-2.5">
              <div className="flex items-start gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-snug min-w-0">
                  <p className="font-bold text-emerald-900 truncate">
                    Akun Tersimpan Otomatis
                  </p>
                  <p className="text-[11px] text-emerald-700 truncate">
                    {savedAccount.displayName ? `${savedAccount.displayName} · ` : ''}
                    <span className="font-mono">{savedAccount.username}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearSavedAccount}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-[11px] font-semibold text-slate-600 hover:text-rose-700 border border-emerald-200 hover:border-rose-200 transition-colors shrink-0 cursor-pointer"
                title="Hapus akun tersimpan jika memakai akun lain"
              >
                <Trash2 className="w-3 h-3" />
                <span>Ganti</span>
              </button>
            </div>
          )}

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
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  autoFocus={!savedAccount}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-3 focus:ring-blue-600/15 focus:border-blue-600 font-sans transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Simpan username &amp; password di perangkat ini</span>
              </label>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
                {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-stone-400 space-y-1">
          <div>NPSN: {schoolProfile.npsn} · Tahun Pelajaran {schoolProfile.academicYear}</div>
          <div>Sistem Ujian Sekolah Berbasis Komputer (CBT) Mandiri</div>
        </div>
      </div>
    </div>
  );
};
