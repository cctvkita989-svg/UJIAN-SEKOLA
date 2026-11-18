export function isInsideExamApp(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const win = window as unknown as {
    AndroidKiosk?: { setExamActive?: (active: boolean) => void };
  };
  if (typeof win.AndroidKiosk !== 'undefined') return true;
  const ua = navigator.userAgent || '';
  return /ExambroKiosk|Exambro|ExamBrowser|CBTBrowser/i.test(ua);
}

export function notifyKioskExamActive(active: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const win = window as unknown as {
      AndroidKiosk?: { setExamActive?: (active: boolean) => void };
    };
    win.AndroidKiosk?.setExamActive?.(active);
  } catch {
    // ignore outside native Android WebView
  }
}
