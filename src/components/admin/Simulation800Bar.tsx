import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  BarChart3,
  FileSpreadsheet,
  MonitorCheck,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface Simulation800BarProps {
  onNavigateTab: (tab: any) => void;
}

export const Simulation800Bar: React.FC<Simulation800BarProps> = ({ onNavigateTab }) => {
  const {
    isSimulated800,
    run800StudentsSimulation,
    resetSimulationToStandard,
    users,
    examSessions,
    exams,
  } = useCBT();

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  const studentUsers = users.filter(u => u.role === 'siswa');
  const matExam = exams.find(e => e.id === 'exam-mat-01') || exams[0];
  const matSessions = examSessions.filter(s => s.examId === (matExam?.id || 'exam-mat-01'));

  // Calculate live statistics
  const totalCount = matSessions.length;
  const scores = matSessions.map(s => s.score ?? 0);
  const avgScore = totalCount > 0 ? (scores.reduce((a, b) => a + b, 0) / totalCount).toFixed(1) : '0';
  const highestScore = totalCount > 0 ? Math.max(...scores) : 0;
  const lowestScore = totalCount > 0 ? Math.min(...scores) : 0;
  const kkm = matExam?.kkm || 75;
  const passedCount = scores.filter(sc => sc >= kkm).length;
  const remedialCount = totalCount - passedCount;
  const passRate = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(1) : '0';
  const violationCount = matSessions.filter(s => s.violationsCount > 0).length;
  const lockedCount = matSessions.filter(s => s.status === 'blocked').length;

  const handleTriggerSimulation = () => {
    setIsSimulating(true);
    setSimulationProgress(15);

    setTimeout(() => setSimulationProgress(45), 250);
    setTimeout(() => setSimulationProgress(80), 550);
    setTimeout(() => {
      setSimulationProgress(100);
      run800StudentsSimulation();
      setIsSimulating(false);
      setSimulationProgress(0);
    }, 850);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-900/60 relative overflow-hidden mb-6">
      {/* Background Accent glow */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -top-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Info */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Simulasi Massal CBT Skala Besar
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {totalCount} Siswa Terdata
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
              24 Rombel (VII-1 s/d IX-8)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
              10 Lab Komputer
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Uji Coba Ujian 800 Siswa Serentak
              <span className="text-xs font-normal text-slate-400">({matExam?.title || 'Matematika'})</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Hasil pengerjaan 800 siswa secara otomatis terekam lengkap dengan jawaban tiap butir soal, distribusi kurva nilai, perbandingan antar kelas, dan log pengawasan integritas.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Rata-Rata Skor</div>
              <div className="text-lg font-bold font-mono text-indigo-400">{avgScore}</div>
              <div className="text-[10px] text-slate-400">KKM: {kkm}</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Ketuntasan KKM</div>
              <div className="text-lg font-bold font-mono text-emerald-400">{passRate}%</div>
              <div className="text-[10px] text-emerald-300/80">{passedCount} Tuntas / {remedialCount} Remedial</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Rentang Skor</div>
              <div className="text-lg font-bold font-mono text-amber-400">{highestScore} / {lowestScore}</div>
              <div className="text-[10px] text-slate-400">Tertinggi / Terendah</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Integritas Lab</div>
              <div className="text-lg font-bold font-mono text-rose-400">{violationCount} Siswa</div>
              <div className="text-[10px] text-rose-300/80">{lockedCount} Akun Terkunci</div>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
          <button
            onClick={handleTriggerSimulation}
            disabled={isSimulating}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Menguji 800 Siswa ({simulationProgress}%)...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Simulasi Ulang 800 Siswa (Acak Nilai Baru)
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateTab('hasil_ujian')}
              className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Tabel Hasil
            </button>

            <button
              onClick={() => onNavigateTab('analisis_statistik')}
              className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              Statistik
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateTab('konsol_proktor')}
              className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <MonitorCheck className="w-3.5 h-3.5 text-amber-400" />
              Denah 10 Lab
            </button>

            {isSimulated800 ? (
              <button
                onClick={resetSimulationToStandard}
                className="px-3 py-2 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/80 text-slate-400 hover:text-rose-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Kembalikan ke data standar sekolah 7 siswa"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Data
              </button>
            ) : (
              <button
                onClick={handleTriggerSimulation}
                className="px-3 py-2 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700 text-indigo-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                Aktifkan 800 Siswa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
