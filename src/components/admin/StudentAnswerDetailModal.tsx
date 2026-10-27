import React from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, Clock, ShieldAlert, Award } from 'lucide-react';
import { ExamSession, Question, Exam } from '../../types/cbt';

interface StudentAnswerDetailModalProps {
  session: ExamSession | null;
  exam: Exam | undefined;
  questions: Question[];
  onClose: () => void;
}

export const StudentAnswerDetailModal: React.FC<StudentAnswerDetailModalProps> = ({
  session,
  exam,
  questions,
  onClose,
}) => {
  if (!session || !exam) return null;

  const kkm = exam.kkm || 75;
  const isPassed = (session.score ?? 0) >= kkm;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="shrink-0 bg-slate-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Lembar Hasil Siswa
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {isPassed ? 'Tuntas KKM' : 'Perlu Remedial'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{session.studentName}</h3>
            <p className="text-xs text-slate-400">
              NISN: <span className="font-mono text-slate-200">{session.studentNisn}</span> • Kelas: <span className="font-semibold text-slate-200">{session.studentClass}</span> • Ruang: <span className="font-semibold text-slate-200">{session.studentRoom}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Summary Strip */}
        <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Skor Akhir</span>
            <span className="text-2xl font-bold font-mono text-indigo-600">{session.score ?? 0}</span>
            <span className="text-[10px] text-slate-400 block">Standar KKM: {kkm}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Jawaban Benar / Salah</span>
            <span className="text-2xl font-bold font-mono text-slate-800">
              <span className="text-emerald-600">{session.correctCount ?? 0}</span> /{' '}
              <span className="text-rose-600">{session.wrongCount ?? 0}</span>
            </span>
            <span className="text-[10px] text-slate-400 block">Total {questions.length} Butir Soal</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Waktu Pengerjaan</span>
            <span className="text-sm font-bold font-mono text-slate-800 block mt-1">
              {session.startedAt || '-'} s/d {session.finishedAt || '-'}
            </span>
            <span className="text-[10px] text-slate-400 block">Durasi Ujian Resmi</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Integritas / Pelanggaran</span>
            <span className="text-sm font-bold font-mono block mt-1">
              {session.violationsCount > 0 ? (
                <span className="text-rose-600 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" /> {session.violationsCount}x tab blur
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Tertib (0x)
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {session.status === 'blocked' ? 'Status: Akun Terkunci' : 'Status: Berhasil Selesai'}
            </span>
          </div>
        </div>

        {/* Detailed Question Answers List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-200 pb-2">
            <span>Rincian Analisis Jawaban Per Butir Soal</span>
            <span>Kunci & Poin</span>
          </div>

          {questions.map((q, idx) => {
            const studentAnsObj = session.answers[q.id];
            const studentChoice = studentAnsObj?.selectedOption || 'Belum Dijawab';
            
            // Check correctness
            let isCorrect = false;
            if (q.type === 'pg') {
              isCorrect = studentChoice.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase();
            } else if (q.type === 'pg_kompleks') {
              const studentArr = studentChoice.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).sort();
              const correctArr = q.correctAnswer.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).sort();
              isCorrect = studentArr.join(',') === correctArr.join(',');
            } else if (q.type === 'benar_salah' || q.type === 'menjodohkan') {
              try {
                isCorrect = JSON.stringify(JSON.parse(studentChoice)) === JSON.stringify(JSON.parse(q.correctAnswer));
              } catch {
                isCorrect = studentChoice === q.correctAnswer;
              }
            }

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-colors ${
                  isCorrect
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                        No. {idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {q.type.replace('_', ' ')}
                      </span>
                      {isCorrect ? (
                        <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Jawaban Benar (+{q.points} poin)
                        </span>
                      ) : (
                        <span className="text-rose-700 font-bold text-xs flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Jawaban Salah (0 poin)
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-900 mt-1">
                      {q.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] font-medium text-slate-400 block">Jawaban Siswa:</span>
                        <span className={`font-mono font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {studentChoice}
                        </span>
                        {studentAnsObj?.isDoubtful && (
                          <span className="text-[10px] text-amber-600 block">Ditandai Ragu-Ragu</span>
                        )}
                      </div>

                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] font-medium text-slate-400 block">Kunci Jawaban Resmi:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {q.correctAnswer}
                        </span>
                      </div>
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 italic pt-1 bg-white/70 p-2 rounded-lg border border-slate-100">
                        💡 Pembahasan: {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Tutup Lembar Jawaban
          </button>
        </div>
      </div>
    </div>
  );
};
