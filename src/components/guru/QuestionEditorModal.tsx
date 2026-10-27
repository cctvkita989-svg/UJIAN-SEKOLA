import React, { useState, useEffect } from 'react';
import { useCBT } from '../../context/CBTContext';
import { X, Check, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Question, QuestionType, StatementItem, MatchingPair } from '../../types/cbt';

interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  initialQuestion?: Question | null;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  isOpen,
  onClose,
  examId,
  initialQuestion,
}) => {
  const { addQuestion, updateQuestion } = useCBT();

  const [questionType, setQuestionType] = useState<QuestionType>('pg');
  const [questionText, setQuestionText] = useState('');
  
  // Standard PG options
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [optE, setOptE] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');

  // PG Kompleks multi-select answers (e.g. ['A', 'C'])
  const [complexSelected, setComplexSelected] = useState<string[]>(['A']);

  // Benar / Salah statements
  const [statements, setStatements] = useState<StatementItem[]>([
    { id: 'stmt-1', statement: '', correctAnswer: true },
    { id: 'stmt-2', statement: '', correctAnswer: false },
  ]);

  // Menjodohkan pairs
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>([
    { id: 'pair-1', premise: '', correctMatch: '' },
    { id: 'pair-2', premise: '', correctMatch: '' },
  ]);

  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState(10);

  useEffect(() => {
    if (!isOpen) return;

    if (initialQuestion) {
      setQuestionType(initialQuestion.type || 'pg');
      setQuestionText(initialQuestion.questionText);
      const getOptText = (id: string) =>
        initialQuestion.options.find(o => o.id === id)?.text || '';
      setOptA(getOptText('A'));
      setOptB(getOptText('B'));
      setOptC(getOptText('C'));
      setOptD(getOptText('D'));
      setOptE(getOptText('E'));
      setCorrectAnswer(initialQuestion.correctAnswer);
      
      if (initialQuestion.type === 'pg_kompleks') {
        const parts = initialQuestion.correctAnswer.split(',').map(s => s.trim().toUpperCase());
        setComplexSelected(parts);
      } else {
        setComplexSelected(['A']);
      }

      if (initialQuestion.statements && initialQuestion.statements.length > 0) {
        setStatements(initialQuestion.statements);
      } else {
        setStatements([
          { id: 'stmt-1', statement: '', correctAnswer: true },
          { id: 'stmt-2', statement: '', correctAnswer: false },
        ]);
      }

      if (initialQuestion.matchingPairs && initialQuestion.matchingPairs.length > 0) {
        setMatchingPairs(initialQuestion.matchingPairs);
      } else {
        setMatchingPairs([
          { id: 'pair-1', premise: '', correctMatch: '' },
          { id: 'pair-2', premise: '', correctMatch: '' },
        ]);
      }

      setExplanation(initialQuestion.explanation || '');
      setPoints(initialQuestion.points);
    } else {
      setQuestionType('pg');
      setQuestionText('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setOptE('');
      setCorrectAnswer('A');
      setComplexSelected(['A']);
      setStatements([
        { id: 'stmt-1', statement: '', correctAnswer: true },
        { id: 'stmt-2', statement: '', correctAnswer: false },
      ]);
      setMatchingPairs([
        { id: 'pair-1', premise: '', correctMatch: '' },
        { id: 'pair-2', premise: '', correctMatch: '' },
      ]);
      setExplanation('');
      setPoints(10);
    }
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const toggleComplexOption = (optId: string) => {
    setComplexSelected(prev =>
      prev.includes(optId)
        ? prev.filter(x => x !== optId)
        : [...prev, optId].sort()
    );
  };

  const handleAddStatement = () => {
    setStatements(prev => [
      ...prev,
      { id: `stmt-${Date.now()}`, statement: '', correctAnswer: true }
    ]);
  };

  const handleRemoveStatement = (id: string) => {
    setStatements(prev => prev.filter(s => s.id !== id));
  };

  const handleAddMatchingPair = () => {
    setMatchingPairs(prev => [
      ...prev,
      { id: `pair-${Date.now()}`, premise: '', correctMatch: '' }
    ]);
  };

  const handleRemoveMatchingPair = (id: string) => {
    setMatchingPairs(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    let computedCorrectAnswer = correctAnswer;
    let computedOptions = [
      { id: 'A', text: optA.trim() },
      { id: 'B', text: optB.trim() },
      { id: 'C', text: optC.trim() },
      { id: 'D', text: optD.trim() },
      { id: 'E', text: optE.trim() },
    ].filter(o => o.text !== '');

    if (questionType === 'pg_kompleks') {
      computedCorrectAnswer = complexSelected.sort().join(',');
    } else if (questionType === 'benar_salah') {
      const rec: Record<string, boolean> = {};
      statements.forEach(st => {
        rec[st.id] = st.correctAnswer;
      });
      computedCorrectAnswer = JSON.stringify(rec);
      computedOptions = [];
    } else if (questionType === 'menjodohkan') {
      const rec: Record<string, string> = {};
      matchingPairs.forEach(p => {
        rec[p.id] = p.correctMatch.trim();
      });
      computedCorrectAnswer = JSON.stringify(rec);
      computedOptions = [];
    }

    if (initialQuestion) {
      updateQuestion(examId, initialQuestion.id, {
        type: questionType,
        questionText: questionText.trim(),
        options: computedOptions,
        correctAnswer: computedCorrectAnswer,
        statements: questionType === 'benar_salah' ? statements : undefined,
        matchingPairs: questionType === 'menjodohkan' ? matchingPairs : undefined,
        explanation: explanation.trim(),
        points,
      });
    } else {
      addQuestion(examId, {
        examId,
        type: questionType,
        questionText: questionText.trim(),
        options: computedOptions,
        correctAnswer: computedCorrectAnswer,
        statements: questionType === 'benar_salah' ? statements : undefined,
        matchingPairs: questionType === 'menjodohkan' ? matchingPairs : undefined,
        explanation: explanation.trim(),
        points,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialQuestion ? 'Edit Butir Soal Asesmen' : 'Tambah Butir Soal Baru (Standar AKM)'}
            </h2>
            <p className="text-xs text-slate-500">Mendukung PG Biasa, PG Kompleks, Benar-Salah, & Menjodohkan</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TIPE SOAL SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Tipe / Model Butir Soal:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setQuestionType('pg')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  questionType === 'pg'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Pilihan Ganda
              </button>
              <button
                type="button"
                onClick={() => setQuestionType('pg_kompleks')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  questionType === 'pg_kompleks'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                PG Kompleks (Multi)
              </button>
              <button
                type="button"
                onClick={() => setQuestionType('benar_salah')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  questionType === 'benar_salah'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Benar / Salah (AKM)
              </button>
              <button
                type="button"
                onClick={() => setQuestionType('menjodohkan')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  questionType === 'menjodohkan'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Menjodohkan
              </button>
            </div>
          </div>

          {/* TEKS SOAL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Narasi / Teks Pertanyaan & Stimulus Soal *
            </label>
            <textarea
              required
              rows={4}
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="Tuliskan stimulus bacaan, teks pertanyaan, rumus matematika (misal: f(x) = x² + 2x - 3), atau instruksi pengerjaan..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 font-sans leading-relaxed"
            />
          </div>

          {/* 1. TAMPILAN PILIHAN GANDA (REGULER & KOMPLEKS) */}
          {(questionType === 'pg' || questionType === 'pg_kompleks') && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  {questionType === 'pg_kompleks'
                    ? 'Pilihan Jawaban (Klik tombol huruf untuk menandai LEBIH DARI SATU kunci jawaban benar):'
                    : 'Pilihan Jawaban (Klik tombol huruf untuk menandai 1 kunci jawaban benar):'}
                </label>
                {questionType === 'pg_kompleks' && (
                  <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    Kunci: {complexSelected.join(', ')}
                  </span>
                )}
              </div>

              {[
                { id: 'A', val: optA, set: setOptA },
                { id: 'B', val: optB, set: setOptB },
                { id: 'C', val: optC, set: setOptC },
                { id: 'D', val: optD, set: setOptD },
                { id: 'E', val: optE, set: setOptE },
              ].map(opt => {
                const isKey =
                  questionType === 'pg_kompleks'
                    ? complexSelected.includes(opt.id)
                    : correctAnswer === opt.id;

                return (
                  <div key={opt.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (questionType === 'pg_kompleks') {
                          toggleComplexOption(opt.id);
                        } else {
                          setCorrectAnswer(opt.id);
                        }
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors cursor-pointer ${
                        isKey
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Klik untuk jadikan kunci jawaban"
                    >
                      {opt.id}
                    </button>
                    <input
                      type="text"
                      required={opt.id === 'A' || opt.id === 'B' || opt.id === 'C'}
                      placeholder={`Teks pilihan opsi ${opt.id}...`}
                      value={opt.val}
                      onChange={e => opt.set(e.target.value)}
                      className={`flex-1 px-3 py-2 text-xs rounded-lg border focus:outline-hidden ${
                        isKey
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300 bg-white focus:border-indigo-600'
                      }`}
                    />
                    {isKey && (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 shrink-0">
                        <Check className="w-3.5 h-3.5" /> Kunci
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. TAMPILAN BENAR / SALAH (TABEL PERNYATAAN AKM) */}
          {questionType === 'benar_salah' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Daftar Pernyataan & Kunci Jawaban (Benar / Salah):
                </label>
                <button
                  type="button"
                  onClick={handleAddStatement}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Tambah Baris
                </button>
              </div>

              <div className="space-y-2">
                {statements.map((stmt, sIdx) => (
                  <div key={stmt.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-mono text-xs font-bold text-slate-500 w-6 text-center">
                      #{sIdx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Tuliskan pernyataan ${sIdx + 1}...`}
                      value={stmt.statement}
                      onChange={e => {
                        const val = e.target.value;
                        setStatements(prev =>
                          prev.map(s => (s.id === stmt.id ? { ...s, statement: val } : s))
                        );
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                    />

                    {/* Toggle Benar / Salah */}
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setStatements(prev =>
                            prev.map(s => (s.id === stmt.id ? { ...s, correctAnswer: true } : s))
                          );
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                          stmt.correctAnswer
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Benar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStatements(prev =>
                            prev.map(s => (s.id === stmt.id ? { ...s, correctAnswer: false } : s))
                          );
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                          !stmt.correctAnswer
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Salah
                      </button>
                    </div>

                    {statements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStatement(stmt.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. TAMPILAN MENJODOHKAN (KOLOM KIRI & KOLOM KANAN) */}
          {questionType === 'menjodohkan' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Pasangan Kolom Kiri (Premis) dan Kolom Kanan (Jawaban Benar):
                </label>
                <button
                  type="button"
                  onClick={handleAddMatchingPair}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Tambah Pasangan
                </button>
              </div>

              <div className="space-y-2">
                {matchingPairs.map((pair, pIdx) => (
                  <div key={pair.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-mono text-xs font-bold text-slate-500 w-6 text-center">
                      #{pIdx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Premis Kolom Kiri (misal: f(x) = sin x)..."
                      value={pair.premise}
                      onChange={e => {
                        const val = e.target.value;
                        setMatchingPairs(prev =>
                          prev.map(p => (p.id === pair.id ? { ...p, premise: val } : p))
                        );
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                    />

                    <span className="text-slate-400 font-bold text-xs">➔</span>

                    <input
                      type="text"
                      required
                      placeholder="Pasangan Kanan (misal: cos x)..."
                      value={pair.correctMatch}
                      onChange={e => {
                        const val = e.target.value;
                        setMatchingPairs(prev =>
                          prev.map(p => (p.id === pair.id ? { ...p, correctMatch: val } : p))
                        );
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 font-semibold text-emerald-800"
                    />

                    {matchingPairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMatchingPair(pair.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOBOT & PEMBAHASAN */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bobot Poin Soal *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={points}
                onChange={e => setPoints(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan / Pembahasan (Opsional)
              </label>
              <input
                type="text"
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Rujukan pembahasan atau konsep..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Simpan Butir Soal
          </button>
        </div>
      </form>
    </div>
  </div>
);
};
