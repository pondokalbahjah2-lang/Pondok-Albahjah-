/**
 * Haptic & Vibration Feedback Utility for Al-Bahjah Portal Pejuang.
 * Leverages the browser Vibration API (navigator.vibrate) to deliver tactile feedback
 * on critical actions like 'Absen Masuk', 'Absen Pulang', 'Submit Izin', 'Submit Cuti',
 * and QR scanning, complemented with an acoustic micro-tick fallback for non-vibrating devices (such as iOS Safari).
 */

export const HAPTIC_PATTERNS = {
  /**
   * Absen Masuk Confirmation (Triple energetic pulse):
   * 100ms vibrate -> 50ms pause -> 80ms vibrate -> 50ms pause -> 120ms vibrate
   */
  ABSEN_MASUK: [100, 50, 80, 50, 120],

  /**
   * Absen Pulang Confirmation (Smooth double pulse):
   * 140ms vibrate -> 80ms pause -> 140ms vibrate
   */
  ABSEN_PULANG: [140, 80, 140],

  /**
   * Submit Izin Keluar Confirmation (Crisp tactile rhythm):
   * 120ms vibrate -> 70ms pause -> 100ms vibrate
   */
  SUBMIT_IZIN: [120, 70, 100],

  /**
   * Submit Cuti Confirmation:
   * 120ms vibrate -> 70ms pause -> 100ms vibrate
   */
  SUBMIT_CUTI: [120, 70, 100],

  /**
   * Catat Kembali Realisasi Izin:
   * 100ms vibrate -> 60ms pause -> 100ms vibrate
   */
  CATAT_KEMBALI: [100, 60, 100],

  /**
   * Persetujuan / Approval Action:
   * 90ms vibrate -> 50ms pause -> 90ms vibrate
   */
  APPROVE: [90, 50, 90],

  /**
   * Penolakan / Rejection Action:
   * 150ms vibrate -> 70ms pause -> 150ms vibrate
   */
  REJECT: [150, 70, 150],

  /**
   * QR Code Detection (Snappy single buzz):
   */
  QR_SCAN: [70],

  /**
   * General Critical Success:
   */
  SUCCESS: [100, 60, 120],

  /**
   * Error / Warning (Out of radius, too early):
   * 100ms vibrate -> 50ms pause -> 100ms vibrate -> 50ms pause -> 200ms vibrate
   */
  WARNING: [100, 50, 100, 50, 200],

  /**
   * Light Tap for interactive UI elements:
   */
  LIGHT_TAP: [40],
};

const VIBRATION_STORAGE_KEY = 'albahjah_vibration_enabled';

/**
 * Check if the browser supports the Vibration API.
 */
export function isVibrationSupported(): boolean {
  return typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function';
}

/**
 * Check if vibration feedback is currently enabled by user preference.
 * Defaults to true.
 */
export function isVibrationEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = localStorage.getItem(VIBRATION_STORAGE_KEY);
    if (saved === null) return true;
    return saved === 'true';
  } catch {
    return true;
  }
}

/**
 * Update vibration feedback preference in localStorage.
 */
export function setVibrationEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VIBRATION_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to save vibration setting:', err);
  }
}

/**
 * Synthesize an acoustic micro-tick or chime using Web Audio API as a fallback
 * or complement (particularly useful on iOS Safari where navigator.vibrate is unavailable).
 */
function playAcousticTick(type: 'success' | 'warning' | 'tap' = 'success'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'warning') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // Non-blocking: gracefully ignore audio failures
  }
}

export interface HapticOptions {
  /** Play complementary subtle acoustic tick (defaults to true) */
  playAudio?: boolean;
  /** Audio tick style */
  audioType?: 'success' | 'warning' | 'tap';
  /** Override user preference check */
  force?: boolean;
}

/**
 * Triggers tactile vibration feedback using the Vibration API with multi-pulse patterns,
 * accompanied by an acoustic feedback fallback for non-vibrating devices.
 *
 * @param pattern Duration in ms or alternating [vibrate, pause, vibrate, ...] sequence
 * @param options Additional audio and override options
 * @returns true if navigator.vibrate successfully initiated vibration
 */
export function triggerHapticFeedback(
  pattern: number | number[] = HAPTIC_PATTERNS.SUCCESS,
  options?: HapticOptions
): boolean {
  const enabled = options?.force || isVibrationEnabled();
  if (!enabled) return false;

  let vibrated = false;

  // Execute Vibration API
  if (isVibrationSupported()) {
    try {
      vibrated = navigator.vibrate(pattern);
    } catch {
      vibrated = false;
    }
  }

  // Complementary or fallback audio click
  if (options?.playAudio !== false) {
    const audioType = options?.audioType || (pattern === HAPTIC_PATTERNS.WARNING ? 'warning' : 'success');
    playAcousticTick(audioType);
  }

  return vibrated;
}
