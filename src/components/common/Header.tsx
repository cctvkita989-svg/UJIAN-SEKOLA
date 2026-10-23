import React from 'react';
import { useCBT } from '../../context/CBTContext';
import { ShieldCheck, GraduationCap, UserCheck, ArrowRightLeft, LogOut } from 'lucide-react';
import { Role } from '../../types/cbt';

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
          color: 'bg-rose-50 text-rose-700 border border-rose-200',
          icon: ShieldCheck,
          subtitle: 'Panel Kontrol Proktor & Pengaturan Sekolah',
        };
      case 'guru':
        return {
          label: 'Guru Pengampu',
          color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
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
    <header className="sticky top-0 z-40 bg-[#fdfdfc]/95 backdrop-blur-xs border-b border-stone-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-bold text-base shadow-xs ring-4 ring-emerald-50/60">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-stone-900 leading-none">
              Ujian Sekolah
            </span>
            <span className="text-[11px] text-stone-500 mt-1 truncate max-w-[170px] sm:max-w-none">
              {schoolProfile.name}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
          <span className="font-medium text-stone-400">Portal Ujian</span>
          <span className="text-stone-300">/</span>
          <span className="font-semibold text-stone-800">{badge.label}</span>
          <span className="text-stone-300">·</span>
          <span className="text-stone-400">{badge.subtitle}</span>
        </div>

        {/* Zone 3: Account Profile & Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-stone-900 leading-tight">
              {currentUser.name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-stone-500">
              <span className="font-medium text-emerald-800">
                {badge.label}
              </span>
              {currentUser.kelas && (
                <>
                  <span className="text-stone-300">·</span>
                  <span className="font-mono text-stone-600 font-medium">
                    {currentUser.kelas}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRoleSwitcher}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Ganti akun peran untuk simulasi pengujian"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-stone-500" />
              <span>Ganti Akun</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
