import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  Printer,
  FileText,
  Users,
  Calendar,
  Clock,
  School,
  CheckCircle2,
  QrCode,
  Download
} from 'lucide-react';
import { Exam, User } from '../../types/cbt';

export const ExamAdministrationDocs: React.FC = () => {
  const { exams, users, schoolProfile, classes, subjects, examSessions } = useCBT();

  const [activeDocType, setActiveDocType] = useState<'kartu_peserta' | 'daftar_hadir' | 'berita_acara' | 'nomor_meja' | 'daftar_nilai'>('daftar_nilai');
  const [selectedClass, setSelectedClass] = useState<string>('VII-1');
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');

  const students = users.filter(u => u.role === 'siswa');
  const filteredStudents = selectedClass === 'ALL'
    ? students
    : students.filter(s => s.kelas === selectedClass);

  const selectedExam = exams.find(e => e.id === selectedExamId) || exams[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* SCREEN CONTROLS (Hidden during printing via print:hidden) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Dokumen Administrasi Ujian Resmi</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cetak berkas fisik siap pakai (Daftar Nilai Siswa Per Kelas Siap Bagikan ke Orang Tua, Kartu Ujian Barcode, Daftar Hadir, Berita Acara, & Label Meja).
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Sekarang (PDF / Print)</span>
          </button>
        </div>

        {/* DOC TYPE SELECTOR TABS */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveDocType('daftar_nilai')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeDocType === 'daftar_nilai'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Daftar Nilai Siswa Per Kelas (PDF Ortu)</span>
          </button>
          <button
            onClick={() => setActiveDocType('kartu_peserta')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDocType === 'kartu_peserta'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kartu Peserta Ujian (A4 4-in-1)
          </button>
          <button
            onClick={() => setActiveDocType('daftar_hadir')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDocType === 'daftar_hadir'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Daftar Hadir Ruang Ujian
          </button>
          <button
            onClick={() => setActiveDocType('berita_acara')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDocType === 'berita_acara'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Berita Acara Pelaksanaan (BAP)
          </button>
          <button
            onClick={() => setActiveDocType('nomor_meja')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeDocType === 'nomor_meja'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Nomor Meja Ruang Kelas
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Pilih Rombel / Kelas:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg outline-none bg-slate-50"
            >
              <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>
                  Kelas {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Pilih Paket Ujian:</span>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg outline-none bg-slate-50 max-w-xs truncate"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  [{ex.examCategory || 'PAS'}] {ex.subject} ({ex.gradeLevel})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE DOCUMENT AREA (Styled specifically for standard A4 Paper)
         ========================================================================= */}
      <div className="bg-white border border-slate-300 rounded-xl p-8 shadow-sm font-sans text-slate-900 print:border-none print:shadow-none print:p-0">

        {/* 0. DAFTAR NILAI RESMI SISWA PER KELAS / PER RUANG (SIAP CETAK / PDF ORANG TUA) */}
        {activeDocType === 'daftar_nilai' && (() => {
          const kkm = selectedExam?.kkm || 75;
          const classSessions = filteredStudents.map(student => {
            const session = examSessions.find(s => s.studentId === student.id && s.examId === selectedExam?.id)
              || examSessions.find(s => s.studentId === student.id);
            return {
              student,
              session,
              attendanceStatus: session?.attendanceStatus || 'cbt',
              score: session?.score ?? 0,
              isSubmitted: session?.status === 'submitted' || session?.attendanceStatus === 'tertulis'
            };
          });

          // Metrics calculation
          const cbtCount = classSessions.filter(cs => cs.attendanceStatus === 'cbt').length;
          const writtenCount = classSessions.filter(cs => cs.attendanceStatus === 'tertulis').length;
          const sickCount = classSessions.filter(cs => cs.attendanceStatus === 'sakit').length;
          const permitCount = classSessions.filter(cs => cs.attendanceStatus === 'izin').length;
          const absentCount = classSessions.filter(cs => cs.attendanceStatus === 'absen').length;

          const scoredSessions = classSessions.filter(cs => cs.attendanceStatus === 'cbt' || cs.attendanceStatus === 'tertulis');
          const scores = scoredSessions.map(cs => cs.score);
          const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
          const minScore = scores.length > 0 ? Math.min(...scores) : 0;
          const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';
          const passedCount = scores.filter(sc => sc >= kkm).length;
          const passPct = scores.length > 0 ? Math.round((passedCount / scores.length) * 100) : 0;

          return (
            <div className="space-y-6">
              <div className="text-center print:hidden pb-3 border-b border-slate-200">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                  Pratinjau Format Daftar Nilai Kelas Resmi (Siap Dicetak & Dibagikan ke Orang Tua / Wali Siswa)
                </span>
              </div>

              {/* KOP SURAT RESMI */}
              <div className="border-b-4 border-double border-slate-900 pb-3 text-center space-y-1">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0">
                    CBT
                  </div>
                  <div className="flex-1 px-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      PEMERINTAH DAERAH / KEMENTERIAN AGAMA REPUBLIK INDONESIA
                    </div>
                    <div className="text-lg font-black text-slate-950 uppercase tracking-wide leading-tight">
                      {schoolProfile.name}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      NPSN: {schoolProfile.npsn || '10293847'} • {schoolProfile.address || 'Jl. Pendidikan No. 01, Wilayah Terakreditasi'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Website: cbt.sekolah.sch.id • Email: cbt@{schoolProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sekolah'}.sch.id
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl border-2 border-slate-900 flex flex-col items-center justify-center font-mono text-[10px] font-bold text-slate-800 shrink-0">
                    <span>KELAS</span>
                    <span className="text-base font-black text-indigo-700">{selectedClass}</span>
                  </div>
                </div>
              </div>

              {/* JUDUL DOKUMEN & IDENTITAS PENILAIAN */}
              <div className="text-center space-y-0.5">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide underline decoration-slate-400">
                  DAFTAR NILAI & HASIL EVALUASI SISWA PER RUANG KELAS
                </h2>
                <p className="text-xs font-semibold text-slate-700">
                  {selectedExam?.title || 'PENILAIAN AKHIR SEMESTER (PAS) GANJIL'} • TAHUN PELAJARAN {schoolProfile.academicYear} ({schoolProfile.semester})
                </p>
              </div>

              {/* META GRID INFORMASI */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium border border-slate-300 rounded-lg p-3 bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-32 text-slate-500">Mata Pelajaran</span>
                    <span className="font-bold text-slate-900">: {selectedExam?.subject}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500">Rombongan Belajar</span>
                    <span className="font-bold text-slate-900">: Kelas {selectedClass}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500">Guru Mata Pelajaran</span>
                    <span className="font-bold text-slate-900">: {selectedExam?.teacherName || 'Ibu Guru Pengampu, S.Pd'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-32 text-slate-500">Kriteria Ketuntasan (KKM)</span>
                    <span className="font-mono font-bold text-slate-900">: {kkm}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500">Tanggal Pelaksanaan</span>
                    <span className="font-bold text-slate-900">: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500">Waktu & Durasi</span>
                    <span className="font-bold text-slate-900">: {selectedExam?.startTime} - {selectedExam?.endTime} WIB ({selectedExam?.durationMinutes} Menit)</span>
                  </div>
                </div>
              </div>

              {/* TABEL NILAI PESERTA */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                      <th className="py-2 px-3 border-r border-slate-300 w-28">NISN</th>
                      <th className="py-2 px-3 border-r border-slate-300">Nama Lengkap Siswa</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center w-12">L/P</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-36">Metode & Kehadiran</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center w-20">Nilai Akhir</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-28">Ketuntasan KKM</th>
                      <th className="py-2 px-3 border-slate-300">Keterangan / Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400">
                          Tidak ada siswa yang terdaftar di kelas {selectedClass}.
                        </td>
                      </tr>
                    ) : (
                      classSessions.map((item, idx) => {
                        const { student, session, attendanceStatus, score } = item;
                        const isPassed = score >= kkm;

                        let statusLabel = '💻 CBT Online';
                        let statusColor = 'text-slate-800';
                        if (attendanceStatus === 'tertulis') {
                          statusLabel = '📝 Ujian Tertulis';
                          statusColor = 'text-purple-800 font-semibold';
                        } else if (attendanceStatus === 'sakit') {
                          statusLabel = '🤒 Sakit';
                          statusColor = 'text-amber-800 font-semibold';
                        } else if (attendanceStatus === 'izin') {
                          statusLabel = '✉️ Izin Resmi';
                          statusColor = 'text-sky-800 font-semibold';
                        } else if (attendanceStatus === 'absen') {
                          statusLabel = '❌ Absen / Alpa';
                          statusColor = 'text-rose-800 font-semibold';
                        }

                        let kkmLabel = isPassed ? 'TUNTAS' : 'REMEDIAL';
                        let kkmClass = isPassed ? 'font-bold text-emerald-800' : 'font-bold text-rose-800';

                        if (attendanceStatus === 'sakit' || attendanceStatus === 'izin') {
                          kkmLabel = 'SUSULAN';
                          kkmClass = 'font-semibold text-amber-800';
                        } else if (attendanceStatus === 'absen') {
                          kkmLabel = 'TIDAK HADIR';
                          kkmClass = 'font-semibold text-rose-700';
                        }

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2 px-2 border-r border-slate-300 text-center font-mono text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-300 font-mono text-slate-700">
                              {student.nisn || '-'}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-900">
                              {student.name}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-300 text-center font-mono text-slate-600">
                              {idx % 2 === 0 ? 'L' : 'P'}
                            </td>
                            <td className={`py-2 px-3 border-r border-slate-300 text-center ${statusColor}`}>
                              {statusLabel}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-300 text-center font-mono font-black text-sm">
                              {attendanceStatus === 'sakit' || attendanceStatus === 'izin' || attendanceStatus === 'absen' ? (
                                <span className="text-slate-400 font-normal">-</span>
                              ) : (
                                <span className={score >= kkm ? 'text-slate-900' : 'text-rose-700 font-bold'}>
                                  {score}
                                </span>
                              )}
                            </td>
                            <td className={`py-2 px-3 border-r border-slate-300 text-center text-[11px] ${kkmClass}`}>
                              {kkmLabel}
                            </td>
                            <td className="py-2 px-3 border-slate-300 text-slate-600 text-[11px]">
                              {session?.attendanceNotes || (
                                attendanceStatus === 'sakit'
                                  ? 'Menunggu jadwal ujian susulan'
                                  : attendanceStatus === 'izin'
                                  ? 'Izin terkonfirmasi pihak sekolah'
                                  : attendanceStatus === 'absen'
                                  ? 'Belum hadir tanpa keterangan'
                                  : isPassed
                                  ? 'Tuntas Kriteria Ketuntasan Minimal'
                                  : 'Mengikuti program bimbingan remedial'
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* REKAPITULASI STATISTIK KELAS */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50 space-y-2 text-xs">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  Rekapitulasi Kehadiran & Nilai Kelas {selectedClass}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-500">Jumlah Siswa:</span>{' '}
                    <strong className="font-mono">{filteredStudents.length} Siswa</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Hadir CBT:</span>{' '}
                    <strong className="font-mono text-emerald-700">{cbtCount} Siswa</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Ujian Tertulis:</span>{' '}
                    <strong className="font-mono text-purple-700">{writtenCount} Siswa</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Sakit / Izin / Absen:</span>{' '}
                    <strong className="font-mono text-amber-700">{sickCount + permitCount + absentCount} Siswa</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Nilai Tertinggi:</span>{' '}
                    <strong className="font-mono text-slate-900">{maxScore}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Nilai Terendah:</span>{' '}
                    <strong className="font-mono text-slate-900">{minScore}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Rata-rata Nilai:</span>{' '}
                    <strong className="font-mono text-indigo-700">{avgScore}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Ketuntasan KKM:</span>{' '}
                    <strong className="font-mono text-emerald-800">{passPct}% ({passedCount} Siswa)</strong>
                  </div>
                </div>
              </div>

              {/* LEMBAR TANDA TANGAN 3 KOLOM RESMI */}
              <div className="grid grid-cols-3 gap-6 pt-6 text-xs font-medium text-center">
                <div className="space-y-12">
                  <div>
                    Pengawas Ruang Kelas,
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">Budi Santoso, S.Kom</div>
                    <div className="font-mono text-slate-500 text-[10px]">NIP. 198509122010011015</div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div>
                    Guru Mata Pelajaran,
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">{selectedExam?.teacherName || 'Ibu Sri Wahyuni, S.Pd'}</div>
                    <div className="font-mono text-slate-500 text-[10px]">NIP. 198007202005012009</div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div>
                    Mengetahui,<br />
                    Kepala Sekolah,
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">Drs. H. Mulyadi, M.Pd</div>
                    <div className="font-mono text-slate-500 text-[10px]">NIP. 197405121999031002</div>
                  </div>
                </div>
              </div>

              <div className="print:hidden p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-800 flex items-center justify-between">
                <span>💡 Klik tombol <strong>Cetak Dokumen Sekarang</strong> di bagian atas untuk mencetak atau menyimpan dokumen ini sebagai file PDF.</span>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold cursor-pointer"
                >
                  Print / Simpan PDF
                </button>
              </div>
            </div>
          );
        })()}

        {/* 1. KARTU PESERTA UJIAN (GRID 2x2 PER A4 SHEET) */}
        {activeDocType === 'kartu_peserta' && (
          <div className="space-y-6">
            <div className="text-center print:hidden pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                Pratinjau Format Kartu Peserta Ujian (Siap Cetak & Digunting)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
              {filteredStudents.map((st, idx) => (
                <div
                  key={st.id}
                  className="border-2 border-slate-800 rounded-lg p-4 bg-white relative flex flex-col justify-between page-break-inside-avoid"
                  style={{ minHeight: '260px' }}
                >
                  {/* KOP KARTU */}
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      CBT
                    </div>
                    <div className="flex-1 text-center pr-4">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        KARTU TANDA PESERTA UJIAN
                      </div>
                      <div className="text-xs font-black text-slate-900 leading-tight uppercase">
                        {schoolProfile.name}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        TA {schoolProfile.academicYear} · Semester {schoolProfile.semester}
                      </div>
                    </div>
                  </div>

                  {/* BODY INFO */}
                  <div className="grid grid-cols-3 gap-3 my-3">
                    <div className="col-span-2 space-y-1 text-xs">
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">No. Peserta</span>
                        <span className="font-mono font-bold text-slate-900">: {st.nomorPeserta || `U-24-${idx + 100}`}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Nama Siswa</span>
                        <span className="font-bold text-slate-900 truncate">: {st.name}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">NISN / Kelas</span>
                        <span className="font-mono text-slate-800">: {st.nisn || '-'} / {st.kelas}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Ruang Lab</span>
                        <span className="font-semibold text-slate-800">: {st.ruangUjian || 'Lab Komputer 01'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Sesi Ujian</span>
                        <span className="text-slate-800">: {st.sesiUjian || 'Sesi 1'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Username</span>
                        <span className="font-mono font-bold text-indigo-700">: {st.username}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Password</span>
                        <span className="font-mono font-bold text-slate-900">: {st.password || 'siswa123'}</span>
                      </div>
                    </div>

                    {/* QR CODE & PHOTO BOX */}
                    <div className="col-span-1 flex flex-col items-center justify-center border border-slate-300 rounded p-1 bg-slate-50">
                      <div className="w-14 h-14 bg-white border border-slate-300 rounded flex items-center justify-center text-slate-800">
                        <QrCode className="w-10 h-10" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase">Scan QR Meja</span>
                      <div className="w-12 h-8 border border-dashed border-slate-300 rounded mt-1 flex items-center justify-center text-[8px] text-slate-400">
                        Foto 2x3
                      </div>
                    </div>
                  </div>

                  {/* TANDA TANGAN KEPSEK / PANITIA */}
                  <div className="pt-2 border-t border-slate-200 flex items-end justify-between text-[10px]">
                    <div className="text-slate-400 italic text-[9px]">
                      * Harap dibawa saat sesi ujian berlangsung
                    </div>
                    <div className="text-center font-medium">
                      <div>Kepala Sekolah / Ketua Panitia</div>
                      <div className="h-6" />
                      <div className="font-bold underline text-slate-900">Drs. H. Mulyadi, M.Pd</div>
                      <div className="font-mono text-[9px] text-slate-500">NIP. 197405121999031002</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. DAFTAR HADIR RUANG UJIAN (FORM RESMI TANDATANGAN) */}
        {activeDocType === 'daftar_hadir' && (
          <div className="space-y-6">
            {/* KOP SURAT RESMI */}
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="text-sm font-bold uppercase tracking-wider text-slate-700">
                PEMERINTAH PROVINSI / DINAS PENDIDIKAN
              </div>
              <div className="text-lg font-black uppercase text-slate-900">
                {schoolProfile.name}
              </div>
              <div className="text-xs text-slate-600">
                {schoolProfile.address} · NPSN: {schoolProfile.npsn}
              </div>
              <div className="mt-2 text-sm font-black underline uppercase text-slate-900">
                DAFTAR HADIR PESERTA ASESMEN / UJIAN CBT
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Tahun Ajaran {schoolProfile.academicYear} — Semester {schoolProfile.semester}
              </div>
            </div>

            {/* HEADER DETAIL UJIAN */}
            <div className="grid grid-cols-2 gap-4 text-xs font-medium py-2">
              <div className="space-y-1">
                <div>Mata Pelajaran : <strong className="font-bold text-slate-900">{selectedExam?.subject}</strong></div>
                <div>Tingkat / Kelas : <strong className="font-mono text-slate-900">{selectedClass}</strong></div>
                <div>Guru Pengampu : <span>{selectedExam?.teacherName}</span></div>
              </div>
              <div className="space-y-1 text-right">
                <div>Hari, Tanggal : <strong className="text-slate-900">Senin, 12 Oktober 2026</strong></div>
                <div>Waktu / Sesi : <strong className="font-mono text-slate-900">{selectedExam?.startTime} - {selectedExam?.endTime} WIB</strong></div>
                <div>Ruang Ujian : <strong className="text-slate-900">{selectedClass === 'ALL' ? 'Ruang Kelas Masing-Masing' : `Ruang Kelas ${selectedClass}`}</strong></div>
              </div>
            </div>

            {/* TABEL DAFTAR HADIR */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-900 border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-900">
                    <th className="py-2 px-2 border-r border-slate-900 text-center w-10">No</th>
                    <th className="py-2 px-3 border-r border-slate-900 w-32">Nomor Peserta</th>
                    <th className="py-2 px-3 border-r border-slate-900 w-28">NISN</th>
                    <th className="py-2 px-3 border-r border-slate-900">Nama Lengkap Peserta</th>
                    <th className="py-2 px-2 border-r border-slate-900 text-center w-20">Kelas</th>
                    <th className="py-2 px-4 border-r border-slate-900 text-center w-36" colSpan={2}>
                      Tanda Tangan Peserta
                    </th>
                    <th className="py-2 px-3 text-center w-20">Ket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {filteredStudents.map((st, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <tr key={st.id} className="h-10">
                        <td className="py-1 px-2 border-r border-slate-900 text-center font-mono">{idx + 1}</td>
                        <td className="py-1 px-3 border-r border-slate-900 font-mono font-semibold">{st.nomorPeserta || `U-24-${idx + 100}`}</td>
                        <td className="py-1 px-3 border-r border-slate-900 font-mono">{st.nisn}</td>
                        <td className="py-1 px-3 border-r border-slate-900 font-bold uppercase">{st.name}</td>
                        <td className="py-1 px-2 border-r border-slate-900 text-center font-mono">{st.kelas}</td>
                        <td className="py-1 px-2 border-r border-slate-900 text-left w-18 text-[11px] text-slate-400 font-mono">
                          {isEven ? `${idx + 1}. .........` : ''}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-900 text-left w-18 text-[11px] text-slate-400 font-mono">
                          {!isEven ? `${idx + 1}. .........` : ''}
                        </td>
                        <td className="py-1 px-2 text-center text-[10px] font-semibold text-slate-700">
                          Hadir
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* FOOTER PENGAWAS */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-xs font-medium">
              <div>
                <p>Catatan Kehadiran:</p>
                <p>• Jumlah Peserta Seharusnya : <strong>{filteredStudents.length}</strong> orang</p>
                <p>• Jumlah Peserta Hadir : <strong>{filteredStudents.length}</strong> orang</p>
                <p>• Jumlah Peserta Tidak Hadir : <strong>0</strong> orang</p>
              </div>

              <div className="text-center space-y-12">
                <div>Pengawas Ruang Ujian,</div>
                <div>
                  <div className="font-bold underline text-slate-900">({selectedExam?.teacherName || 'Pengawas Ruang 01'})</div>
                  <div className="font-mono text-slate-500 text-[11px]">NIP. 198203152006042008</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. BERITA ACARA PELAKSANAAN (BAP) */}
        {activeDocType === 'berita_acara' && (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                PANITIA PELAKSANA ASESMEN / UJIAN CBT
              </div>
              <div className="text-lg font-black uppercase text-slate-900">
                {schoolProfile.name}
              </div>
              <div className="text-xs text-slate-600">
                {schoolProfile.address} · NPSN: {schoolProfile.npsn}
              </div>
              <div className="mt-3 text-sm font-black underline uppercase text-slate-900">
                BERITA ACARA PELAKSANAAN ASESMEN BERBASIS KOMPUTER (CBT)
              </div>
            </div>

            <div className="text-xs leading-relaxed space-y-4">
              <p>
                Pada hari ini, <strong>Senin</strong> tanggal <strong>12</strong> bulan <strong>Oktober</strong> tahun <strong>2026</strong>, bertempat di <strong>{schoolProfile.name}</strong>, telah diselenggarakan Asesmen / Ujian CBT untuk:
              </p>

              <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-1 font-medium">
                <div className="grid grid-cols-4">
                  <span className="text-slate-500">Mata Pelajaran</span>
                  <span className="col-span-3 font-bold text-slate-900">: {selectedExam?.subject}</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="text-slate-500">Kategori Asesmen</span>
                  <span className="col-span-3 font-bold text-slate-900">: {selectedExam?.examCategory || 'PAS'} ({schoolProfile.semester})</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="text-slate-500">Rombel / Kelas</span>
                  <span className="col-span-3 font-bold text-slate-900">: Kelas {selectedClass}</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="text-slate-500">Waktu Pelaksanaan</span>
                  <span className="col-span-3 font-mono font-bold text-slate-900">: {selectedExam?.startTime} s.d. {selectedExam?.endTime} WIB (Durasi {selectedExam?.durationMinutes} Menit)</span>
                </div>
                <div className="grid grid-cols-4">
                  <span className="text-slate-500">Ruang Ujian</span>
                  <span className="col-span-3 font-bold text-slate-900">: {selectedClass === 'ALL' ? 'Ruang Kelas Masing-Masing' : `Ruang Kelas ${selectedClass}`}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold">1. Keadaan Peserta Ujian:</div>
                <p className="pl-4">• Jumlah Peserta Terdaftar : {filteredStudents.length} Orang</p>
                <p className="pl-4">• Jumlah Peserta Hadir : {filteredStudents.length} Orang</p>
                <p className="pl-4">• Jumlah Peserta Tidak Hadir : 0 Orang</p>
              </div>

              <div className="space-y-1">
                <div className="font-bold">2. Catatan Kejadian Selama Ujian:</div>
                <div className="p-3 border border-slate-300 rounded text-slate-600 bg-white min-h-[70px]">
                  Pelaksanaan ujian berjalan tertib, server proktor lokal berfungsi dengan lancar tanpa hambatan jaringan. Sistem sensor anti-cheat berjalan normal.
                </div>
              </div>

              <p>
                Demikian Berita Acara ini dibuat dengan sebenarnya sesuai dengan jalannya pelaksanaan ujian untuk dapat dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* SIGNATURE SECTION 3 KOLOM */}
            <div className="grid grid-cols-3 gap-6 pt-10 text-xs font-medium text-center">
              <div className="space-y-14">
                <div>Proktor Ujian,</div>
                <div>
                  <div className="font-bold underline text-slate-900">Budi Santoso, S.Kom</div>
                  <div className="font-mono text-slate-500 text-[10px]">NIP. 198509122010011015</div>
                </div>
              </div>

              <div className="space-y-14">
                <div>Pengawas Ruang,</div>
                <div>
                  <div className="font-bold underline text-slate-900">{selectedExam?.teacherName || 'Ibu Sri Wahyuni, S.Pd'}</div>
                  <div className="font-mono text-slate-500 text-[10px]">NIP. 198007202005012009</div>
                </div>
              </div>

              <div className="space-y-14">
                <div>Kepala Sekolah,</div>
                <div>
                  <div className="font-bold underline text-slate-900">Drs. H. Mulyadi, M.Pd</div>
                  <div className="font-mono text-slate-500 text-[10px]">NIP. 197405121999031002</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. LABEL NOMOR MEJA LAB TEMPEL */}
        {activeDocType === 'nomor_meja' && (
          <div className="space-y-6">
            <div className="text-center print:hidden pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                Label Nomor Meja Siswa (Siap Gunting & Tempel pada Meja Ruang Kelas)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
              {filteredStudents.map((st, idx) => (
                <div
                  key={st.id}
                  className="border-2 border-slate-900 rounded-xl p-4 bg-white text-center flex flex-col justify-between"
                  style={{ minHeight: '180px' }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                    {schoolProfile.name}
                  </div>

                  <div className="my-2">
                    <div className="text-xs text-slate-600 font-semibold uppercase">NOMOR MEJA UJIAN</div>
                    <div className="text-3xl font-black font-mono text-slate-900">
                      Meja-{String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 truncate">{st.name}</div>
                    <div className="font-mono text-[11px] text-slate-600">NISN: {st.nisn} · Ruang Kelas {st.kelas}</div>
                    <div className="font-mono text-[10px] font-bold text-indigo-700">USER: {st.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
