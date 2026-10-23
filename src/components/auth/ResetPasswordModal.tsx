import React, { useState } from 'react';
import {
  X,
  KeyRound,
  ShieldAlert,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useCBT } from '../../context/CBTContext';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (username: string, pass: string) => void;
  defaultTab?: 'siswa' | 'admin';
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  defaultTab = 'siswa',
}) => {
  const { resetStudentPasswordByNisn, resetAdminPassword, schoolProfile } = useCBT();

  const [activeTab, setActiveTab] = useState<'siswa' | 'admin'>(defaultTab);

  // Student reset state
  const [studentQuery, setStudentQuery] = useState('');
  const [studentMode, setStudentMode] = useState<'default' | 'custom'>('default');
  const [studentNewPass, setStudentNewPass] = useState('');
  const [studentConfirmPass, setStudentConfirmPass] = useState('');
  const [showStudentPass, setShowStudentPass] = useState(false);

  // Admin reset state
  const [adminRecoveryKey, setAdminRecoveryKey] = useState('');
  const [adminMode, setAdminMode] = useState<'default' | 'custom'>('default');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Feedback state
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<{
    role: 'siswa' | 'admin';
    name: string;
    username: string;
    nisn?: string;
    password: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessData(null);

    if (!studentQuery.trim()) {
      setErrorMsg('Masukkan NISN atau Nama / Username siswa.');
      return;
    }

    let targetPass = 'siswa123';
    if (studentMode === 'custom') {
      if (!studentNewPass || studentNewPass.length < 4) {
        setErrorMsg('Password baru minimal harus 4 karakter.');
        return;
      }
      if (studentNewPass !== studentConfirmPass) {
        setErrorMsg('Konfirmasi password baru tidak cocok.');
        return;
      }
      targetPass = studentNewPass.trim();
    }

    const res = resetStudentPasswordByNisn(studentQuery, targetPass);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessData({
        role: 'siswa',
        name: res.studentName || studentQuery,
        username: res.studentUsername || studentQuery,
        nisn: res.studentNisn,
        password: res.newPassword || targetPass,
        message: res.message,
      });
    }
  };

  const handleResetAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessData(null);

    if (!adminRecoveryKey.trim()) {
      setErrorMsg('Masukkan Kunci Pemulihan / Master Key sekolah.');
      return;
    }

    let targetPass = 'admin123';
    if (adminMode === 'custom') {
      if (!adminNewPass || adminNewPass.length < 5) {
        setErrorMsg('Password baru Admin minimal harus 5 karakter.');
        return;
      }
      if (adminNewPass !== adminConfirmPass) {
        setErrorMsg('Konfirmasi password baru Admin tidak cocok.');
        return;
      }
      targetPass = adminNewPass.trim();
    }

    const res = resetAdminPassword(adminRecoveryKey, targetPass);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessData({
        role: 'admin',
        name: 'Administrator CBT',
        username: 'admin',
        password: res.newPassword || targetPass,
        message: res.message,
      });
    }
  };

  const handleUseAndLogin = () => {
    if (successData && onSuccessLogin) {
      onSuccessLogin(successData.username, successData.password);
      onClose();
    }
  };

  const resetFormState = () => {
    setErrorMsg('');
    setSuccessData(null);
    setStudentQuery('');
    setStudentNewPass('');
    setStudentConfirmPass('');
    setAdminRecoveryKey('');
    setAdminNewPass('');
    setAdminConfirmPass('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-100">Reset & Pemulihan Password</h3>
              <p className="text-[11px] text-stone-400">Pulihkan akses ujian untuk Siswa atau Administrator</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetFormState();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-2 bg-stone-100/80 border-b border-stone-200 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('siswa');
              resetFormState();
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'siswa'
                ? 'bg-white text-emerald-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span>Reset Password Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              resetFormState();
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-purple-950 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>Reset Password Admin</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Error notification */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Result View */}
          {successData ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 text-stone-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Password Berhasil Direset!</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {successData.message}
              </p>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-500">Nama Akun:</span>
                  <span className="font-bold text-stone-900">{successData.name}</span>
                </div>
                {successData.nisn && (
                  <div className="flex justify-between items-center py-1 border-b border-stone-100">
                    <span className="text-stone-500">No. NISN:</span>
                    <span className="font-mono font-semibold text-stone-700">{successData.nisn}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-500">Username Login:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {successData.username}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-500">Password Baru:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800 text-sm bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                      {successData.password}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(successData.password)}
                      title="Salin Password"
                      className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                {onSuccessLogin && (
                  <button
                    type="button"
                    onClick={handleUseAndLogin}
                    className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Isi Form & Masuk Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    onClose();
                  }}
                  className="py-2.5 px-4 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: RESET SISWA */}
              {activeTab === 'siswa' && (
                <form onSubmit={handleResetStudent} className="space-y-4">
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-950">
                    <span className="font-bold">Informasi: </span>
                    Siswa yang lupa password dapat mereset akunnya menggunakan <strong>NISN</strong> atau <strong>Nama Lengkap</strong> yang terdaftar pada kartu ujian.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Nomor NISN atau Nama/Username Siswa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentQuery}
                      onChange={e => setStudentQuery(e.target.value)}
                      placeholder="Contoh: 0068192031 atau ahmad.fauzi"
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                    />
                    <p className="text-[11px] text-stone-400 mt-1">
                      Cukup masukkan NISN (misal: 0068192031) atau username siswa.
                    </p>
                  </div>

                  {/* Mode Pilihan Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Tujuan Password Baru
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setStudentMode('default')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          studentMode === 'default'
                            ? 'border-emerald-700 bg-emerald-50/50 text-emerald-900 font-bold'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <div>Reset ke Bawaan</div>
                        <div className="text-[11px] font-mono text-emerald-700 mt-0.5">siswa123</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentMode('custom')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          studentMode === 'custom'
                            ? 'border-emerald-700 bg-emerald-50/50 text-emerald-900 font-bold'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <div>Buat Sandi Baru</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">Kustom sendiri</div>
                      </button>
                    </div>
                  </div>

                  {studentMode === 'custom' && (
                    <div className="space-y-3 pt-1 border-t border-stone-100 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Password Baru Siswa
                        </label>
                        <div className="relative">
                          <input
                            type={showStudentPass ? 'text' : 'password'}
                            value={studentNewPass}
                            onChange={e => setStudentNewPass(e.target.value)}
                            placeholder="Minimal 4 karakter"
                            className="w-full pl-3.5 pr-10 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                          />
                          <button
                            type="button"
                            onClick={() => setShowStudentPass(!showStudentPass)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                          >
                            {showStudentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Ulangi Password Baru
                        </label>
                        <input
                          type={showStudentPass ? 'text' : 'password'}
                          value={studentConfirmPass}
                          onChange={e => setStudentConfirmPass(e.target.value)}
                          placeholder="Ketik ulang password baru"
                          className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Reset Password Siswa Sekarang</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: RESET ADMIN */}
              {activeTab === 'admin' && (
                <form onSubmit={handleResetAdmin} className="space-y-4">
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-950">
                    <span className="font-bold">Keamanan Administrator: </span>
                    Untuk mereset password Admin Utama, Anda harus memasukkan salah satu <strong>Master Recovery Key</strong> sekolah (Password lama, Kode Keamanan <code>123456</code>, NPSN: <code>{schoolProfile.npsn}</code>, atau <code>admin123</code>).
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Kunci Pemulihan / Master Key Sekolah <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={adminRecoveryKey}
                      onChange={e => setAdminRecoveryKey(e.target.value)}
                      placeholder="Masukkan Master Key (misal: 123456 / NPSN / admin123)"
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                    />
                    <p className="text-[11px] text-stone-400 mt-1">
                      Kunci darurat proktor default: <code>123456</code> atau <code>admin123</code>
                    </p>
                  </div>

                  {/* Mode Password Admin */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Tujuan Password Admin Baru
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setAdminMode('default')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          adminMode === 'default'
                            ? 'border-purple-700 bg-purple-50/50 text-purple-900 font-bold'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <div>Reset ke Default</div>
                        <div className="text-[11px] font-mono text-purple-700 mt-0.5">admin123</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminMode('custom')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          adminMode === 'custom'
                            ? 'border-purple-700 bg-purple-50/50 text-purple-900 font-bold'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <div>Buat Sandi Baru</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">Kustom rahasia</div>
                      </button>
                    </div>
                  </div>

                  {adminMode === 'custom' && (
                    <div className="space-y-3 pt-1 border-t border-stone-100 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Password Baru Admin
                        </label>
                        <div className="relative">
                          <input
                            type={showAdminPass ? 'text' : 'password'}
                            value={adminNewPass}
                            onChange={e => setAdminNewPass(e.target.value)}
                            placeholder="Minimal 5 karakter"
                            className="w-full pl-3.5 pr-10 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPass(!showAdminPass)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                          >
                            {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Konfirmasi Password Baru Admin
                        </label>
                        <input
                          type={showAdminPass ? 'text' : 'password'}
                          value={adminConfirmPass}
                          onChange={e => setAdminConfirmPass(e.target.value)}
                          placeholder="Ulangi password baru"
                          className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-purple-900 hover:bg-purple-950 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Reset Password Admin Sekarang</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
