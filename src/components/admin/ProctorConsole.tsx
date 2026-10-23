import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  Users,
  Clock,
  Unlock,
  AlertTriangle,
  Send,
  PlusCircle,
  Radio,
  XCircle,
  UserCheck,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Trash2,
  Mic,
  MicOff,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { ExamSession, User } from '../../types/cbt';

export const ProctorConsole: React.FC = () => {
  const {
    users,
    exams,
    examSessions,
    broadcastMessages,
    sendProctorBroadcast,
    clearBroadcasts,
    unlockStudent,
    resetStudentSession,
    extendStudentTime,
    forceSubmitStudentSession,
    schoolProfile,
    updateAudioProctoringSettings,
    disciplineNotes,
  } = useCBT();

  const [selectedRoom, setSelectedRoom] = useState<string>('ALL');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('ALL');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [broadcastInput, setBroadcastInput] = useState<string>('');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'urgent'>('normal');
  const [quickExtendMinutes, setQuickExtendMinutes] = useState<number>(10);
  const [activeSubTab, setActiveSubTab] = useState<'seatmap' | 'sessions' | 'audio' | 'broadcast'>('seatmap');
  const [seatPage, setSeatPage] = useState<number>(1);

  const students = users.filter(u => u.role === 'siswa');

  // Dynamic rooms list from all students (e.g. Lab Komputer 01 s/d 10)
  const dynamicRooms: string[] = Array.from(
    new Set(students.map(s => s.ruangUjian).filter((r): r is string => Boolean(r)))
  ).sort();
  const rooms: string[] = ['ALL', ...(dynamicRooms.length > 0 ? dynamicRooms : ['Lab Komputer 01', 'Lab Komputer 02', 'Lab Komputer 03'])];

  // Filter students based on room and search
  const filteredStudents = students.filter(s => {
    const matchRoom = selectedRoom === 'ALL' || (s.ruangUjian || 'Lab Komputer 01') === selectedRoom;
    const matchSearch =
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchStudent)) ||
      (s.kelas && s.kelas.toLowerCase().includes(searchStudent.toLowerCase()));
    return matchRoom && matchSearch;
  });

  const getStudentSession = (studentId: string): ExamSession | undefined => {
    return examSessions.find(s => s.studentId === studentId);
  };

  // Status statistics
  const totalInRoom = filteredStudents.length;
  const inProgressCount = filteredStudents.filter(s => {
    const ses = getStudentSession(s.id);
    return ses?.status === 'in_progress';
  }).length;
  const blockedCount = filteredStudents.filter(s => {
    const ses = getStudentSession(s.id);
    return ses?.status === 'blocked' || s.statusLogin === 'terkunci';
  }).length;
  const submittedCount = filteredStudents.filter(s => {
    const ses = getStudentSession(s.id);
    return ses?.status === 'submitted';
  }).length;
  const notStartedCount = totalInRoom - inProgressCount - blockedCount - submittedCount;
  const audioViolationsCount = filteredStudents.filter(s => {
    const ses = getStudentSession(s.id);
    return (ses?.audioViolationsCount || 0) > 0;
  }).length;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;
    sendProctorBroadcast(broadcastInput, selectedRoom, broadcastPriority);
    setBroadcastInput('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-lg font-bold text-slate-900">Konsol Proktor & Pengawasan Real-Time</h3>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-full border border-indigo-100">
                Live Proctoring
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau denah komputer lab, status peserta, sensor anti-bisik, buka kunci darurat, dan siaran pengumuman.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveSubTab('seatmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSubTab === 'seatmap'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Denah Kursi Lab
            </button>
            <button
              onClick={() => setActiveSubTab('sessions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSubTab === 'sessions'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daftar Sesi
            </button>
            <button
              onClick={() => setActiveSubTab('audio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'audio'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Anti-Bisik {audioViolationsCount > 0 ? `(${audioViolationsCount})` : ''}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('broadcast')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'broadcast'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast ({broadcastMessages.length})</span>
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW RIBBON */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Peserta</div>
            <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">{totalInRoom}</div>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <div className="text-[11px] text-emerald-700 uppercase font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Mengerjakan
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{inProgressCount}</div>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
            <div className="text-[11px] text-rose-700 uppercase font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Terkunci / Pelanggaran
            </div>
            <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">{blockedCount}</div>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
            <div className="text-[11px] text-blue-700 uppercase font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Selesai Dikumpulkan
            </div>
            <div className="text-xl font-bold font-mono text-blue-700 mt-0.5">{submittedCount}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Belum Mulai</div>
            <div className="text-xl font-bold font-mono text-slate-700 mt-0.5">{notStartedCount}</div>
          </div>
        </div>

        {/* FILTERS TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Ruang:
            </span>
            {rooms.map(room => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedRoom === room
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {room === 'ALL' ? 'Semua Ruang' : room}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, NISN, atau kelas..."
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: DENAH TEMPAT DUDUK LAB (SEAT MAP VISUAL) */}
      {activeSubTab === 'seatmap' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Denah Meja Komputer Lab ({selectedRoom === 'ALL' ? 'Semua Lab' : selectedRoom})</span>
              </h4>
              <p className="text-xs text-slate-500">
                Klik kartu komputer siswa untuk melakukan aksi proktor cepat (Buka Kunci, +Waktu, Force Submit).
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Mengerjakan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400" />
                <span>Peringatan Keluar Tab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-600" />
                <span>Terkunci</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span>Selesai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-300" />
                <span>Standby / Offline</span>
              </div>
            </div>
          </div>

          {/* GRID COMPUTER SEATS */}
          {(() => {
            const seatsPerPage = 60;
            const totalSeatPages = Math.max(1, Math.ceil(filteredStudents.length / seatsPerPage));
            const currentSeatPage = Math.min(seatPage, totalSeatPages);
            const pagedStudents = filteredStudents.slice((currentSeatPage - 1) * seatsPerPage, currentSeatPage * seatsPerPage);

            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
                  {pagedStudents.map((student, idx) => {
                    const globalIdx = (currentSeatPage - 1) * seatsPerPage + idx;
              const session = getStudentSession(student.id);
              const isBlocked = session?.status === 'blocked' || student.statusLogin === 'terkunci';
              const isInProgress = session?.status === 'in_progress';
              const isSubmitted = session?.status === 'submitted';
              const hasViolations = (session?.violationsCount || 0) > 0;

              // Border and header color
              let statusBorder = 'border-slate-200 bg-white hover:border-slate-300';
              let statusTag = 'bg-slate-100 text-slate-600';
              let statusLabel = 'Standby';

              if (isBlocked) {
                statusBorder = 'border-rose-300 bg-rose-50/40 hover:border-rose-400 ring-1 ring-rose-200';
                statusTag = 'bg-rose-600 text-white animate-pulse';
                statusLabel = 'TERKUNCI';
              } else if (isInProgress && hasViolations) {
                statusBorder = 'border-amber-300 bg-amber-50/40 hover:border-amber-400';
                statusTag = 'bg-amber-500 text-white';
                statusLabel = `${session?.violationsCount}x Peringatan`;
              } else if (isInProgress) {
                statusBorder = 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400';
                statusTag = 'bg-emerald-600 text-white';
                statusLabel = 'Mengerjakan';
              } else if (isSubmitted) {
                statusBorder = 'border-blue-200 bg-blue-50/30 hover:border-blue-300';
                statusTag = 'bg-blue-600 text-white';
                statusLabel = `Nilai: ${session?.score ?? 0}`;
              }

              const seatNo = `PC-${String(globalIdx + 1).padStart(2, '0')}`;
              const answeredCount = session ? Object.keys(session.answers).length : 0;
              const minsLeft = session ? Math.floor(session.remainingSeconds / 60) : 0;

              return (
                <div
                  key={student.id}
                  className={`rounded-xl border p-3 flex flex-col justify-between transition-all shadow-xs ${statusBorder}`}
                >
                  <div>
                    {/* Top Seat Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="font-mono text-xs font-bold text-slate-800">{seatNo}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusTag}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="mt-2 space-y-1">
                      <div className="font-bold text-xs text-slate-900 truncate" title={student.name}>
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                        <span>{student.kelas}</span>
                        <span>{student.ruangUjian || 'Lab 01'}</span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    {isInProgress && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600 flex items-center justify-between">
                        <span className="font-medium">Jawab: {answeredCount} Soal</span>
                        <span className="font-mono font-bold text-indigo-700">{minsLeft}m</span>
                      </div>
                    )}

                    {/* Live Audio / Whisper Sensor indicator */}
                    {session && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                        <span className="flex items-center gap-1">
                          <Mic className={`w-3 h-3 ${
                            (session.audioViolationsCount || 0) > 0
                              ? 'text-rose-500 animate-pulse'
                              : (session.currentAudioLevel || 0) >= 48
                              ? 'text-rose-500'
                              : (session.currentAudioLevel || 0) >= 38
                              ? 'text-amber-500'
                              : 'text-emerald-500'
                          }`} />
                          <span className={
                            (session.audioViolationsCount || 0) > 0
                              ? 'text-rose-600 font-bold'
                              : (session.currentAudioLevel || 0) >= 48
                              ? 'text-rose-600 font-bold'
                              : (session.currentAudioLevel || 0) >= 38
                              ? 'text-amber-600 font-bold'
                              : 'text-slate-500'
                          }>
                            {session.currentAudioLevel ? `${session.currentAudioLevel} dB` : '30 dB'}
                          </span>
                        </span>
                        {(session.audioViolationsCount || 0) > 0 ? (
                          <span className="px-1 py-0.2 bg-rose-100 text-rose-700 font-bold rounded text-[9px] animate-pulse">
                            {session.audioViolationsCount}x Bisik
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[9px]">
                            Hening
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Proctor Actions for this Seat */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 justify-between">
                    {isBlocked ? (
                      <button
                        onClick={() => unlockStudent(student.id)}
                        className="w-full py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Buka Kunci Akun Siswa"
                      >
                        <Unlock className="w-3 h-3" />
                        <span>Buka Kunci</span>
                      </button>
                    ) : isInProgress ? (
                      <div className="flex items-center gap-1 w-full">
                        <button
                          onClick={() => extendStudentTime(student.id, 10)}
                          className="flex-1 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded border border-indigo-200 transition-colors cursor-pointer"
                          title="Tambah 10 menit waktu pengerjaan"
                        >
                          +10m
                        </button>
                        <button
                          onClick={() => forceSubmitStudentSession(student.id)}
                          className="py-1 px-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-[10px] rounded transition-colors cursor-pointer"
                          title="Kumpulkan Paksa (Force Submit)"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => resetStudentSession(student.id)}
                        className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded transition-colors cursor-pointer"
                        title="Reset sesi pengerjaan ujian"
                      >
                        Reset Sesi
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Seat Pagination if more than 60 PCs */}
          {totalSeatPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-600">
              <div>
                Menampilkan komputer <span className="font-bold font-mono">{(currentSeatPage - 1) * seatsPerPage + 1}</span> s/d{' '}
                <span className="font-bold font-mono">{Math.min(currentSeatPage * seatsPerPage, filteredStudents.length)}</span> dari{' '}
                <span className="font-bold font-mono">{filteredStudents.length}</span> komputer siswa
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSeatPage(prev => Math.max(1, prev - 1))}
                  disabled={currentSeatPage <= 1}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Sebelumnya
                </button>
                <span className="px-2 font-mono font-bold text-indigo-700">
                  Hal {currentSeatPage} / {totalSeatPages}
                </span>
                <button
                  onClick={() => setSeatPage(prev => Math.min(totalSeatPages, prev + 1))}
                  disabled={currentSeatPage >= totalSeatPages}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </>
      );
    })()}
  </div>
)}

      {/* SUB-TAB 2: DAFTAR DETAIL SESI & KONTROL TABLE */}
      {activeSubTab === 'sessions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Daftar Status Sesi Ujian Peserta</h4>
              <p className="text-xs text-slate-500">
                Pemeriksaan detail durasi, aktivitas terakhir, dan kontrol proktor perorangan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-semibold">Aksi Tambah Waktu:</span>
              <select
                value={quickExtendMinutes}
                onChange={e => setQuickExtendMinutes(Number(e.target.value))}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none"
              >
                <option value={5}>+5 Menit</option>
                <option value={10}>+10 Menit</option>
                <option value={15}>+15 Menit</option>
                <option value={30}>+30 Menit</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Peserta & NISN</th>
                  <th className="py-2.5 px-3">Kelas / Ruang</th>
                  <th className="py-2.5 px-3">Status Ujian</th>
                  <th className="py-2.5 px-3">Sisa Waktu</th>
                  <th className="py-2.5 px-3">Pelanggaran</th>
                  <th className="py-2.5 px-3">Aktivitas Terakhir</th>
                  <th className="py-2.5 px-3 text-right">Tindakan Proktor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st, idx) => {
                  const session = getStudentSession(st.id);
                  const isBlocked = session?.status === 'blocked' || st.statusLogin === 'terkunci';
                  const isInProgress = session?.status === 'in_progress';
                  const isSubmitted = session?.status === 'submitted';

                  const hours = session ? Math.floor(session.remainingSeconds / 3600) : 0;
                  const minutes = session ? Math.floor((session.remainingSeconds % 3600) / 60) : 0;
                  const seconds = session ? session.remainingSeconds % 60 : 0;
                  const timeFormatted = `${hours > 0 ? `${hours}:` : ''}${
                    minutes < 10 ? `0${minutes}` : minutes
                  }:${seconds < 10 ? `0${seconds}` : seconds}`;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{st.nisn || '-'}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-700">{st.kelas}</div>
                        <div className="text-[10px] text-slate-400">{st.ruangUjian || 'Lab 01'}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        {isBlocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            Terkunci (Kecurangan)
                          </span>
                        ) : isInProgress ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Sedang Mengerjakan
                          </span>
                        ) : isSubmitted ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                            Selesai (Skor: {session?.score})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            Belum Memulai
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {isInProgress ? timeFormatted : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <div className="space-y-0.5">
                          {session && session.violationsCount > 0 ? (
                            <span className="text-rose-600 font-bold block">{session.violationsCount}x tab blur</span>
                          ) : (
                            <span className="text-slate-400 block">0x tab</span>
                          )}
                          {session && (session.audioViolationsCount || 0) > 0 ? (
                            <span className="text-amber-700 font-bold text-[11px] flex items-center gap-1">
                              <Mic className="w-3 h-3 text-amber-500" />
                              <span>{session.audioViolationsCount}x bisikan</span>
                            </span>
                          ) : session && session.currentAudioLevel ? (
                            <span className="text-slate-400 text-[10px] flex items-center gap-1">
                              <Mic className="w-2.5 h-2.5 text-emerald-500" />
                              <span>{session.currentAudioLevel} dB</span>
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[150px]">
                        {session?.lastActive || 'Tidak aktif'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isBlocked && (
                            <button
                              onClick={() => unlockStudent(st.id)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Unlock className="w-3 h-3" /> Buka Kunci
                            </button>
                          )}
                          {isInProgress && (
                            <>
                              <button
                                onClick={() => extendStudentTime(st.id, quickExtendMinutes)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-bold border border-indigo-200 cursor-pointer"
                                title={`Tambah ${quickExtendMinutes} menit`}
                              >
                                +{quickExtendMinutes}m
                              </button>
                              <button
                                onClick={() => forceSubmitStudentSession(st.id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded text-[11px] font-semibold border border-slate-200 cursor-pointer"
                              >
                                Selesaikan
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => resetStudentSession(st.id)}
                            className="px-2 py-1 text-slate-400 hover:text-slate-700 text-[10px] rounded hover:bg-slate-100 cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SENSOR AUDIO & MONITORING ANTI-BISIK */}
      {activeSubTab === 'audio' && (
        <div className="space-y-6">
          {/* Top Controls & Sensitivity Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>Pengaturan Sensor Audio & Deteksi Bisikan</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {schoolProfile.audioProctoringEnabled ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Sistem CBT menggunakan Web Audio API dengan filter pita suara manusia (300Hz - 3400Hz) untuk mendeteksi desis bisikan dan percakapan peserta secara otomatis.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons & toggle */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* On / Off Toggle */}
                <button
                  type="button"
                  onClick={() => updateAudioProctoringSettings(!schoolProfile.audioProctoringEnabled, schoolProfile.audioSensitivity || 'medium')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border ${
                    schoolProfile.audioProctoringEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {schoolProfile.audioProctoringEnabled ? <Mic className="w-4 h-4 text-emerald-600" /> : <MicOff className="w-4 h-4 text-slate-400" />}
                  <span>{schoolProfile.audioProctoringEnabled ? 'Sensor Suara: AKTIF' : 'Sensor Suara: NONAKTIF'}</span>
                </button>

                {/* Sensitivity Selector */}
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 px-2 uppercase">Sensitivitas:</span>
                  <button
                    type="button"
                    onClick={() => updateAudioProctoringSettings(true, 'low')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      schoolProfile.audioSensitivity === 'low'
                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Rendah: Ambang 62 dB (Hanya percakapan normal / keras)"
                  >
                    Rendah (62 dB)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAudioProctoringSettings(true, 'medium')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      schoolProfile.audioSensitivity === 'medium' || !schoolProfile.audioSensitivity
                        ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Sedang: Ambang 48 dB (Rekomendasi - mendeteksi bisikan dan gumaman peserta)"
                  >
                    Sedang (48 dB - Bisik)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAudioProctoringSettings(true, 'high')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      schoolProfile.audioSensitivity === 'high'
                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Tinggi: Ambang 38 dB (Sangat sensitif - mendeteksi bisikan lirih / desas-desus)"
                  >
                    Tinggi (38 dB)
                  </button>
                </div>

                {/* Quick Broadcast Warning */}
                <button
                  type="button"
                  onClick={() => {
                    sendProctorBroadcast(
                      'PERINGATAN PROKTOR: Seluruh peserta dilarang berbisik, bergumam, atau menoleh. Sensor suara mikrofon mencatat setiap kegaduhan secara otomatis!',
                      selectedRoom,
                      'urgent'
                    );
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Kirim siaran teguran jangan berbisik ke seluruh peserta"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Siarkan Teguran Hening</span>
                </button>
              </div>
            </div>

            {/* Live Audio Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Siswa Terpantau</div>
                <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">{filteredStudents.length} Siswa</div>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <div className="text-[11px] text-emerald-700 uppercase font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Ruang Hening (&lt; 38 dB)
                </div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                  {filteredStudents.filter(s => (getStudentSession(s.id)?.currentAudioLevel || 28) < 38).length} Siswa
                </div>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <div className="text-[11px] text-amber-700 uppercase font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Desas-Desus (38 - 47 dB)
                </div>
                <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">
                  {filteredStudents.filter(s => {
                    const db = getStudentSession(s.id)?.currentAudioLevel || 28;
                    return db >= 38 && db < 48;
                  }).length} Siswa
                </div>
              </div>
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                <div className="text-[11px] text-rose-700 uppercase font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Terdeteksi Bisikan / Suara
                </div>
                <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">
                  {filteredStudents.filter(s => {
                    const ses = getStudentSession(s.id);
                    return (ses?.audioViolationsCount || 0) > 0 || (ses?.currentAudioLevel || 28) >= 48;
                  }).length} Siswa
                </div>
              </div>
            </div>
          </div>

          {/* Table: Live Student Sound Telemetry */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>Matriks Telemetri Audio Siswa Real-Time</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan tingkat kebisingan mikrofon dan histori pelanggaran bisikan dari masing-masing komputer siswa.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Filter Ruang:</span>
                <span className="font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {selectedRoom}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Komputer & Siswa</th>
                    <th className="py-2.5 px-3">Kelas & Ruang</th>
                    <th className="py-2.5 px-3">Level Suara Mikrofon (dB SPL)</th>
                    <th className="py-2.5 px-3">Status Sensor</th>
                    <th className="py-2.5 px-3">Insiden Bisik</th>
                    <th className="py-2.5 px-3">Waktu Insiden Terakhir</th>
                    <th className="py-2.5 px-3 text-right">Tindakan Proktor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st, idx) => {
                    const session = getStudentSession(st.id);
                    const isBlocked = session?.status === 'blocked' || st.statusLogin === 'terkunci';
                    const audioViolations = session?.audioViolationsCount || 0;
                    const dbVal = session?.currentAudioLevel || (isBlocked ? 54 : 26 + (idx % 7));
                    const isWhispering = dbVal >= 48 || audioViolations > 0;
                    const isNearThreshold = dbVal >= 38 && dbVal < 48;

                    return (
                      <tr
                        key={st.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          audioViolations > 0 ? 'bg-rose-50/30' : isNearThreshold ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            PC-{String(idx + 1).padStart(2, '0')} · NISN: {st.nisn}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-700">{st.kelas}</div>
                          <div className="text-[10px] text-slate-500">{st.ruangUjian || 'Lab 01'}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="space-y-1 w-36">
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className={`font-bold tabular-nums ${
                                dbVal >= 48 ? 'text-rose-600 font-black' : dbVal >= 38 ? 'text-amber-600 font-bold' : 'text-emerald-600'
                              }`}>
                                {dbVal} dB SPL
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {dbVal < 38 ? 'Hening' : dbVal < 48 ? 'Desas-desus' : 'Bisikan!'}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  dbVal >= 48
                                    ? 'bg-rose-500'
                                    : dbVal >= 38
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(10, (dbVal / 85) * 100))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {isBlocked ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              Terkunci Otomatis
                            </span>
                          ) : isWhispering ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Terdeteksi Bisikan
                            </span>
                          ) : isNearThreshold ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Mendekati Batas
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Kondusif & Hening
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          {audioViolations > 0 ? (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {audioViolations}x Terdeteksi
                            </span>
                          ) : (
                            <span className="text-slate-400">0x</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                          {session?.lastAudioIncidentAt || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                sendProctorBroadcast(
                                  `Peringatan Khusus untuk ${st.name}: Sensor mendeteksi aktivitas bisikan / suara di komputer Anda. Harap segera hening dan fokus pada soal!`,
                                  st.ruangUjian || 'ALL',
                                  'urgent'
                                );
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Kirim notifikasi peringatan hening khusus ke siswa ini"
                            >
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              <span>Tegur Siswa</span>
                            </button>

                            {isBlocked && (
                              <button
                                type="button"
                                onClick={() => unlockStudent(st.id)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Buka Kunci Akun Siswa"
                              >
                                <Unlock className="w-3 h-3" />
                                <span>Buka Kunci</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Catatan Log Insiden Suara Disiplin Otomatis */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Log Riwayat Insiden Suara & Bisikan Otomatis</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekaman catatan disiplin digital yang terdeteksi oleh sensor audio mikrofon CBT selama sesi berlangsung.
                </p>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                {disciplineNotes.filter(n => n.type === 'kecurangan' || n.title.toLowerCase().includes('audio') || n.title.toLowerCase().includes('bisik')).length} Catatan
              </span>
            </div>

            {disciplineNotes.filter(n => n.type === 'kecurangan' || n.title.toLowerCase().includes('audio') || n.title.toLowerCase().includes('bisik')).length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Belum ada insiden bisikan atau kegaduhan suara yang tercatat. Ruang ujian dalam kondisi kondusif dan hening.
              </div>
            ) : (
              <div className="space-y-3">
                {disciplineNotes
                  .filter(n => n.type === 'kecurangan' || n.title.toLowerCase().includes('audio') || n.title.toLowerCase().includes('bisik'))
                  .map(note => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{note.studentName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {note.studentClass} · NISN: {note.studentNisn}
                          </span>
                          <span className="px-2 py-0.2 bg-rose-600 text-white font-bold rounded-full text-[9px] uppercase tracking-wider">
                            Sensor Audio
                          </span>
                        </div>
                        <div className="font-semibold text-rose-800">{note.title}</div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{note.description}</p>
                      </div>
                      <div className="shrink-0 text-right font-mono text-[11px] text-slate-400">
                        {note.timestamp}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BROADCAST PENGUMUMAN KE LAYAR SISWA */}
      {activeSubTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kirim Pesan Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-1 space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600" />
                <span>Kirim Siaran Layar (Broadcast)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pesan akan langsung muncul sebagai notifikasi pop-up di layar ujian siswa yang sedang mengerjakan.
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Ruangan Lab</label>
                <select
                  value={selectedRoom}
                  onChange={e => setSelectedRoom(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none"
                >
                  <option value="ALL">Semua Ruang Lab (Global)</option>
                  <option value="Lab Komputer 01">Lab Komputer 01</option>
                  <option value="Lab Komputer 02">Lab Komputer 02</option>
                  <option value="Lab Komputer 03">Lab Komputer 03</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Urgensi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastPriority('normal')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      broadcastPriority === 'normal'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    Informasi Biasa
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastPriority('urgent')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      broadcastPriority === 'urgent'
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    Darurat / Mendesak
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Pesan Proktor</label>
                <textarea
                  rows={4}
                  value={broadcastInput}
                  onChange={e => setBroadcastInput(e.target.value)}
                  placeholder="Contoh: Sisa waktu 15 menit lagi, pastikan semua soal telah terjawab dan tanda ragu-ragu dihilangkan..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Template Cepat:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBroadcastInput('Perhatian: Waktu pengerjaan tersisa 10 menit!')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                  >
                    Sisa 10 Menit
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastInput('Harap periksa kembali nomor soal yang masih bertanda ragu-ragu.')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                  >
                    Cek Ragu-ragu
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastInput('Dilarang berbicara atau menengok ke kanan dan kiri.')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                  >
                    Tertib Ruang
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Siaran ke Layar Siswa</span>
              </button>
            </form>
          </div>

          {/* Riwayat Broadcast Aktif */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Riwayat Broadcast Aktif</h4>
                <p className="text-xs text-slate-500">Daftar siaran yang telah dikirimkan ke ruang ujian</p>
              </div>

              {broadcastMessages.length > 0 && (
                <button
                  onClick={clearBroadcasts}
                  className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Bersihkan Siaran
                </button>
              )}
            </div>

            {broadcastMessages.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Belum ada pesan siaran aktif yang dikirimkan.
              </div>
            ) : (
              <div className="space-y-3">
                {broadcastMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl border transition-all ${
                      msg.priority === 'urgent'
                        ? 'border-rose-200 bg-rose-50/50'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            msg.priority === 'urgent'
                              ? 'bg-rose-600 text-white'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {msg.priority === 'urgent' ? 'MENDESAK' : 'INFO'}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{msg.sender}</span>
                        <span className="text-[10px] text-slate-400">· Target: {msg.targetRoom}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
