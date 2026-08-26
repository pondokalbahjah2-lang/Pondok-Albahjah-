import {
  UserAccount,
  AttendanceRecord,
  ExitPermissionRecord,
  LeaveRequestRecord,
  WarningLetterRecord,
  SlipUbarRecord,
  WorkSchedule,
  LocationSettings,
  ManhajiyyahClause,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_ATTENDANCE,
  INITIAL_EXIT_PERMISSIONS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_MANHAJIYYAH_CLAUSES,
  INITIAL_SLIP_UBAR,
  INITIAL_WARNING_LETTERS,
  INITIAL_SCHEDULES,
  INITIAL_LOCATION_SETTINGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  ACCOUNTS: 'albahjah_accounts_v2',
  ATTENDANCE: 'albahjah_attendance_v2',
  EXIT_PERMISSIONS: 'albahjah_exit_permissions_v2',
  LEAVE_REQUESTS: 'albahjah_leave_requests_v2',
  WARNING_LETTERS: 'albahjah_warning_letters_v2',
  SLIP_UBAR: 'albahjah_slip_ubar_v2',
  SCHEDULES: 'albahjah_schedules_v2',
  LOCATION_SETTINGS: 'albahjah_location_settings_v2',
  MANHAJIYYAH: 'albahjah_manhajiyyah_v2',
  LOGGED_USER: 'albahjah_logged_user_v2',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse storage key:', key, e);
  }
  return defaultValue;
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to set storage key:', key, e);
  }
}

export const Storage = {
  getAccounts: (): UserAccount[] => getItem(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS),
  saveAccounts: (data: UserAccount[]) => setItem(STORAGE_KEYS.ACCOUNTS, data),

  getAttendance: (): AttendanceRecord[] => getItem(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
  saveAttendance: (data: AttendanceRecord[]) => setItem(STORAGE_KEYS.ATTENDANCE, data),

  getExitPermissions: (): ExitPermissionRecord[] =>
    getItem(STORAGE_KEYS.EXIT_PERMISSIONS, INITIAL_EXIT_PERMISSIONS),
  saveExitPermissions: (data: ExitPermissionRecord[]) =>
    setItem(STORAGE_KEYS.EXIT_PERMISSIONS, data),

  getLeaveRequests: (): LeaveRequestRecord[] =>
    getItem(STORAGE_KEYS.LEAVE_REQUESTS, INITIAL_LEAVE_REQUESTS),
  saveLeaveRequests: (data: LeaveRequestRecord[]) =>
    setItem(STORAGE_KEYS.LEAVE_REQUESTS, data),

  getWarningLetters: (): WarningLetterRecord[] =>
    getItem(STORAGE_KEYS.WARNING_LETTERS, INITIAL_WARNING_LETTERS),
  saveWarningLetters: (data: WarningLetterRecord[]) =>
    setItem(STORAGE_KEYS.WARNING_LETTERS, data),

  getSlipUbar: (): SlipUbarRecord[] => getItem(STORAGE_KEYS.SLIP_UBAR, INITIAL_SLIP_UBAR),
  saveSlipUbar: (data: SlipUbarRecord[]) => setItem(STORAGE_KEYS.SLIP_UBAR, data),

  getSchedules: (): WorkSchedule[] => getItem(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES),
  saveSchedules: (data: WorkSchedule[]) => setItem(STORAGE_KEYS.SCHEDULES, data),

  getLocationSettings: (): LocationSettings =>
    getItem(STORAGE_KEYS.LOCATION_SETTINGS, INITIAL_LOCATION_SETTINGS),
  saveLocationSettings: (data: LocationSettings) =>
    setItem(STORAGE_KEYS.LOCATION_SETTINGS, data),

  getManhajiyyahClauses: (): ManhajiyyahClause[] =>
    getItem(STORAGE_KEYS.MANHAJIYYAH, INITIAL_MANHAJIYYAH_CLAUSES),
  saveManhajiyyahClauses: (data: ManhajiyyahClause[]) =>
    setItem(STORAGE_KEYS.MANHAJIYYAH, data),

  getLoggedUser: (): UserAccount | null => getItem(STORAGE_KEYS.LOGGED_USER, null),
  saveLoggedUser: (user: UserAccount | null) => setItem(STORAGE_KEYS.LOGGED_USER, user),

  exportAllData: (): string => {
    const data: Record<string, any> = {};
    for (const key of Object.values(STORAGE_KEYS)) {
      data[key] = getItem(key, null);
    }
    return JSON.stringify(data, null, 2);
  },
  
  importData: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      for (const key of Object.values(STORAGE_KEYS)) {
        if (data[key] !== undefined && data[key] !== null) {
          setItem(key, data[key]);
        }
      }
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  },

  resetToDefaults: () => {
    localStorage.clear();
  },
};

/**
 * Calculates Haversine distance in meters between two lat/lng points
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
