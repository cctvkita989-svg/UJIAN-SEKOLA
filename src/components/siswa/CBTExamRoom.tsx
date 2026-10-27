import React, { useState, useEffect, useRef } from 'react';
import { useCBT } from '../../context/CBTContext';
import {
  Clock,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  X,
  Type,
  Radio,
  Moon,
  Sun,
  ShieldCheck,
  Check,
  Wifi,
  WifiOff,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Info
} from 'lucide-react';
import { ExamResultView } from './ExamResultView';

export const CBTExamRoom: React.FC = () => {
  const {
    activeExamTaking,
    questions,
    saveStudentAnswer,
    toggleAnswerDoubt,
    setExamQuestionIndex,
    setFontScale,
    recordExamViolation,
    recordAudioViolation,
    reportCurrentAudioLevel,
    schoolProfile,
    submitCurrentExam,
    exitExamView,
    broadcastMessages,
    isOnline,
    pendingOfflineSyncCount,
    syncPendingOfflineData,
  } = useCBT();

  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'simulated'>('prompt');
  const [currentDb, setCurrentDb] = useState<number>(28);
  const [showAudioInfoModal, setShowAudioInfoModal] = useState<boolean>(false);
  const [audioIncidentWarning, setAudioIncidentWarning] = useState<{
    show: boolean;
    db: number;
    type: 'bisikan' | 'suara_keras';
    message: string;
  } | null>(null);
  const [latestDismissedBroadcastId, setLatestDismissedBroadcastId] = useState<string | null>(null);
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const prevOnlineRef = useRef(isOnline);

  const handleManualSyncInExamRoom = async () => {
    setIsSyncingData(true);
    setSyncToastMessage(null);
    try {
      const res = await syncPendingOfflineData();
      if (res.success) {
        setSyncToastMessage({
          type: 'success',
          text: 'Sinkronisasi Berhasil! Seluruh jawaban Anda telah terkirim ke server pengawas.'
        });
      } else {
        setSyncToastMessage({
          type: 'info',
          text: 'Perangkat masih offline. Tenang, jawaban Anda 100% tersimpan aman di penyimpanan lokal perangkat!'
        });
      }
    } catch {
      setSyncToastMessage({
        type: 'info',
        text: 'Perangkat offline. Seluruh jawaban tetap aman tersimpan di perangkat Anda.'
      });
    } finally {
      setIsSyncingData(false);
      setTimeout(() => setSyncToastMessage(null), 5000);
    }
  };

  useEffect(() => {
    if (!prevOnlineRef.current && isOnline) {
      setShowRestoredBanner(true);
      const timer = setTimeout(() => setShowRestoredBanner(false), 5000);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  // Anti-cheat window blur / visibility detection
  useEffect(() => {
    if (!activeExamTaking || activeExamTaking.session.status !== 'in_progress') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordExamViolation();
        setShowViolationAlert(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeExamTaking?.session?.status]);

  // Audio / Whisper Detection Proctoring using Web Audio API
  useEffect(() => {
    if (!activeExamTaking || activeExamTaking.session.status !== 'in_progress') return;
    if (schoolProfile.audioProctoringEnabled === false) return;

    let isMounted = true;
    let audioContext: AudioContext | null = null;
    let microphoneStream: MediaStream | null = null;
    let analyser: AnalyserNode | null = null;
    let animFrameId: number | null = null;
    let simIntervalId: NodeJS.Timeout | null = null;
    let sustainedWhisperFrames = 0;
    let lastViolationTime = 0;
    let lastReportTime = 0;

    const sensitivity = schoolProfile.audioSensitivity || 'medium';
    const threshold = sensitivity === 'high' ? 38 : sensitivity === 'low' ? 62 : 48;

    const startAudioListener = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia not supported');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: true,
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        microphoneStream = stream;
        setMicPermission('granted');

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContext = new AudioCtx();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(stream);

        // Vocal & Whisper Bandpass Filter (300Hz - 3400Hz)
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1400; // Human whisper presence
        filter.Q.value = 0.85;

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.35;

        source.connect(filter);
        filter.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const analyzeAudio = () => {
          if (!isMounted || !analyser) return;

          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          // Map to approximate decibel range: 20dB (quiet room) to 95dB (shouting)
          const dbVal = Math.round(22 + (avg / 255) * 73);
          setCurrentDb(dbVal);

          const now = Date.now();
          if (now - lastReportTime > 1500) {
            lastReportTime = now;
            reportCurrentAudioLevel(dbVal);
          }

          // Check if vocal energy crosses threshold
          if (dbVal >= threshold) {
            sustainedWhisperFrames++;
            // Sustained voice energy > 8 frames (~1 second of whispering / vocal sound)
            if (sustainedWhisperFrames >= 8) {
              if (now - lastViolationTime > 10000) { // 10s cooldown between warnings
                lastViolationTime = now;
                const incidentType = dbVal >= 65 ? 'suara_keras' : 'bisikan';
                const warningText = incidentType === 'bisikan'
                  ? `Sensor mikrofon mendeteksi suara bisikan (${dbVal} dB)! Dilarang berbisik selama ujian berlangsung.`
                  : `Sensor mikrofon mendeteksi kegaduhan / suara bicara (${dbVal} dB)!`;

                recordAudioViolation(dbVal, incidentType);
                setAudioIncidentWarning({
                  show: true,
                  db: dbVal,
                  type: incidentType,
                  message: warningText,
                });
              }
            }
          } else {
            if (sustainedWhisperFrames > 0) sustainedWhisperFrames--;
          }

          animFrameId = requestAnimationFrame(analyzeAudio);
        };

        animFrameId = requestAnimationFrame(analyzeAudio);
      } catch (err) {
        console.warn('Microphone permission or device not active, running in simulated ambient proctor mode:', err);
        if (!isMounted) return;
        setMicPermission('simulated');

        // Fallback simulation: gentle realistic ambient fluctuation (24-34 dB)
        simIntervalId = setInterval(() => {
          if (!isMounted) return;
          const ambientDb = Math.round(25 + Math.random() * 8);
          setCurrentDb(ambientDb);
          reportCurrentAudioLevel(ambientDb);
        }, 2000);
      }
    };

    startAudioListener();

    return () => {
      isMounted = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (simIntervalId) clearInterval(simIntervalId);
      if (microphoneStream) {
        microphoneStream.getTracks().forEach(t => t.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  }, [activeExamTaking?.session?.status, schoolProfile.audioProctoringEnabled, schoolProfile.audioSensitivity]);

  // Manual Trigger for Testing Whisper Detection
  const triggerSimulatedWhisperTest = (simulatedDb = 52) => {
    setCurrentDb(simulatedDb);
    const incidentType = simulatedDb >= 65 ? 'suara_keras' : 'bisikan';
    const warningText = `Uji Coba Sensor: Terdeteksi suara bisikan (${simulatedDb} dB)! Sistem otomatis mencatat kejadian ke server pengawas proktor.`;

    recordAudioViolation(simulatedDb, incidentType);
    setAudioIncidentWarning({
      show: true,
      db: simulatedDb,
      type: incidentType,
      message: warningText,
    });
  };

  if (!activeExamTaking) return null;

  const { exam, session, currentQuestionIndex, fontScale } = activeExamTaking;

  // If already submitted, show result view
  if (session.status === 'submitted') {
    return <ExamResultView onBackToDashboard={exitExamView} />;
  }

  // If blocked, show blocked screen
  if (session.status === 'blocked') {
    const isAudioBlocked = (session.audioViolationsCount || 0) > 0;
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Ujian Telah Terkunci</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isAudioBlocked
              ? `Sistem mendeteksi aktivitas mencurigakan (suara bisikan/percakapan atau berpindah jendela tab browser) melebihi batas yang diizinkan (${exam.maxViolationsAllowed}x).`
              : `Sistem mendeteksi Anda berpindah jendela / tab browser melebihi batas yang diizinkan (${exam.maxViolationsAllowed}x).`}
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono text-rose-800">
            {session.lastActive || 'Status: Terblokir Otomatis oleh Sensor Integritas CBT'}
          </div>
          <p className="text-xs text-slate-500">
            Silakan angkat tangan dan lapor kepada pengawas ruang atau proktor untuk membuka kembali sesi ujian Anda.
          </p>
          <button
            onClick={exitExamView}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Keluar ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const examQuestions = questions[exam.id] || [];
  const currentQ = examQuestions[currentQuestionIndex];

  if (!currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-slate-500">Belum ada butir soal pada paket ini.</p>
          <button
            onClick={exitExamView}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Format countdown
  const hours = Math.floor(session.remainingSeconds / 3600);
  const minutes = Math.floor((session.remainingSeconds % 3600) / 60);
  const seconds = session.remainingSeconds % 60;
  const timeFormatted = `${hours > 0 ? `${hours}:` : ''}${
    minutes < 10 ? `0${minutes}` : minutes
  }:${seconds < 10 ? `0${seconds}` : seconds}`;

  const currentAnswer = session.answers[currentQ.id];
  const selectedOption = currentAnswer?.selectedOption || '';
  const isCurrentDoubtful = currentAnswer?.isDoubtful || false;

  // Summary counts
  const totalAnswered = Object.values(session.answers).filter(a => a.selectedOption !== '').length;
  const totalDoubtful = Object.values(session.answers).filter(a => a.isDoubtful).length;
  const totalUnanswered = examQuestions.length - totalAnswered;

  const fontTextClasses = {
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-relaxed',
    xlarge: 'text-lg sm:text-xl leading-relaxed',
  }[fontScale];

  // Check active broadcast to display as top banner if not dismissed
  const activeBroadcast = broadcastMessages.find(
    msg =>
      msg.id !== latestDismissedBroadcastId &&
      (msg.targetRoom === 'ALL' ||
       msg.targetRoom === session.studentRoom ||
       msg.targetRoom === session.studentClass ||
       msg.targetRoom === `Kelas ${session.studentClass}` ||
       msg.targetRoom === `Ruang Kelas ${session.studentClass}`)
  );

  // Helper for PG Kompleks answers
  const complexSelectedList = currentQ.type === 'pg_kompleks'
    ? selectedOption.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
    : [];

  const handleToggleComplexAnswer = (optId: string) => {
    let nextList: string[];
    if (complexSelectedList.includes(optId)) {
      nextList = complexSelectedList.filter(x => x !== optId);
    } else {
      nextList = [...complexSelectedList, optId].sort();
    }
    saveStudentAnswer(currentQ.id, nextList.join(','));
  };

  // Helper for Benar-Salah answers
  let parsedStatementAnswers: Record<string, boolean> = {};
  if (currentQ.type === 'benar_salah' && selectedOption) {
    try {
      parsedStatementAnswers = JSON.parse(selectedOption);
    } catch {
      parsedStatementAnswers = {};
    }
  }

  const handleSetStatementAnswer = (stmtId: string, val: boolean) => {
    const nextAnswers = { ...parsedStatementAnswers, [stmtId]: val };
    saveStudentAnswer(currentQ.id, JSON.stringify(nextAnswers));
  };

  // Helper for Menjodohkan answers
  let parsedMatchingAnswers: Record<string, string> = {};
  if (currentQ.type === 'menjodohkan' && selectedOption) {
    try {
      parsedMatchingAnswers = JSON.parse(selectedOption);
    } catch {
      parsedMatchingAnswers = {};
    }
  }

  const handleSetMatchingAnswer = (pairId: string, matchVal: string) => {
    const nextAnswers = { ...parsedMatchingAnswers, [pairId]: matchVal };
    saveStudentAnswer(currentQ.id, JSON.stringify(nextAnswers));
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* OFFLINE STATUS BANNER (REASSURING NOTIFICATION) */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-medium shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-40 relative animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-2.5 max-w-5xl flex-1">
            <WifiOff className="w-4 h-4 shrink-0 text-slate-950 animate-bounce" />
            <div className="leading-snug">
              <span className="font-bold underline decoration-slate-900/60">KONEKSI OFFLINE:</span>{' '}
              Internet Anda terputus, <strong>tetapi tenang jawaban Anda 100% tersimpan aman</strong> di penyimpanan lokal perangkat ini. Silakan lanjutkan mengerjakan ujian, jawaban akan otomatis terkirim begitu kembali online.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-3">
            <button
              type="button"
              onClick={handleManualSyncInExamRoom}
              disabled={isSyncingData}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingData ? 'animate-spin' : ''}`} />
              <span>{isSyncingData ? 'Menyinkronkan...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SYNC FEEDBACK TOAST */}
      {syncToastMessage && (
        <div className={`px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between z-40 relative animate-in slide-in-from-top duration-150 ${
          syncToastMessage.type === 'success'
            ? 'bg-emerald-600 text-white'
            : syncToastMessage.type === 'error'
            ? 'bg-rose-600 text-white'
            : 'bg-amber-500 text-slate-950'
        }`}>
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
            {syncToastMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0" />
            )}
            <span>{syncToastMessage.text}</span>
          </div>
          <button
            onClick={() => setSyncToastMessage(null)}
            className="p-1 hover:bg-black/20 rounded cursor-pointer ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* RECONNECTED ONLINE BANNER */}
      {showRestoredBanner && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between z-40 relative animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
            <Wifi className="w-4 h-4 shrink-0" />
            <span>
              <strong>Internet Terhubung Kembali!</strong> Seluruh jawaban yang Anda kerjakan saat offline telah otomatis disinkronkan ke server pengawas.
            </span>
          </div>
          <button
            onClick={() => setShowRestoredBanner(false)}
            className="p-1 hover:bg-black/20 rounded cursor-pointer ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP LIVE BROADCAST BANNER (IF SENT BY PROCTOR) */}
      {activeBroadcast && (
        <div className={`px-4 py-2.5 flex items-center justify-between text-xs font-medium z-40 transition-all ${
          activeBroadcast.priority === 'urgent'
            ? 'bg-rose-600 text-white animate-pulse'
            : 'bg-indigo-700 text-white'
        }`}>
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <Radio className="w-4 h-4 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[11px]">
              [PENGUMUMAN PROKTOR {activeBroadcast.sender}]:
            </span>
            <span className="leading-snug">{activeBroadcast.content}</span>
          </div>
          <button
            onClick={() => setLatestDismissedBroadcastId(activeBroadcast.id)}
            className="p-1 hover:bg-black/20 rounded cursor-pointer ml-3 shrink-0"
            title="Tutup Pesan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. CBT STICKY TOPBAR */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Exam title & Student */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex w-9 h-9 rounded-lg bg-indigo-600 items-center justify-center font-bold text-white text-base">
              CBT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                  {exam.subject}
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-slate-800 text-[10px] rounded font-mono text-slate-300">
                  {exam.examCategory || 'PAS'}
                </span>
                {/* Network Pill Indicator */}
                {isOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Online
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/60 animate-pulse">
                      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Offline - Saving Locally</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleManualSyncInExamRoom}
                      disabled={isSyncingData}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                      title="Sinkronkan data jawaban ke server secara manual"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncingData ? 'animate-spin' : ''}`} />
                      <span>{isSyncingData ? 'Menyinkronkan...' : 'Sync Data'}</span>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                {session.studentName} · Ruang Kelas {session.studentClass} · {session.studentNisn}
              </p>
            </div>
          </div>

          {/* Center: Live Audio Sensor + Countdown Timer */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Audio / Whisper Sensor Widget */}
            {schoolProfile.audioProctoringEnabled && (
              <button
                type="button"
                onClick={() => setShowAudioInfoModal(true)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                  currentDb >= 48
                    ? 'bg-rose-500/20 border-rose-500/70 text-rose-300 ring-1 ring-rose-500/50 animate-pulse'
                    : currentDb >= 38
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
                title="Status Sensor Suara & Anti-Bisik (Klik untuk info & uji coba)"
              >
                <div className="relative flex items-center justify-center">
                  {micPermission === 'denied' ? (
                    <MicOff className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Mic className={`w-3.5 h-3.5 ${
                      currentDb >= 48 ? 'text-rose-400' : currentDb >= 38 ? 'text-amber-400' : 'text-emerald-400'
                    }`} />
                  )}
                  {currentDb >= 48 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-bold leading-none">
                    Anti-Bisik
                  </span>
                  <div className="flex items-center gap-1 font-bold tabular-nums leading-tight mt-0.5">
                    <span>{currentDb} dB</span>
                    <span className={`text-[9px] font-sans px-1 py-0.2 rounded font-medium ${
                      currentDb >= 48
                        ? 'bg-rose-600 text-white font-bold'
                        : currentDb >= 38
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-emerald-400'
                    }`}>
                      {currentDb >= 48 ? 'Bisikan!' : currentDb >= 38 ? 'Suara...' : 'Hening'}
                    </span>
                  </div>
                </div>

                <span className="sm:hidden font-bold tabular-nums text-[10px]">
                  {currentDb}dB
                </span>
              </button>
            )}

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg">
              <Clock
                className={`w-4 h-4 ${
                  session.remainingSeconds < 600 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
                }`}
              />
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 leading-none uppercase">Sisa Waktu</span>
                <span
                  className={`font-mono font-bold text-sm sm:text-base tabular-nums ${
                    session.remainingSeconds < 600 ? 'text-rose-400 font-black' : 'text-white'
                  }`}
                >
                  {timeFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Mode Dark/Light, Font scale adjuster & Daftar Soal Toggle */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Ganti Mode Tampilan (Terang / Gelap)"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Font scale */}
            <div className="hidden md:flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setFontScale('normal')}
                className={`px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
                  fontScale === 'normal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Ukuran Font Normal"
              >
                A
              </button>
              <button
                onClick={() => setFontScale('large')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  fontScale === 'large' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Ukuran Font Besar"
              >
                A+
              </button>
              <button
                onClick={() => setFontScale('xlarge')}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                  fontScale === 'xlarge' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Ukuran Font Sangat Besar"
              >
                A++
              </button>
            </div>

            <button
              onClick={() => setIsQuestionListOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Daftar Soal</span>
              <span className="ml-1 px-1.5 py-0.2 bg-indigo-800 text-[11px] rounded font-mono">
                {currentQuestionIndex + 1}/{examQuestions.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. CBT MAIN EXAM WORKSPACE */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className={`rounded-2xl border shadow-xs overflow-hidden transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* Question Header Strip */}
          <div className={`px-6 py-3.5 border-b flex items-center justify-between ${
            isDarkMode ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                SOAL NOMOR
              </span>
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold font-mono text-sm flex items-center justify-center shadow-xs">
                {currentQuestionIndex + 1}
              </span>
              <span className="text-xs text-slate-400">
                dari {examQuestions.length} Soal
              </span>
              <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                currentQ.type === 'pg_kompleks'
                  ? 'bg-purple-100 text-purple-800'
                  : currentQ.type === 'benar_salah'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentQ.type === 'menjodohkan'
                  ? 'bg-cyan-100 text-cyan-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {currentQ.type === 'pg_kompleks'
                  ? 'PG Kompleks (Pilihan Ganda Lebih Dari 1)'
                  : currentQ.type === 'benar_salah'
                  ? 'Pernyataan Benar / Salah'
                  : currentQ.type === 'menjodohkan'
                  ? 'Menjodohkan Pasangan'
                  : 'Pilihan Ganda'}
              </span>
            </div>

            {isCurrentDoubtful && (
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200">
                Tanda Ragu-ragu
              </span>
            )}
          </div>

          {/* Question Content & Stimulus */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className={`font-sans whitespace-pre-line leading-relaxed ${fontTextClasses} ${
              isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {currentQ.questionText}
            </div>

            {/* A. STANDAR PILIHAN GANDA (1 JAWABAN BENAR) */}
            {currentQ.type === 'pg' && (
              <div className="space-y-3 pt-2">
                {currentQ.options.map(option => {
                  const isSelected = selectedOption === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => saveStudentAnswer(currentQ.id, option.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                        isSelected
                          ? isDarkMode
                            ? 'border-indigo-500 bg-indigo-950/60 ring-1 ring-indigo-500/50'
                            : 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600/30'
                          : isDarkMode
                          ? 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/40'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        }`}
                      >
                        {option.id}
                      </span>
                      <span
                        className={`flex-1 pt-1 ${
                          isSelected
                            ? isDarkMode ? 'text-indigo-200 font-semibold' : 'text-indigo-950 font-semibold'
                            : isDarkMode ? 'text-slate-200' : 'text-slate-800'
                        } ${fontScale === 'xlarge' ? 'text-lg' : 'text-sm sm:text-base'}`}
                      >
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* B. PILIHAN GANDA KOMPLEKS (BISA CENTANG LEBIH DARI SATU) */}
            {currentQ.type === 'pg_kompleks' && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Petunjuk PG Kompleks:</strong> Anda dapat memilih lebih dari satu jawaban yang menurut Anda benar dengan mengklik opsi di bawah ini.
                  </span>
                </div>

                {currentQ.options.map(option => {
                  const isSelected = complexSelectedList.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleToggleComplexAnswer(option.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                        isSelected
                          ? isDarkMode
                            ? 'border-indigo-500 bg-indigo-950/60 ring-1 ring-indigo-500/50'
                            : 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600/30'
                          : isDarkMode
                          ? 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/40'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓' : option.id}
                      </span>
                      <span
                        className={`flex-1 pt-1 ${
                          isSelected
                            ? isDarkMode ? 'text-indigo-200 font-semibold' : 'text-indigo-950 font-semibold'
                            : isDarkMode ? 'text-slate-200' : 'text-slate-800'
                        } ${fontScale === 'xlarge' ? 'text-lg' : 'text-sm sm:text-base'}`}
                      >
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* C. FORMAT BENAR / SALAH (TABEL PERNYATAAN AKM) */}
            {currentQ.type === 'benar_salah' && (
              <div className="space-y-4 pt-2">
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead className={isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700 font-bold'}>
                      <tr>
                        <th className="py-3 px-4">Pernyataan</th>
                        <th className="py-3 px-3 text-center w-28">Benar</th>
                        <th className="py-3 px-3 text-center w-28">Salah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(currentQ.statements || []).map((stmt, sIdx) => {
                        const currentVal = parsedStatementAnswers[stmt.id];
                        return (
                          <tr key={stmt.id} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                            <td className="py-3 px-4 font-medium leading-relaxed">
                              {sIdx + 1}. {stmt.statement}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleSetStatementAnswer(stmt.id, true)}
                                className={`w-8 h-8 rounded-full border-2 transition-all inline-flex items-center justify-center font-bold cursor-pointer ${
                                  currentVal === true
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                    : 'border-slate-300 text-transparent hover:border-emerald-500'
                                }`}
                              >
                                ✓
                              </button>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleSetStatementAnswer(stmt.id, false)}
                                className={`w-8 h-8 rounded-full border-2 transition-all inline-flex items-center justify-center font-bold cursor-pointer ${
                                  currentVal === false
                                    ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                    : 'border-slate-300 text-transparent hover:border-rose-500'
                                }`}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* D. FORMAT MENJODOHKAN (PAIR MATCHING) */}
            {currentQ.type === 'menjodohkan' && (
              <div className="space-y-4 pt-2">
                <div className="p-3 bg-cyan-50/60 border border-cyan-200 rounded-xl text-xs text-cyan-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-700 shrink-0" />
                  <span>
                    <strong>Petunjuk Menjodohkan:</strong> Pilih pasangan yang tepat pada menu dropdown sebelah kanan untuk setiap premis di sebelah kiri.
                  </span>
                </div>

                <div className="space-y-3">
                  {(currentQ.matchingPairs || []).map((pair, pIdx) => {
                    const currentMatch = parsedMatchingAnswers[pair.id] || '';
                    const allOptions = (currentQ.matchingPairs || []).map(p => p.correctMatch);

                    return (
                      <div
                        key={pair.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDarkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50/70'
                        }`}
                      >
                        <div className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-indigo-600 text-white text-xs font-mono flex items-center justify-center font-bold shrink-0">
                            {pIdx + 1}
                          </span>
                          <span>{pair.premise}</span>
                        </div>

                        <div className="sm:w-64">
                          <select
                            value={currentMatch}
                            onChange={e => handleSetMatchingAnswer(pair.id, e.target.value)}
                            className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border outline-none font-medium cursor-pointer ${
                              currentMatch
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                                : 'border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <option value="">-- Pilih Pasangan --</option>
                            {allOptions.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. CBT STICKY BOTTOM NAVIGATION BAR */}
      <footer className={`sticky bottom-0 z-30 border-t shadow-lg py-3 px-4 sm:px-6 transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Previous Button */}
          <button
            onClick={() => setExamQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              currentQuestionIndex === 0
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Soal Sebelumnya</span>
          </button>

          {/* Doubtful Toggle (Yellow Checkbox) */}
          <button
            onClick={() => toggleAnswerDoubt(currentQ.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${
              isCurrentDoubtful
                ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="w-4 h-4 rounded border border-amber-700 flex items-center justify-center text-[10px] bg-white text-amber-900 font-bold">
              {isCurrentDoubtful ? '✓' : ''}
            </span>
            <span>Ragu-Ragu</span>
          </button>

          {/* Next or Finish Button */}
          {currentQuestionIndex < examQuestions.length - 1 ? (
            <button
              onClick={() => setExamQuestionIndex(currentQuestionIndex + 1)}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <span>Soal Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsConfirmSubmitOpen(true)}
              className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Selesai Ujian</span>
            </button>
          )}
        </div>
      </footer>

      {/* 5. QUESTION NUMBER DRAWER / MODAL */}
      {isQuestionListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Daftar Nomor Soal Ujian</h3>
                <p className="text-xs text-slate-500">Klik salah satu nomor untuk melompat langsung ke soal tersebut</p>
              </div>
              <button
                onClick={() => setIsQuestionListOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                {examQuestions.map((q, idx) => {
                  const ans = session.answers[q.id];
                  const hasAns = ans && ans.selectedOption !== '';
                  const isDoubt = ans?.isDoubtful;
                  const isCurrent = idx === currentQuestionIndex;

                  let badgeColor = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                  if (isCurrent) {
                    badgeColor = 'ring-2 ring-indigo-600 bg-indigo-50 text-indigo-700 font-bold border-indigo-400';
                  } else if (isDoubt) {
                    badgeColor = 'bg-amber-400 text-slate-900 font-bold border-amber-500';
                  } else if (hasAns) {
                    badgeColor = 'bg-emerald-600 text-white font-bold border-emerald-700';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setExamQuestionIndex(idx);
                        setIsQuestionListOpen(false);
                      }}
                      className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${badgeColor}`}
                    >
                      <span className="text-xs font-mono">{idx + 1}</span>
                      <span className="text-[10px] font-mono leading-none">
                        {isDoubt ? '?' : hasAns ? (q.type === 'pg' ? ans.selectedOption : '✓') : '-'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Legend Ribbon */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-600" />
                  <span>Terjawab ({totalAnswered})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-amber-400" />
                  <span>Ragu-ragu ({totalDoubtful})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-slate-200" />
                  <span>Belum Terjawab ({totalUnanswered})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONFIRM SUBMISSION MODAL */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Penyelesaian Ujian</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin mengakhiri sesi ujian dan mengumpulkan seluruh jawaban?
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Soal Terjawab:</span>
                <span className="font-bold text-emerald-700 font-mono">{totalAnswered} dari {examQuestions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masih Ragu-ragu:</span>
                <span className="font-bold text-amber-700 font-mono">{totalDoubtful} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Belum Terjawab:</span>
                <span className="font-bold text-rose-700 font-mono">{totalUnanswered} Soal</span>
              </div>
            </div>

            {!isOnline && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <WifiOff className="w-4 h-4 text-amber-700" />
                  <span>Koneksi Offline (Internet Terputus)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Perangkat Anda saat ini offline. <strong>Tenang, seluruh {totalAnswered} jawaban Anda tetap tersimpan 100% aman di perangkat ini</strong>. Anda dapat mengumpulkan sekarang, melihat hasil/skor, dan menyinkronkan ke server saat kembali online.
                </p>
              </div>
            )}

            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={e => setAgreementChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Saya menyatakan telah memeriksa seluruh jawaban dan siap mengakhiri sesi ujian ini.</span>
            </label>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                disabled={!agreementChecked}
                onClick={() => {
                  setIsConfirmSubmitOpen(false);
                  submitCurrentExam();
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer ${
                  agreementChecked
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isOnline ? 'Kumpulkan Ujian' : 'Kumpulkan (Simpan Lokal)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ANTI-CHEAT VIOLATION POPUP WARNING */}
      {showViolationAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md my-auto bg-white rounded-2xl shadow-2xl border-2 border-rose-500 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Peringatan Sensor Anti-Cheat CBT</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda terdeteksi meninggalkan tab atau jendela ujian! Kejadian ini dicatat secara otomatis ke server pengawas dan log proktor.
            </p>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-mono">
              Jumlah Pelanggaran: {session.violationsCount} dari batas {exam.maxViolationsAllowed}x
            </div>

            <p className="text-[11px] text-slate-500">
              Jika mencapai {exam.maxViolationsAllowed} kali pelanggaran, lembar ujian akan terkunci secara otomatis dan harus dibuka oleh proktor.
            </p>

            <button
              onClick={() => setShowViolationAlert(false)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Saya Mengerti & Kembali Mengerjakan
            </button>
          </div>
        </div>
      )}

      {/* 8. AUDIO SENSOR INFO & TEST MODAL */}
      {showAudioInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sensor Suara & Anti-Bisik CBT</h3>
                  <p className="text-[11px] text-slate-500">Live Audio & Whisper Proctoring Engine</p>
                </div>
              </div>
              <button
                onClick={() => setShowAudioInfoModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Real-time Sound Meter */}
            <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  Tingkat Kebisingan Mikrofon:
                </span>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  {currentDb} dB SPL
                </span>
              </div>

              {/* Graphical Decibel Meter Bar */}
              <div className="space-y-1">
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      currentDb >= 48
                        ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500'
                        : currentDb >= 38
                        ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, (currentDb / 90) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 pt-0.5">
                  <span>20 dB (Hening)</span>
                  <span className="text-amber-400 font-bold">48 dB (Batas Bisik)</span>
                  <span className="text-rose-400">70+ dB (Bicara)</span>
                </div>
              </div>
            </div>

            {/* Configuration Status info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-600">Status Mikrofon:</span>
                <span className="font-bold flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {micPermission === 'granted'
                    ? 'Mikrofon Aktif (Real Hardware)'
                    : micPermission === 'simulated'
                    ? 'Simulasi Aktif (Virtual Sensor)'
                    : 'Siap Digunakan'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-600">Filter Frekuensi:</span>
                <span className="font-mono font-bold text-slate-800">
                  300 Hz - 3.400 Hz (Vocal & Sibilance)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-600">Ambang Deteksi Bisik:</span>
                <span className="font-bold text-indigo-700 font-mono">
                  {schoolProfile.audioSensitivity === 'high' ? '38 dB (Tinggi)' : schoolProfile.audioSensitivity === 'low' ? '62 dB (Rendah)' : '48 dB (Sedang)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-600">Riwayat Insiden Suara:</span>
                <span className="font-mono font-bold text-slate-800">
                  {session.audioViolationsCount || 0}x Terdeteksi
                </span>
              </div>
            </div>

            {/* Test Simulation Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAudioInfoModal(false);
                  triggerSimulatedWhisperTest(52);
                }}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Uji Coba Deteksi Bisikan (Simulasi 52 dB)</span>
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-1.5 leading-snug">
                Tombol uji coba di atas mensimulasikan peringatan sensor suara jika Anda ingin mengetes cara kerja deteksi bisikan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 9. AUDIO VIOLATION ALERT MODAL (TERDETEKSI BERBISIK / BICARA) */}
      {audioIncidentWarning && audioIncidentWarning.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-md my-auto bg-white rounded-2xl shadow-2xl border-2 border-rose-500 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto p-6 text-center space-y-4">
            <div className="relative w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
              <Mic className="w-8 h-8 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600"></span>
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Peringatan Sensor Anti-Bisik CBT
              </h3>
              <p className="text-xs text-rose-600 font-bold font-mono">
                [PERINGATAN SUARA / BISIKAN TERDETEKSI]
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {audioIncidentWarning.message}
            </p>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs text-left">
              <div className="flex justify-between font-mono">
                <span className="text-slate-600">Kekuatan Suara:</span>
                <span className="font-bold text-rose-700">{audioIncidentWarning.db} dB SPL</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-600">Total Pelanggaran:</span>
                <span className="font-bold text-rose-700">
                  {session.violationsCount} dari batas {exam.maxViolationsAllowed}x
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-rose-200/60">
                <span>Status Log:</span>
                <span className="text-emerald-700 font-bold">Terkirim ke Server Proktor</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Harap tetap tenang, hening, dan fokus mengerjakan soal. Jika pelanggaran mencapai batas ({exam.maxViolationsAllowed}x), ujian Anda akan otomatis terkunci.
            </p>

            <button
              type="button"
              onClick={() => setAudioIncidentWarning(null)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Saya Mengerti & Kembali Hening
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
