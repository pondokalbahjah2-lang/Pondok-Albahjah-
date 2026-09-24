import { UserAccount, DivisiRecord, WorkSchedule } from '../types';

export interface EffectiveWorkHours {
  jamMasuk: string;
  jamPulang: string;
  toleransiMenit: number;
  isNightShift: boolean;
  shiftId?: string;
  namaShift?: string;
  source: 'divisi-shift' | 'work-schedule';
  missingShiftAssignment?: boolean;
}

export const normalizeSubDivisi = (val: string) =>
  (val || '')
    .toLowerCase()
    .replace(/^(divisi|sub\s*divisi)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

export const resolveUserSchedule = (
  user: UserAccount | null | undefined,
  schedulesList: WorkSchedule[] = []
): WorkSchedule | undefined => {
  if (!user || !schedulesList || schedulesList.length === 0) return undefined;

  const userDiv = normalizeSubDivisi(user.subDivisi);

  // 1. Specific Individual override
  const indiv = schedulesList.find(
    s => s.targetType === 'Individu' && (s.targetId === user.id || s.targetName === user.name)
  );
  if (indiv) return indiv;

  // 2. Group override
  const grp = schedulesList.find(
    s => s.targetType === 'Group' && s.pejuangIds?.includes(user.id)
  );
  if (grp) return grp;

  // 3. Exact division match
  if (userDiv) {
    const divMatch = schedulesList.find(s => {
      if (s.targetType === 'Divisi') {
        const sTarget = normalizeSubDivisi(s.targetName);
        const sId = normalizeSubDivisi(s.targetId);
        return sTarget === userDiv || sId === userDiv || sTarget.includes(userDiv) || userDiv.includes(sTarget);
      }
      return false;
    });
    if (divMatch) return divMatch;
  }

  // 4. "Semua Divisi" general schedule
  const generalDiv = schedulesList.find(
    s => s.targetType === 'Divisi' && (normalizeSubDivisi(s.targetName).includes('semua') || normalizeSubDivisi(s.targetId).includes('semua'))
  );
  if (generalDiv) return generalDiv;

  // 5. Fallback to first available schedule
  return schedulesList[0];
};

export const getEffectiveWorkHours = (
  user: UserAccount | null | undefined,
  divisions: DivisiRecord[] = [],
  schedules: WorkSchedule[] = [],
  dayName?: string
): EffectiveWorkHours => {
  const hariMap = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const currentDay = dayName || hariMap[new Date().getDay()];

  if (user?.subDivisi && Array.isArray(divisions) && divisions.length > 0) {
    const userDiv = normalizeSubDivisi(user.subDivisi);
    const matchedDivisi = divisions.find(d => {
      const dName = normalizeSubDivisi(d.namaDivisi);
      return dName === userDiv || dName.includes(userDiv) || userDiv.includes(dName);
    });

    if (
      matchedDivisi &&
      matchedDivisi.hasTwoShifts === true &&
      Array.isArray(matchedDivisi.shifts) &&
      matchedDivisi.shifts.length >= 2
    ) {
      let shift = matchedDivisi.shifts.find(s => s.id === user.assignedShiftId);
      let missingShiftAssignment = false;
      if (!shift) {
        shift = matchedDivisi.shifts[0];
        missingShiftAssignment = true;
      }

      const jamMasuk = shift.jamMasuk || "08:00";
      const jamPulang = shift.jamPulang || "16:00";
      const [schMasukH] = jamMasuk.split(':').map(Number);
      const [schPulangH] = jamPulang.split(':').map(Number);
      const isNightShift = Boolean(shift.isNightShift || schPulangH < schMasukH);

      return {
        jamMasuk,
        jamPulang,
        toleransiMenit: typeof shift.toleransiMenit === 'number' ? shift.toleransiMenit : 0,
        isNightShift,
        shiftId: shift.id,
        namaShift: shift.namaShift,
        source: 'divisi-shift',
        missingShiftAssignment,
      };
    }
  }

  // Fallback to work-schedule (1 shift or no division shift)
  const userSchedule = (user ? resolveUserSchedule(user, schedules) : undefined) || schedules[0];
  const jamMasuk = userSchedule?.customJamKerja?.[currentDay]?.masuk ||
    (currentDay === 'Ahad' ? userSchedule?.customJamKerja?.['Minggu']?.masuk : undefined) ||
    userSchedule?.jamMasuk ||
    "08:00";
  const jamPulang = userSchedule?.customJamKerja?.[currentDay]?.pulang ||
    (currentDay === 'Ahad' ? userSchedule?.customJamKerja?.['Minggu']?.pulang : undefined) ||
    userSchedule?.jamPulang ||
    "16:00";

  const [schMasukH] = jamMasuk.split(':').map(Number);
  const [schPulangH] = jamPulang.split(':').map(Number);
  const isNightShift = Boolean(userSchedule?.isNightShift || schPulangH < schMasukH);

  return {
    jamMasuk,
    jamPulang,
    toleransiMenit: 0,
    isNightShift,
    shiftId: undefined,
    namaShift: undefined,
    source: 'work-schedule',
    missingShiftAssignment: false,
  };
};
