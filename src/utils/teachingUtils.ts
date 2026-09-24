import {
  TeachingSchedule,
  TeachingAttendance,
  TeachingSubstitution,
  TeachingLocation,
  TeachingSessionItem,
  JPPengajarSummary,
  AttendanceRekapItem,
  TeachingSessionDetailItem,
  TeachingBadalRekapItem,
  HolidayRecord,
  UserAccount,
  TeachingSettings
} from '../types';

export const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'] as const;

export const INDONESIAN_MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const INDONESIAN_MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Mendapatkan nama hari bahasa Indonesia dari tanggal YYYY-MM-DD
 */
export function getIndonesianDayName(dateStr: string): 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Ahad' {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayIndex = d.getDay(); // 0 = Ahad/Minggu, 1 = Senin, ...
  const map: Record<number, 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Ahad'> = {
    0: 'Ahad',
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu'
  };
  return map[dayIndex] || 'Senin';
}

/**
 * Format string tanggal YYYY-MM-DD ke format tampilan Indonesia
 */
export function formatIndoDate(dateStr: string, withDay = false): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const mName = INDONESIAN_MONTH_NAMES[month - 1] || '';
  if (withDay) {
    const dName = getIndonesianDayName(dateStr);
    return `${dName}, ${day} ${mName} ${year}`;
  }
  return `${day} ${mName} ${year}`;
}

/**
 * Konversi "HH:mm" ke total menit dari tengah malam
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Konversi menit ke format "HH:mm" atau "X jam Y mnt"
 */
export function minutesToDurationStr(minutes: number): string {
  if (minutes <= 0) return '0 mnt';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} jam ${m} mnt`;
  if (h > 0) return `${h} jam`;
  return `${m} mnt`;
}

/**
 * Menghitung selisih keterlambatan dalam menit
 */
export function computeLateMinutes(jamMasuk: string, jamMulai: string, toleranceMinutes = 10): number {
  const masukMin = timeToMinutes(jamMasuk);
  const mulaiMin = timeToMinutes(jamMulai);
  const diff = masukMin - mulaiMin;
  if (diff > toleranceMinutes) {
    return diff;
  }
  return 0;
}

/**
 * Menghitung jarak haversine dalam meter
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
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
 * Memeriksa bentrok jadwal mengajar
 */
export function checkScheduleConflict(
  newSchedule: TeachingSchedule,
  existingSchedules: TeachingSchedule[]
): { hasConflict: boolean; reason?: string } {
  const newStart = timeToMinutes(newSchedule.jamMulai);
  const newEnd = timeToMinutes(newSchedule.jamSelesai);

  for (const sch of existingSchedules) {
    if (sch.id === newSchedule.id) continue;
    if (!sch.isActive) continue;
    if (sch.hari !== newSchedule.hari) continue;

    const schStart = timeToMinutes(sch.jamMulai);
    const schEnd = timeToMinutes(sch.jamSelesai);

    // Cek apakah waktu tumpang tindih
    const overlaps = Math.max(newStart, schStart) < Math.min(newEnd, schEnd);
    if (!overlaps) continue;

    // 1. Bentrok Pengajar yang sama di jam yang sama
    if (sch.pejuangId === newSchedule.pejuangId) {
      return {
        hasConflict: true,
        reason: `Pengajar ${sch.pejuangName} sudah memiliki jadwal mengajar pada hari ${sch.hari} pukul ${sch.jamMulai}-${sch.jamSelesai} di kelas ${sch.className} (${sch.mapel})`
      };
    }

    // 2. Bentrok Kelas yang sama di jam yang sama
    if (sch.classId === newSchedule.classId) {
      return {
        hasConflict: true,
        reason: `Kelas ${sch.className} sudah terjadwal pelajaran ${sch.mapel} bersama ${sch.pejuangName} pada hari ${sch.hari} pukul ${sch.jamMulai}-${sch.jamSelesai}`
      };
    }
  }

  return { hasConflict: false };
}

export interface PeriodCutOffInfo {
  periodeLabel: string; // e.g. "Agustus 2026"
  codeLabel: string; // e.g. "26Jul-25Agu2026"
  formattedRange: string; // e.g. "26 Juli - 25 Agustus 2026"
  dates: string[]; // List of YYYY-MM-DD
  prevMonthName: string; // "Juli"
  prevMonthDates: string[]; // ['2026-07-26', ..., '2026-07-31']
  currMonthName: string; // "Agustus"
  currMonthDates: string[]; // ['2026-08-01', ..., '2026-08-25']
  year: number;
  monthNumber: number; // 1-12
}

/**
 * Menghitung periode cut-off (26 bulan lalu s/d 25 bulan berjalan)
 * Contoh: "Agustus 2026" -> 26 Juli 2026 sampai 25 Agustus 2026
 */
export function computeCutOffPeriod(periodeStr: string, cutOffDay = 26): PeriodCutOffInfo {
  let targetYear = new Date().getFullYear();
  let targetMonth = new Date().getMonth() + 1; // 1-12

  if (periodeStr) {
    const parts = periodeStr.trim().split(' ');
    if (parts.length >= 2) {
      const mIdx = INDONESIAN_MONTH_NAMES.findIndex(
        m => m.toLowerCase() === parts[0].toLowerCase()
      );
      if (mIdx !== -1) {
        targetMonth = mIdx + 1;
      }
      const y = parseInt(parts[1], 10);
      if (!isNaN(y)) {
        targetYear = y;
      }
    }
  }

  // Bulan lalu
  let prevYear = targetYear;
  let prevMonth = targetMonth - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = targetYear - 1;
  }

  const prevMonthName = INDONESIAN_MONTH_NAMES[prevMonth - 1];
  const currMonthName = INDONESIAN_MONTH_NAMES[targetMonth - 1];

  // Jumlah hari di bulan lalu
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

  const prevMonthDates: string[] = [];
  for (let d = cutOffDay; d <= daysInPrevMonth; d++) {
    const mStr = String(prevMonth).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    prevMonthDates.push(`${prevYear}-${mStr}-${dStr}`);
  }

  const currMonthDates: string[] = [];
  const endDay = cutOffDay - 1; // e.g. 25
  for (let d = 1; d <= endDay; d++) {
    const mStr = String(targetMonth).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    currMonthDates.push(`${targetYear}-${mStr}-${dStr}`);
  }

  const allDates = [...prevMonthDates, ...currMonthDates];

  const prevShort = INDONESIAN_MONTH_SHORT[prevMonth - 1];
  const currShort = INDONESIAN_MONTH_SHORT[targetMonth - 1];
  const codeLabel = `${cutOffDay}${prevShort}-${endDay}${currShort}${targetYear}`;
  const formattedRange = `${cutOffDay} ${prevMonthName} - ${endDay} ${currMonthName} ${targetYear}`;

  return {
    periodeLabel: `${currMonthName} ${targetYear}`,
    codeLabel,
    formattedRange,
    dates: allDates,
    prevMonthName,
    prevMonthDates,
    currMonthName,
    currMonthDates,
    year: targetYear,
    monthNumber: targetMonth
  };
}

/**
 * Menyusun sesi mengajar untuk suatu tanggal tertentu
 */
export function resolveSessionsForDate(
  date: string,
  schedules: TeachingSchedule[],
  attendances: TeachingAttendance[],
  substitutions: TeachingSubstitution[],
  holidays: HolidayRecord[],
  currentTimeWib?: { date: string; time: string },
  toleranceMinutes = 10,
  lockPulangEarlyMinutes = 5
): TeachingSessionItem[] {
  const dayName = getIndonesianDayName(date);
  const matchingSchedules = schedules.filter(s => s.isActive && s.hari === dayName);

  const nowWibDate = currentTimeWib?.date || new Date().toISOString().split('T')[0];
  const nowWibTime = currentTimeWib?.time || new Date().toTimeString().slice(0, 5);
  const nowMinutes = timeToMinutes(nowWibTime);

  const isHoliday = holidays.some(h => h.tanggal === date);

  return matchingSchedules.map(sch => {
    const attendance = attendances.find(a => a.scheduleId === sch.id && a.date === date);
    const substitution = substitutions.find(
      s => s.scheduleId === sch.id && s.date === date && s.status === 'Disetujui'
    );

    const isBadal = !!substitution;
    const effectivePejuangId = isBadal ? substitution.substitutePejuangId : sch.pejuangId;
    const effectivePejuangName = isBadal ? substitution.substitutePejuangName : sch.pejuangName;

    const isToday = date === nowWibDate;
    const isPast = date < nowWibDate;
    const isFuture = date > nowWibDate;

    const startMinutes = timeToMinutes(sch.jamMulai);
    const endMinutes = timeToMinutes(sch.jamSelesai);

    let computedStatus: TeachingSessionItem['computedStatus'] = 'Terjadwal';

    if (attendance) {
      computedStatus = attendance.status;
      // Deteksi lupa absen pulang jika sudah lewat jam selesai di hari lampau atau malam ini
      if (!attendance.jamPulang && (isPast || (isToday && nowMinutes > endMinutes + 60))) {
        computedStatus = 'Lupa Absen Pulang';
      }
    } else if (isHoliday) {
      computedStatus = 'Libur';
    } else if (isPast) {
      computedStatus = 'Alpa';
    } else if (isToday) {
      if (nowMinutes > endMinutes + toleranceMinutes) {
        computedStatus = 'Alpa';
      } else if (nowMinutes < startMinutes - 30) {
        computedStatus = 'Belum Waktunya';
      } else {
        computedStatus = 'Terjadwal';
      }
    } else {
      computedStatus = 'Terjadwal';
    }

    // Hitung tombol Absen Masuk & Pulang
    let canAbsenMasuk = false;
    let canAbsenPulang = false;
    let reasonDisabledMasuk = '';
    let reasonDisabledPulang = '';

    if (!isToday) {
      reasonDisabledMasuk = 'Absen hanya dapat dilakukan pada tanggal jadwal (Hari ini).';
      reasonDisabledPulang = 'Absen hanya dapat dilakukan pada tanggal jadwal (Hari ini).';
    } else if (attendance?.jamMasuk) {
      reasonDisabledMasuk = `Sudah absen masuk (${attendance.jamMasuk}).`;
      if (attendance.jamPulang) {
        reasonDisabledPulang = `Sudah absen pulang (${attendance.jamPulang}).`;
      } else {
        // Cek lock jam pulang
        const earliestPulang = endMinutes - lockPulangEarlyMinutes;
        if (nowMinutes < earliestPulang) {
          reasonDisabledPulang = `Absen pulang terkunci sampai pukul ${minutesToDurationStr(earliestPulang)} (minimal ${lockPulangEarlyMinutes} menit sebelum jam selesai).`;
        } else {
          canAbsenPulang = true;
        }
      }
    } else {
      // Belum absen masuk
      const earliestMasuk = startMinutes - 30; // 30 menit sebelum mulai
      if (nowMinutes < earliestMasuk) {
        reasonDisabledMasuk = `Absen masuk dibuka 30 menit sebelum jadwal (${sch.jamMulai}).`;
      } else if (nowMinutes > endMinutes + 30) {
        reasonDisabledMasuk = 'Waktu sesi mengajar telah berakhir.';
      } else {
        canAbsenMasuk = true;
      }
      reasonDisabledPulang = 'Harap lakukan absen masuk terlebih dahulu.';
    }

    return {
      schedule: sch,
      date,
      hari: dayName,
      isToday,
      isPast,
      effectivePejuangId,
      effectivePejuangName,
      isBadal,
      substitution,
      attendance,
      computedStatus,
      canAbsenMasuk,
      canAbsenPulang,
      reasonDisabledMasuk,
      reasonDisabledPulang
    };
  });
}

/**
 * Menghitung Grid Rekap JP per Pengajar & Mapel untuk Periode Cut-Off
 */
export function computeJPPengajarGrid(
  unit: string,
  periodInfo: PeriodCutOffInfo,
  schedules: TeachingSchedule[],
  attendances: TeachingAttendance[],
  substitutions: TeachingSubstitution[],
  holidays: HolidayRecord[],
  teachers: UserAccount[]
): JPPengajarSummary[] {
  // Ambil jadwal aktif unit ini
  const unitSchedules = schedules.filter(s => s.isActive && (unit === 'Semua Unit' || s.unit === unit));
  if (unitSchedules.length === 0) return [];

  // Map pengajar + mapel pairs
  // Kunci unik: `${effectivePejuangId}_${mapel}`
  interface TeacherMapelGroup {
    pejuangId: string;
    pejuangName: string;
    mapel: string;
    unit: string;
    dailyJP: Record<string, number>;
  }

  const groupMap = new Map<string, TeacherMapelGroup>();

  // Inisialisasi dari jadwal asli
  for (const sch of unitSchedules) {
    const key = `${sch.pejuangId}_${sch.mapel}_${sch.unit}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        pejuangId: sch.pejuangId,
        pejuangName: sch.pejuangName,
        mapel: sch.mapel,
        unit: sch.unit,
        dailyJP: {}
      });
    }
  }

  // Juga tambahkan kemungkinan badal ke groupMap
  for (const sub of substitutions) {
    if (sub.status === 'Disetujui' && (unit === 'Semua Unit' || sub.unit === unit)) {
      const key = `${sub.substitutePejuangId}_${sub.mapel}_${sub.unit}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          pejuangId: sub.substitutePejuangId,
          pejuangName: sub.substitutePejuangName,
          mapel: sub.mapel,
          unit: sub.unit,
          dailyJP: {}
        });
      }
    }
  }

  // Loop setiap tanggal pada periode
  for (const dateStr of periodInfo.dates) {
    const dayName = getIndonesianDayName(dateStr);
    const daySchedules = unitSchedules.filter(s => s.hari === dayName);

    for (const sch of daySchedules) {
      // Cek apakah ada badal yang disetujui pada tanggal ini
      const approvedBadal = substitutions.find(
        sub => sub.scheduleId === sch.id && sub.date === dateStr && sub.status === 'Disetujui'
      );

      // Siapa yang berhak menerima JP: jika badal disetujui -> pengganti, jika tidak -> pengajar asli
      const recipientId = approvedBadal ? approvedBadal.substitutePejuangId : sch.pejuangId;
      const recipientName = approvedBadal ? approvedBadal.substitutePejuangName : sch.pejuangName;
      const key = `${recipientId}_${sch.mapel}_${sch.unit}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          pejuangId: recipientId,
          pejuangName: recipientName,
          mapel: sch.mapel,
          unit: sch.unit,
          dailyJP: {}
        });
      }

      // Cari record absensi jika ada
      const att = attendances.find(a => a.scheduleId === sch.id && a.date === dateStr);
      let earnedJP = 0;

      if (att) {
        // Jika ada record absensi dan status Hadir/Terlambat, hitung JP
        if (att.status === 'Hadir' || att.status === 'Terlambat') {
          // Gunakan snapshot jumlahJP di absensi jika ada, untuk menjamin historisitas
          earnedJP = att.jumlahJP ?? sch.jumlahJP;
        }
      }

      const group = groupMap.get(key)!;
      group.dailyJP[dateStr] = (group.dailyJP[dateStr] || 0) + earnedJP;
    }
  }

  // Ubah ke array dan hitung totalJP
  const result: JPPengajarSummary[] = [];
  let no = 1;

  // Urutkan berdasarkan Nama Pengajar lalu Mapel
  const sortedGroups = Array.from(groupMap.values()).sort((a, b) => {
    const comp = a.pejuangName.localeCompare(b.pejuangName);
    if (comp !== 0) return comp;
    return a.mapel.localeCompare(b.mapel);
  });

  for (const item of sortedGroups) {
    let totalJP = 0;
    for (const d of periodInfo.dates) {
      totalJP += item.dailyJP[d] || 0;
    }

    result.push({
      no: no++,
      pejuangId: item.pejuangId,
      pejuangName: item.pejuangName,
      mapel: item.mapel,
      unit: item.unit,
      dailyJP: item.dailyJP,
      totalJP
    });
  }

  return result;
}

/**
 * Menghitung Rekap Kehadiran Mengajar per Pengajar (Sheet 2)
 */
export function computeAttendanceRekap(
  unit: string,
  periodInfo: PeriodCutOffInfo,
  schedules: TeachingSchedule[],
  attendances: TeachingAttendance[],
  substitutions: TeachingSubstitution[],
  holidays: HolidayRecord[],
  teachers: UserAccount[]
): AttendanceRekapItem[] {
  const unitSchedules = schedules.filter(s => s.isActive && (unit === 'Semua Unit' || s.unit === unit));
  const holidayDates = new Set(holidays.map(h => h.tanggal));

  // Ambil semua pengajar unik dari jadwal unit ini
  const teacherIds = new Set<string>();
  unitSchedules.forEach(s => teacherIds.add(s.pejuangId));
  substitutions.forEach(s => {
    if (s.status === 'Disetujui' && (unit === 'Semua Unit' || s.unit === unit)) {
      teacherIds.add(s.substitutePejuangId);
    }
  });

  const nowWibDate = new Date().toISOString().split('T')[0];
  const nowWibTime = new Date().toTimeString().slice(0, 5);
  const nowMinutes = timeToMinutes(nowWibTime);

  const result: AttendanceRekapItem[] = [];

  for (const tid of teacherIds) {
    const teacherAcc = teachers.find(t => t.id === tid);
    const teacherName = teacherAcc?.name || unitSchedules.find(s => s.pejuangId === tid)?.pejuangName || tid;

    let totalSesiTerjadwal = 0;
    let hadir = 0;
    let terlambat = 0;
    let alpa = 0;
    let izinSakit = 0;
    let totalMenitTerlambat = 0;
    let totalJamMengajar = 0; // dalam desimal jam
    let totalJP = 0;
    let badalDiberikan = 0;
    let badalDiterima = 0;

    for (const dateStr of periodInfo.dates) {
      if (holidayDates.has(dateStr)) continue; // Libur tidak dihitung alpa

      const dayName = getIndonesianDayName(dateStr);
      const daySchedules = unitSchedules.filter(s => s.hari === dayName);

      for (const sch of daySchedules) {
        const approvedBadal = substitutions.find(
          sub => sub.scheduleId === sch.id && sub.date === dateStr && sub.status === 'Disetujui'
        );

        const isOriginal = sch.pejuangId === tid;
        const isSubstitute = approvedBadal?.substitutePejuangId === tid;

        if (!isOriginal && !isSubstitute) continue;

        // Hitung badal diberikan & diterima
        if (isOriginal && approvedBadal) {
          badalDiberikan++;
          // Sesi dibadalkan ke orang lain, pengajar asli tidak kena alpa
          continue;
        }

        if (isSubstitute) {
          badalDiterima++;
        }

        totalSesiTerjadwal++;

        const att = attendances.find(a => a.scheduleId === sch.id && a.date === dateStr);
        const startMin = timeToMinutes(sch.jamMulai);
        const endMin = timeToMinutes(sch.jamSelesai);
        const durationHours = (endMin - startMin) / 60;

        if (att) {
          if (att.status === 'Hadir') {
            hadir++;
            totalJP += att.jumlahJP ?? sch.jumlahJP;
            totalJamMengajar += durationHours;
          } else if (att.status === 'Terlambat') {
            terlambat++;
            totalMenitTerlambat += att.lateMinutes || 0;
            totalJP += att.jumlahJP ?? sch.jumlahJP;
            totalJamMengajar += durationHours;
          } else if (att.status === 'Izin' || att.status === 'Sakit') {
            izinSakit++;
          } else if (att.status === 'Alpa') {
            alpa++;
          } else if (att.status === 'Lupa Absen Pulang') {
            hadir++;
            totalJP += att.jumlahJP ?? sch.jumlahJP;
            totalJamMengajar += durationHours;
          }
        } else {
          // Belum ada absen
          const isPast = dateStr < nowWibDate;
          const isTodayPast = dateStr === nowWibDate && nowMinutes > endMin + 15;
          if (isPast || isTodayPast) {
            alpa++;
          }
        }
      }
    }

    const persenKehadiran = totalSesiTerjadwal > 0
      ? Math.round(((hadir + terlambat) / totalSesiTerjadwal) * 100)
      : 0;

    result.push({
      pejuangId: tid,
      pejuangName: teacherName,
      unit,
      totalSesiTerjadwal,
      hadir,
      terlambat,
      alpa,
      izinSakit,
      totalMenitTerlambat,
      totalJamMengajar: Number(totalJamMengajar.toFixed(1)),
      totalJP,
      badalDiberikan,
      badalDiterima,
      persenKehadiran
    });
  }

  return result.sort((a, b) => a.pejuangName.localeCompare(b.pejuangName));
}

/**
 * Menghitung Detail Sesi Mengajar (Sheet 3)
 */
export function computeDetailSesi(
  unit: string,
  periodInfo: PeriodCutOffInfo,
  schedules: TeachingSchedule[],
  attendances: TeachingAttendance[],
  substitutions: TeachingSubstitution[],
  holidays: HolidayRecord[],
  locations: TeachingLocation[]
): TeachingSessionDetailItem[] {
  const unitSchedules = schedules.filter(s => s.isActive && (unit === 'Semua Unit' || s.unit === unit));
  const holidayDates = new Set(holidays.map(h => h.tanggal));
  const nowWibDate = new Date().toISOString().split('T')[0];
  const nowWibTime = new Date().toTimeString().slice(0, 5);
  const nowMinutes = timeToMinutes(nowWibTime);

  const result: TeachingSessionDetailItem[] = [];

  for (const dateStr of periodInfo.dates) {
    const isHoliday = holidayDates.has(dateStr);
    const dayName = getIndonesianDayName(dateStr);
    const daySchedules = unitSchedules.filter(s => s.hari === dayName);

    for (const sch of daySchedules) {
      const approvedBadal = substitutions.find(
        sub => sub.scheduleId === sch.id && sub.date === dateStr && sub.status === 'Disetujui'
      );
      const isBadal = !!approvedBadal;

      const effectiveTeacherName = isBadal ? approvedBadal.substitutePejuangName : sch.pejuangName;
      const att = attendances.find(a => a.scheduleId === sch.id && a.date === dateStr);

      const startMin = timeToMinutes(sch.jamMulai);
      const endMin = timeToMinutes(sch.jamSelesai);
      const durationStr = minutesToDurationStr(endMin - startMin);

      let status = 'Terjadwal';
      let terlambatMenit = 0;
      let jamMasuk = '-';
      let jamPulang = '-';
      let jarakMasukMeter: number | string = '-';
      let catatan = '';

      if (att) {
        status = att.status;
        jamMasuk = att.jamMasuk || '-';
        jamPulang = att.jamPulang || '-';
        terlambatMenit = att.lateMinutes || 0;
        jarakMasukMeter = att.masukDistanceMeters != null ? `${att.masukDistanceMeters} m` : '-';
        catatan = att.notes || '';
      } else if (isHoliday) {
        status = 'Libur';
      } else if (dateStr < nowWibDate || (dateStr === nowWibDate && nowMinutes > endMin + 15)) {
        status = 'Alpa';
      }

      result.push({
        tanggal: dateStr,
        hari: dayName,
        unit: sch.unit,
        pengajar: effectiveTeacherName,
        kelas: sch.className,
        mapel: sch.mapel,
        jp: att?.jumlahJP ?? sch.jumlahJP,
        lokasi: sch.locationName || 'Kampus Al-Bahjah',
        jadwalMulaiSelesai: `${sch.jamMulai} - ${sch.jamSelesai}`,
        jamMasuk,
        jamPulang,
        durasi: durationStr,
        status,
        terlambatMenit,
        jarakMasukMeter,
        badal: isBadal ? 'Ya' : 'Tidak',
        pengajarAsli: sch.pejuangName,
        catatan
      });
    }
  }

  // Urutkan berdasarkan tanggal ASC, lalu jadwal mulai
  return result.sort((a, b) => {
    const dComp = a.tanggal.localeCompare(b.tanggal);
    if (dComp !== 0) return dComp;
    return a.jadwalMulaiSelesai.localeCompare(b.jadwalMulaiSelesai);
  });
}

/**
 * Menghitung Rekap Badal Mengajar (Sheet 4)
 */
export function computeRekapBadal(
  unit: string,
  periodInfo: PeriodCutOffInfo,
  substitutions: TeachingSubstitution[],
  schedules: TeachingSchedule[]
): TeachingBadalRekapItem[] {
  const datesSet = new Set(periodInfo.dates);
  const relevantBadal = substitutions.filter(
    sub => datesSet.has(sub.date) && (unit === 'Semua Unit' || sub.unit === unit)
  );

  return relevantBadal.map(sub => {
    const sch = schedules.find(s => s.id === sub.scheduleId);
    return {
      tanggal: sub.date,
      unit: sub.unit,
      kelas: sub.className,
      mapel: sub.mapel,
      jp: sub.jumlahJP,
      jadwal: `${sub.jamMulai} - ${sub.jamSelesai}`,
      pengajarAsli: sub.originalPejuangName,
      pengajarPengganti: sub.substitutePejuangName,
      alasan: sub.alasan || '-',
      status: sub.status,
      disetujuiOleh: sub.approvedBy || '-'
    };
  }).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}

/**
 * Utility untuk menghitung rentang cut-off periode pengajaran
 */
export function calculateCutoffRange(arg1?: any, arg2?: any, arg3?: any) {
  let startDay = 26;
  let endDay = 25;
  let baseDate = new Date();

  if (typeof arg1 === 'number' && typeof arg2 === 'number') {
    startDay = arg1;
    endDay = arg2;
    if (arg3) {
      baseDate = typeof arg3 === 'string' ? new Date(arg3) : arg3;
    }
  } else if (typeof arg1 === 'string') {
    if (arg1.includes('-')) {
      const parts = arg1.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(y) && !isNaN(m)) baseDate = new Date(y, m - 1, 1);
    } else {
      const foundIdx = INDONESIAN_MONTH_NAMES.findIndex(m => arg1.toLowerCase().includes(m.toLowerCase()));
      if (foundIdx >= 0) {
        const yrMatch = arg1.match(/\d{4}/);
        const y = yrMatch ? parseInt(yrMatch[0], 10) : baseDate.getFullYear();
        baseDate = new Date(y, foundIdx, 1);
      }
    }
    if (typeof arg2 === 'number') {
      startDay = arg2;
      endDay = arg2 - 1;
    }
  }

  const y = baseDate.getFullYear();
  const m = baseDate.getMonth(); // 0-indexed

  // Prev month start
  const prevDate = new Date(y, m - 1, startDay);
  const curDate = new Date(y, m, endDay);

  const startIso = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
  const endIso = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, '0')}-${String(curDate.getDate()).padStart(2, '0')}`;

  const dates = getDatesBetween(startIso, endIso);

  return {
    startDate: startIso,
    endDate: endIso,
    dates,
    label: `${startDay} - ${endDay}`,
    codeLabel: `${startDay}_${endDay}`
  };
}

/**
 * Mendapatkan semua tanggal antara startDate dan endDate inclusive (YYYY-MM-DD)
 */
export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);
  while (curr <= end) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

/**
 * Format durasi menit ke format string jam dan menit
 */
export function formatMenitKeJamMenit(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0j 0m';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}j ${mins}m`;
}

export const getNamaHariFromDate = getIndonesianDayName;
export const calculateHaversineDistance = calculateDistanceMeters;
export const getLocalDateStr = (d?: Date) => {
  const date = d || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
export interface SessionEvaluation {
  phase: 'BELUM_MULAI' | 'SEDANG_BERLANGSUNG' | 'SIAP_PULANG' | 'SELESAI' | 'TERLAMBAT' | 'ALPA' | 'BADAL' | 'IZIN' | 'LIBUR';
  label: string;
  badgeColor: string;
  canClockIn: boolean;
  canClockOut: boolean;
  lateMinutes: number;
  reason?: string;
}

export function evaluateSessionStatus(
  schedule: TeachingSchedule,
  dateStr: string,
  currentHHmm: string,
  attendance?: TeachingAttendance,
  substitution?: TeachingSubstitution,
  settings?: TeachingSettings
): SessionEvaluation {
  const toleranceLateMinutes = settings?.toleransiTerlambatMenit ?? settings?.toleranceLateMinutes ?? 10;
  const lockPulangEarlyMinutes = settings?.pulangBukaMenit ?? settings?.lockPulangEarlyMinutes ?? 5;
  const maxLateToleranceMinutes = settings?.maxLateToleranceMinutes ?? 60;
  const masukBukaMenit = settings?.masukBukaMenit ?? 30;

  const nowMin = timeToMinutes(currentHHmm);
  const startMin = timeToMinutes(schedule.jamMulai);
  const endMin = timeToMinutes(schedule.jamSelesai);
  const earliestPulang = endMin - lockPulangEarlyMinutes;
  const earliestMasuk = startMin - masukBukaMenit;

  // 1. Sudah ada record kehadiran
  if (attendance) {
    if (attendance.jamPulang) {
      const isLate = attendance.status === 'Terlambat';
      return {
        phase: 'SELESAI',
        label: isLate ? 'Selesai (Terlambat)' : 'Selesai Mengajar',
        badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        canClockIn: false,
        canClockOut: false,
        lateMinutes: attendance.lateMinutes || 0
      };
    }

    if (attendance.status === 'Izin' || attendance.status === 'Sakit') {
      return {
        phase: 'IZIN',
        label: attendance.status,
        badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        canClockIn: false,
        canClockOut: false,
        lateMinutes: 0
      };
    }

    if (attendance.status === 'Alpa') {
      return {
        phase: 'ALPA',
        label: 'Tidak Hadir (Alpa)',
        badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        canClockIn: false,
        canClockOut: false,
        lateMinutes: 0
      };
    }

    // Sudah absen masuk tapi belum absen pulang
    if (nowMin >= earliestPulang) {
      return {
        phase: 'SIAP_PULANG',
        label: 'Siap Absen Pulang',
        badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        canClockIn: false,
        canClockOut: true,
        lateMinutes: attendance.lateMinutes || 0
      };
    }

    return {
      phase: 'SEDANG_BERLANGSUNG',
      label: attendance.status === 'Terlambat' ? 'Mengajar (Terlambat)' : 'Sedang Mengajar',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      canClockIn: false,
      canClockOut: false,
      lateMinutes: attendance.lateMinutes || 0
    };
  }

  // 2. Belum ada record kehadiran
  // Terlalu awal (belum masuk jendela buka absen masuk)
  if (nowMin < earliestMasuk) {
    return {
      phase: 'BELUM_MULAI',
      label: 'Belum Waktunya',
      badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      canClockIn: false,
      canClockOut: false,
      lateMinutes: 0,
      reason: `Absen masuk dibuka ${masukBukaMenit} menit sebelum jadwal.`
    };
  }

  // Sesi sudah lewat jauh (melebihi toleransi maksimal alpa atau lewat jam selesai + 15 menit)
  const maxLateTime = startMin + maxLateToleranceMinutes;
  if (nowMin > maxLateTime || nowMin > endMin + 15) {
    return {
      phase: 'ALPA',
      label: 'Tidak Hadir (Alpa)',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      canClockIn: false,
      canClockOut: false,
      lateMinutes: 0,
      reason: 'Batas toleransi kehadiran telah berakhir.'
    };
  }

  // Masih dalam jendela absen masuk
  const lateMin = computeLateMinutes(currentHHmm, schedule.jamMulai, toleranceLateMinutes);
  if (lateMin > 0) {
    return {
      phase: 'SEDANG_BERLANGSUNG',
      label: `Terlambat (${lateMin} mnt)`,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      canClockIn: true,
      canClockOut: false,
      lateMinutes: lateMin
    };
  }

  // Tepat waktu / sebelum jam mulai dalam jendela buka
  return {
    phase: nowMin < startMin ? 'BELUM_MULAI' : 'SEDANG_BERLANGSUNG',
    label: nowMin < startMin ? 'Siap Absen Masuk' : 'Sedang Berlangsung',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    canClockIn: true,
    canClockOut: false,
    lateMinutes: 0
  };
}


