import {
  TeachingSchedule,
  TeachingSettings,
  TeachingAttendance,
  TeachingSubstitution,
  UserAccount,
  TeachingLocation,
} from '../types';

export const DEFAULT_TEACHING_SETTINGS: TeachingSettings = {
  masukBukaMenit: 15,
  toleransiTerlambatMenit: 5,
  pulangBukaMenit: 10,
  pulangTutupMenit: 60,
  menitPerJP: 45,
  cutoffHari: 25,
  hitungJPLupaPulang: true,
  defaultRadiusMeters: 100,
  defaultMaxAccuracyMeters: 50,
  tanggalLibur: [],
};

export const NAMA_HARI_LIST = [
  'Ahad',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

/**
 * Returns Indonesian day name: Ahad, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu
 */
export function getNamaHariFromDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return NAMA_HARI_LIST[d.getDay()];
}

/**
 * Converts "HH:mm" to total minutes since 00:00
 */
export function parseHHmmToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes since midnight back to "HH:mm"
 */
export function formatMinutesToHHmm(minutes: number): string {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, Math.floor(minutes)));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculates start and end dates for a payroll / JP cutoff period.
 * Example for cutoffHari = 25:
 * For month "2026-08" (or any date in August after 25th):
 * - If input is "2026-08": start is "2026-07-26", end is "2026-08-25"
 * - If input is "2026-08-10": start is "2026-07-26", end is "2026-08-25"
 * - If input is "2026-08-28": start is "2026-08-26", end is "2026-09-25"
 */
export function computeCutoffPeriod(
  dateOrMonth: string,
  cutoffHari: number = 25
): { startDate: string; endDate: string; label: string } {
  let targetYear: number;
  let targetMonth: number; // 1-12

  if (dateOrMonth.length === 7) {
    // "YYYY-MM"
    const [y, m] = dateOrMonth.split('-').map(Number);
    targetYear = y;
    targetMonth = m;
  } else {
    // "YYYY-MM-DD"
    const [y, m, d] = dateOrMonth.split('-').map(Number);
    if (d <= cutoffHari) {
      targetYear = y;
      targetMonth = m;
    } else {
      // Moves to next month's cutoff window
      if (m === 12) {
        targetYear = y + 1;
        targetMonth = 1;
      } else {
        targetYear = y;
        targetMonth = m + 1;
      }
    }
  }

  // End date is targetYear-targetMonth-cutoffHari
  const endD = String(cutoffHari).padStart(2, '0');
  const endM = String(targetMonth).padStart(2, '0');
  const endDate = `${targetYear}-${endM}-${endD}`;

  // Start date is previous month (cutoffHari + 1)
  let startYear = targetYear;
  let startMonth = targetMonth - 1;
  if (startMonth === 0) {
    startMonth = 12;
    startYear -= 1;
  }
  const startD = String(cutoffHari + 1).padStart(2, '0');
  const startM = String(startMonth).padStart(2, '0');
  const startDate = `${startYear}-${startM}-${startD}`;

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const label = `Periode ${cutoffHari + 1} ${monthNames[startMonth - 1]} ${startYear} s/d ${cutoffHari} ${monthNames[targetMonth - 1]} ${targetYear}`;

  return { startDate, endDate, label };
}

/**
 * Returns all date strings YYYY-MM-DD between startDate and endDate inclusive
 */
export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const [sY, sM, sD] = startDate.split('-').map(Number);
  const [eY, eM, eD] = endDate.split('-').map(Number);

  const cur = new Date(sY, sM - 1, sD);
  const end = new Date(eY, eM - 1, eD);

  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }

  return dates;
}

/**
 * Checks if a schedule applies to a specific date
 */
export function isScheduleActiveOnDate(
  schedule: TeachingSchedule,
  dateStr: string,
  settings: TeachingSettings = DEFAULT_TEACHING_SETTINGS
): boolean {
  if (!schedule.isActive) return false;
  if (schedule.berlakuMulai > dateStr) return false;
  if (schedule.berlakuSampai && schedule.berlakuSampai < dateStr) return false;
  if (settings.tanggalLibur?.includes(dateStr)) return false;

  const hariName = getNamaHariFromDate(dateStr);
  return schedule.hari.includes(hariName);
}

/**
 * Detects conflicts when creating/updating a schedule
 */
export function checkScheduleConflict(
  schedules: TeachingSchedule[],
  newSched: Partial<TeachingSchedule>,
  ignoreId?: string
): { hasConflict: boolean; reason?: string } {
  if (!newSched.pejuangId || !newSched.hari || !newSched.jamMulai || !newSched.jamSelesai) {
    return { hasConflict: false };
  }

  const newStart = parseHHmmToMinutes(newSched.jamMulai);
  const newEnd = parseHHmmToMinutes(newSched.jamSelesai);
  if (newEnd <= newStart) {
    return { hasConflict: true, reason: 'Jam selesai harus lebih akhir dari jam mulai' };
  }

  for (const s of schedules) {
    if (ignoreId && s.id === ignoreId) continue;
    if (!s.isActive) continue;

    // Check date range overlap
    const newMulai = newSched.berlakuMulai || '2000-01-01';
    const newSampai = newSched.berlakuSampai || '2099-12-31';
    const sMulai = s.berlakuMulai || '2000-01-01';
    const sSampai = s.berlakuSampai || '2099-12-31';

    const dateOverlap = newMulai <= sSampai && newSampai >= sMulai;
    if (!dateOverlap) continue;

    // Check shared days
    const commonDays = s.hari.filter(h => newSched.hari?.includes(h));
    if (commonDays.length === 0) continue;

    const sStart = parseHHmmToMinutes(s.jamMulai);
    const sEnd = parseHHmmToMinutes(s.jamSelesai);
    const timeOverlap = Math.max(newStart, sStart) < Math.min(newEnd, sEnd);

    if (timeOverlap) {
      // If same teacher
      if (s.pejuangId === newSched.pejuangId) {
        return {
          hasConflict: true,
          reason: `Konflik jadwal pengajar: ${s.pejuangName} sudah memiliki jadwal di kelas ${s.className} (${s.subject}) pada hari [${commonDays.join(', ')}] pukul ${s.jamMulai}-${s.jamSelesai}.`,
        };
      }
      // If same class
      if (newSched.classId && s.classId === newSched.classId) {
        return {
          hasConflict: true,
          reason: `Konflik kelas: Kelas ${s.className} sudah dipakai untuk ${s.subject} oleh ${s.pejuangName} pada hari [${commonDays.join(', ')}] pukul ${s.jamMulai}-${s.jamSelesai}.`,
        };
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Evaluates session status on a given date and time
 */
export type SessionInteractiveState =
  | 'BELUM_WAKTUNYA'
  | 'BISA_ABSEN_MASUK'
  | 'SEDANG_MENGAJAR'
  | 'BISA_ABSEN_PULANG'
  | 'SELESAI'
  | 'TERLEWAT'
  | 'DIBADALKAN';

export interface SessionStatusEvaluation {
  state: SessionInteractiveState;
  phase: string;
  label: string;
  badgeColor: string; // Tailwind class
  canAbsenMasuk: boolean;
  canAbsenPulang: boolean;
  canClockIn: boolean;
  canClockOut: boolean;
  lateMinutes: number;
  substitution?: TeachingSubstitution;
  attendance?: TeachingAttendance;
  isCurrentUserTeacher: boolean; // is current user either original or active badal
}

export function evaluateSessionStatus(
  schedule: TeachingSchedule,
  dateStr: string,
  currentTimeHHmm: string,
  currentUserId: string,
  attendanceRecord?: TeachingAttendance,
  activeSubstitution?: TeachingSubstitution,
  settings: TeachingSettings = DEFAULT_TEACHING_SETTINGS,
  location?: TeachingLocation
): SessionStatusEvaluation {
  const curMinutes = parseHHmmToMinutes(currentTimeHHmm);
  const startMinutes = parseHHmmToMinutes(schedule.jamMulai);
  const endMinutes = parseHHmmToMinutes(schedule.jamSelesai);

  const masukBukaMenit = schedule.tolerance?.masukBukaMenit ?? settings.masukBukaMenit ?? 15;
  const toleransiTerlambatMenit = schedule.tolerance?.toleransiTerlambatMenit ?? settings.toleransiTerlambatMenit ?? 5;
  const pulangBukaMenit = schedule.tolerance?.pulangBukaMenit ?? settings.pulangBukaMenit ?? 10;
  const pulangTutupMenit = schedule.tolerance?.pulangTutupMenit ?? settings.pulangTutupMenit ?? 60;

  const masukOpenTime = startMinutes - masukBukaMenit;
  const pulangOpenTime = endMinutes - pulangBukaMenit;
  const pulangCloseTime = endMinutes + pulangTutupMenit;

  // Check if substitute exists
  const hasApprovedBadal = activeSubstitution && activeSubstitution.status === 'Disetujui';
  const isOriginalTeacher = schedule.pejuangId === currentUserId;
  const isBadalTeacher = hasApprovedBadal && activeSubstitution.substitutePejuangId === currentUserId;
  const isAssignedToCurrentUser = isBadalTeacher || (isOriginalTeacher && !hasApprovedBadal);

  // If badaled to someone else
  if (hasApprovedBadal && isOriginalTeacher) {
    return {
      state: 'DIBADALKAN',
      phase: 'DIBADALKAN',
      label: `Dibadalkan oleh ${activeSubstitution.substitutePejuangName}`,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
      canAbsenMasuk: false,
      canAbsenPulang: false,
      canClockIn: false,
      canClockOut: false,
      lateMinutes: 0,
      substitution: activeSubstitution,
      attendance: attendanceRecord,
      isCurrentUserTeacher: false,
    };
  }

  // If already finished (jamPulang recorded)
  if (attendanceRecord && attendanceRecord.jamPulang) {
    return {
      state: 'SELESAI',
      phase: 'SELESAI',
      label: 'Selesai Mengajar',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
      canAbsenMasuk: false,
      canAbsenPulang: false,
      canClockIn: false,
      canClockOut: false,
      lateMinutes: attendanceRecord.lateMinutes || 0,
      substitution: activeSubstitution,
      attendance: attendanceRecord,
      isCurrentUserTeacher: isAssignedToCurrentUser,
    };
  }

  // If already clocked in, waiting for clock out
  if (attendanceRecord && attendanceRecord.jamMasuk && !attendanceRecord.jamPulang) {
    if (curMinutes < pulangOpenTime) {
      return {
        state: 'SEDANG_MENGAJAR',
        phase: 'SEDANG_MENGAJAR',
        label: 'Sedang Mengajar',
        badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300',
        canAbsenMasuk: false,
        canAbsenPulang: false,
        canClockIn: false,
        canClockOut: false,
        lateMinutes: attendanceRecord.lateMinutes || 0,
        substitution: activeSubstitution,
        attendance: attendanceRecord,
        isCurrentUserTeacher: isAssignedToCurrentUser,
      };
    } else if (curMinutes <= pulangCloseTime) {
      return {
        state: 'BISA_ABSEN_PULANG',
        phase: 'BISA_ABSEN_PULANG',
        label: 'Bisa Absen Pulang',
        badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 animate-pulse',
        canAbsenMasuk: false,
        canAbsenPulang: isAssignedToCurrentUser,
        canClockIn: false,
        canClockOut: isAssignedToCurrentUser,
        lateMinutes: attendanceRecord.lateMinutes || 0,
        substitution: activeSubstitution,
        attendance: attendanceRecord,
        isCurrentUserTeacher: isAssignedToCurrentUser,
      };
    } else {
      // Past pulang close time without clock out
      return {
        state: 'SELESAI',
        phase: 'SELESAI',
        label: 'Selesai (Lupa Absen Pulang)',
        badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300',
        canAbsenMasuk: false,
        canAbsenPulang: false,
        canClockIn: false,
        canClockOut: false,
        lateMinutes: attendanceRecord.lateMinutes || 0,
        substitution: activeSubstitution,
        attendance: attendanceRecord,
        isCurrentUserTeacher: isAssignedToCurrentUser,
      };
    }
  }

  // Not clocked in yet
  if (curMinutes < masukOpenTime) {
    const minsUntilOpen = masukOpenTime - curMinutes;
    return {
      state: 'BELUM_WAKTUNYA',
      phase: 'BELUM_WAKTUNYA',
      label: minsUntilOpen > 60
        ? `Buka ${formatMinutesToHHmm(masukOpenTime)}`
        : `Buka dlm ${minsUntilOpen} menit`,
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
      canAbsenMasuk: false,
      canAbsenPulang: false,
      canClockIn: false,
      canClockOut: false,
      lateMinutes: 0,
      substitution: activeSubstitution,
      attendance: attendanceRecord,
      isCurrentUserTeacher: isAssignedToCurrentUser,
    };
  }

  if (curMinutes <= endMinutes) {
    const late = Math.max(0, curMinutes - (startMinutes + toleransiTerlambatMenit));
    return {
      state: 'BISA_ABSEN_MASUK',
      phase: 'BISA_ABSEN_MASUK',
      label: late > 0 ? `Bisa Absen (Terlambat ${late}m)` : 'Bisa Absen Masuk',
      badgeColor: late > 0
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
      canAbsenMasuk: isAssignedToCurrentUser,
      canAbsenPulang: false,
      canClockIn: isAssignedToCurrentUser,
      canClockOut: false,
      lateMinutes: late,
      substitution: activeSubstitution,
      attendance: attendanceRecord,
      isCurrentUserTeacher: isAssignedToCurrentUser,
    };
  }

  // Past schedule end time without clock in
  return {
    state: 'TERLEWAT',
    phase: 'TERLEWAT',
    label: 'Tidak Masuk / Terlewat',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
    canAbsenMasuk: false,
    canAbsenPulang: false,
    canClockIn: false,
    canClockOut: false,
    lateMinutes: 0,
    substitution: activeSubstitution,
    attendance: attendanceRecord,
    isCurrentUserTeacher: isAssignedToCurrentUser,
  };
}

/**
 * Report data row structure for Laporan Mengajar
 */
export interface TeachingReportRow {
  pejuangId: string;
  namaPengajar: string;
  nipy: string;
  namaBank: string;
  noRekening: string;
  unit: string;
  subject: string; // MAPEL
  dailyJP: Record<string, {
    jp: number;
    status: 'Hadir' | 'Terlambat' | 'Badal' | 'Alpa' | 'Izin' | 'Sakit' | 'Libur' | '-';
    tooltip?: string;
    isBadal?: boolean;
    badalFor?: string;
    details?: TeachingAttendance[];
  }>;
  totalJP: number;
  totalHadir: number;
  totalTerlambat: number;
  totalBadal: number;
  totalSesi: number;
}

/**
 * Generates the multi-day JP summary report matching the attached Al-Bahjah Excel specification
 */
export function generateTeachingReportData(
  teachers: UserAccount[],
  schedules: TeachingSchedule[],
  attendanceList: TeachingAttendance[],
  substitutions: TeachingSubstitution[],
  dateList: string[],
  settings: TeachingSettings = DEFAULT_TEACHING_SETTINGS
): TeachingReportRow[] {
  // Only users who teach or have schedules/attendance
  const eligibleTeachers = teachers.filter(t => 
    t.isPengajar || 
    schedules.some(s => s.pejuangId === t.id) ||
    attendanceList.some(a => a.pejuangId === t.id)
  );

  const rows: TeachingReportRow[] = [];

  for (const teacher of eligibleTeachers) {
    const teacherSchedules = schedules.filter(s => s.pejuangId === teacher.id && s.isActive);
    const uniqueSubjects = Array.from(new Set(teacherSchedules.map(s => s.subject).filter(Boolean)));
    const subjectLabel = uniqueSubjects.length > 0 ? uniqueSubjects.join(', ') : (teacher.amanah || 'Pengajar');

    const dailyJP: TeachingReportRow['dailyJP'] = {};
    let totalJP = 0;
    let totalHadir = 0;
    let totalTerlambat = 0;
    let totalBadal = 0;
    let totalSesi = 0;

    for (const dateStr of dateList) {
      // Find attendances done by this teacher on this date
      const attendances = attendanceList.filter(a => a.pejuangId === teacher.id && a.date === dateStr);

      if (attendances.length > 0) {
        let dayJP = 0;
        let hasBadal = false;
        let hasLate = false;
        const detailsText: string[] = [];

        for (const att of attendances) {
          totalSesi++;
          const jp = att.jumlahJP || 0;
          dayJP += jp;
          if (att.isBadal) {
            hasBadal = true;
            totalBadal++;
            detailsText.push(`${att.subject} (${att.className}): ${jp} JP (Badal u/ ${att.scheduledPejuangName})`);
          } else {
            if (att.status === 'Terlambat') {
              hasLate = true;
              totalTerlambat++;
            } else {
              totalHadir++;
            }
            detailsText.push(`${att.subject} (${att.className}): ${jp} JP (${att.status})`);
          }
        }

        totalJP += dayJP;
        dailyJP[dateStr] = {
          jp: dayJP,
          status: hasBadal ? 'Badal' : (hasLate ? 'Terlambat' : 'Hadir'),
          tooltip: detailsText.join('\n'),
          isBadal: hasBadal,
          details: attendances,
        };
      } else {
        // Check if teacher had schedules scheduled for this day
        const daySchedules = teacherSchedules.filter(s => isScheduleActiveOnDate(s, dateStr, settings));
        if (daySchedules.length > 0) {
          // Check if any was badaled to another person
          const daySubs = substitutions.filter(
            sub => sub.date === dateStr && sub.originalPejuangId === teacher.id && sub.status === 'Disetujui'
          );
          if (daySubs.length > 0) {
            dailyJP[dateStr] = {
              jp: 0,
              status: 'Badal',
              tooltip: `Dibadalkan kepada: ${daySubs.map(s => s.substitutePejuangName).join(', ')}`,
            };
          } else {
            // Did not attend
            dailyJP[dateStr] = {
              jp: 0,
              status: 'Alpa',
              tooltip: `Jadwal tidak dihadiri: ${daySchedules.map(s => `${s.subject} (${s.className})`).join(', ')}`,
            };
          }
        } else {
          dailyJP[dateStr] = {
            jp: 0,
            status: '-',
          };
        }
      }
    }

    rows.push({
      pejuangId: teacher.id,
      namaPengajar: teacher.name,
      nipy: teacher.nipy || '-',
      namaBank: teacher.namaBank || '-',
      noRekening: teacher.noRekening || '-',
      unit: teacher.subDivisi || 'Al-Bahjah',
      subject: subjectLabel,
      dailyJP,
      totalJP,
      totalHadir,
      totalTerlambat,
      totalBadal,
      totalSesi,
    });
  }

  // Sort rows alphabetically by teacher name
  rows.sort((a, b) => a.namaPengajar.localeCompare(b.namaPengajar));

  return rows;
}

/**
 * Calculates geodesic distance between two GPS coordinates in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Format local date YYYY-MM-DD
 */
export function getLocalDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format minutes into readable "X Jam Y Menit"
 */
export function formatMenitKeJamMenit(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0 Menit';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h} Jam ${m} Menit`;
  if (h > 0) return `${h} Jam`;
  return `${m} Menit`;
}

/**
 * Calculate cutoff date range (e.g. 21 of previous month to 20 of current month)
 */
export function calculateCutoffRange(
  startDay: number = 21,
  endDay: number = 20,
  referenceDate: Date = new Date()
): { startDate: string; endDate: string; label: string } {
  const ref = new Date(referenceDate);
  const currentDay = ref.getDate();
  const currentMonth = ref.getMonth();
  const currentYear = ref.getFullYear();

  let startYear = currentYear;
  let startMonth = currentMonth;
  let endYear = currentYear;
  let endMonth = currentMonth;

  if (currentDay >= startDay) {
    // We are past cutoff start day, so period is this month startDay -> next month endDay
    endMonth = currentMonth + 1;
    if (endMonth > 11) {
      endMonth = 0;
      endYear = currentYear + 1;
    }
  } else {
    // We are before startDay, so period is previous month startDay -> this month endDay
    startMonth = currentMonth - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear = currentYear - 1;
    }
  }

  const startDate = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
  const label = `${startDate} s/d ${endDate}`;

  return { startDate, endDate, label };
}

/**
 * Returns list of dates between startDate and endDate
 */
export function getDatesBetween(startDate: string, endDate: string): string[] {
  return getDatesInRange(startDate, endDate);
}

