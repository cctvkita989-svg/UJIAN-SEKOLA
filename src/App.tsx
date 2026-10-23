import React, { useState } from 'react';
import { CBTProvider, useCBT } from './context/CBTContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GuruDashboard } from './components/guru/GuruDashboard';
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { CBTExamRoom } from './components/siswa/CBTExamRoom';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentRole, activeExamTaking, schoolProfile } = useCBT();
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // If not authenticated, always display the simple and elegant login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // If a student is currently taking an exam, enter focused full-screen CBT mode
  if (activeExamTaking) {
    return <CBTExamRoom />;
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col justify-between text-stone-900">
      <div>
        <Header onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)} />

        <main>
          {currentRole === 'admin' && <AdminDashboard />}
          {currentRole === 'guru' && <GuruDashboard />}
          {currentRole === 'siswa' && <SiswaDashboard />}
        </main>
      </div>

      <footer className="mt-12 py-6 border-t border-stone-200/80 bg-[#faf9f5] text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-stone-800">{schoolProfile.name}</span>
            <span className="mx-1.5">·</span>
            <span>NPSN: {schoolProfile.npsn}</span>
            <span className="mx-1.5">·</span>
            <span>Tahun Pelajaran {schoolProfile.academicYear}</span>
          </div>
          <div className="font-medium text-stone-600">
            Sistem Ujian Sekolah (CBT)
          </div>
        </div>
      </footer>

      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <CBTProvider>
      <MainAppContent />
    </CBTProvider>
  );
}
