import React from 'react';
import { useCBT } from '../../context/CBTContext';
import { ShieldCheck, GraduationCap, UserCheck, ArrowRightLeft, LogOut } from 'lucide-react';
import { Role } from '../../types/cbt';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  onOpenRoleSwitcher: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRoleSwitcher }) => {
  const { currentUser, currentRole, schoolProfile, logout } = useCBT();

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrator CBT',
          color: 'bg-blue-50 text-blue-700 border border-blue-200',
          icon: ShieldCheck,
          subtitle: 'Panel Kontrol Proktor & Pengaturan Sekolah',
        };
      case 'guru':
        return {
          label: 'Guru Pengampu',
          color: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
          icon: GraduationCap,
          subtitle: 'Manajemen Bank Soal & Pengawasan Ruang',
        };
      case 'siswa':
        return {
          label: 'Peserta Ujian',
          color: 'bg-sky-50 text-sky-700 border border-sky-200',
          icon: UserCheck,
          subtitle: 'Portal Asesmen & Ruang Ujian CBT',
        };
    }
  };

  const badge = getRoleBadge(currentRole);

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-xs border-b border-slate-200/90 shadow-2xs print:hidden">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-xs ring-2 sm:ring-4 ring-blue-100/70 shrink-0">
            U
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 leading-none truncate">
              Ujian Sekolah
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate max-w-[120px] xs:max-w-[170px] sm:max-w-none">
              {schoolProfile.name}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-400">Portal Ujian</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">{badge.label}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">{badge.subtitle}</span>
        </div>

        {/* Zone 3: Account Profile & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser.name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
              <span className="font-medium text-blue-700">
                {badge.label}
              </span>
              {currentUser.kelas && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-slate-600 font-medium">
                    {currentUser.kelas}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeSwitcher />

            <button
              onClick={onOpenRoleSwitcher}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
              title="Ganti akun peran (Admin / Guru / Siswa)"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Ganti Akun</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Keluar dari sesi portal ujian"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
