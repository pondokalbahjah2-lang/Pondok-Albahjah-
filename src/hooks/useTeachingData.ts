import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import {
  UserAccount,
  TeachingLocation,
  TeachingClass,
  TeachingSchedule,
  TeachingAttendance,
  TeachingSubstitution,
  TeachingSettings,
  HolidayRecord,
  TeachingReportSummary,
  TeachingReportItem
} from '../types';
import {
  computeLateMinutes,
  calculateDistanceMeters,
  timeToMinutes,
  PeriodCutOffInfo,
  computeAttendanceRekap,
  computeDetailSesi,
  getDatesBetween,
  getIndonesianDayName
} from '../utils/teachingUtils';

export const DEFAULT_TEACHING_SETTINGS: TeachingSettings = {
  toleranceLateMinutes: 10,
  lockPulangEarlyMinutes: 5,
  maxLateToleranceMinutes: 60,
  cutOffDay: 26,
  allowedUnits: ['SMAIQu', 'SMPIQu', 'SDIQu', 'Tahfidz', 'Kepondokan']
};

export function useTeachingData(currentUser: UserAccount | null) {
  const [locations, setLocations] = useState<TeachingLocation[]>([]);
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const [schedules, setSchedules] = useState<TeachingSchedule[]>([]);
  const [attendances, setAttendances] = useState<TeachingAttendance[]>([]);
  const [substitutions, setSubstitutions] = useState<TeachingSubstitution[]>([]);
  const [settings, setSettings] = useState<TeachingSettings>(DEFAULT_TEACHING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);

  const isAdmin = currentUser?.role === 'Admin';

  // 1. Sinkronisasi Waktu Server (/api/server-time)
  const syncServerTime = useCallback(async () => {
    try {
      const clientBefore = Date.now();
      const res = await fetch('/api/server-time');
      if (res.ok) {
        const data = await res.json();
        const clientAfter = Date.now();
        const latency = (clientAfter - clientBefore) / 2;
        const accurateServerNow = data.timestamp + latency;
        setServerTimeOffset(accurateServerNow - clientAfter);
      }
    } catch (e) {
      console.warn('Gagal sinkronisasi waktu server, menggunakan waktu lokal HP:', e);
    }
  }, []);

  useEffect(() => {
    syncServerTime();
    const interval = setInterval(syncServerTime, 5 * 60 * 1000); // Sinkronisasi setiap 5 menit
    return () => clearInterval(interval);
  }, [syncServerTime]);

  /**
   * Mendapatkan waktu sekarang yang tersinkronisasi server (WIB)
   */
  const getAccurateNow = useCallback(() => {
    const serverTimestamp = Date.now() + serverTimeOffset;
    const now = new Date(serverTimestamp);

    const wibFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = wibFormatter.formatToParts(now);
    const getPart = (t: string) => parts.find(p => p.type === t)?.value || '';

    const date = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    const time = `${getPart('hour')}:${getPart('minute')}`;
    const timeWithSeconds = `${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;

    return {
      timestamp: serverTimestamp,
      date,
      time,
      timeWithSeconds
    };
  }, [serverTimeOffset]);

  // 2. Realtime listeners
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // A. teachingLocations
    const unsubLocations = onSnapshot(
      collection(db, 'teachingLocations'),
      snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeachingLocation));
        setLocations(items);
      },
      err => console.error('Error fetching teachingLocations:', err)
    );

    // B. teachingClasses
    const unsubClasses = onSnapshot(
      collection(db, 'teachingClasses'),
      snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeachingClass));
        setClasses(items);
      },
      err => console.error('Error fetching teachingClasses:', err)
    );

    // C. teachingSchedules
    const unsubSchedules = onSnapshot(
      collection(db, 'teachingSchedules'),
      snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeachingSchedule));
        setSchedules(items);
      },
      err => console.error('Error fetching teachingSchedules:', err)
    );

    // D. settings/teaching
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'teaching'),
      docSnap => {
        if (docSnap.exists()) {
          setSettings({ ...DEFAULT_TEACHING_SETTINGS, ...docSnap.data() } as TeachingSettings);
        } else {
          setSettings(DEFAULT_TEACHING_SETTINGS);
        }
      },
      err => console.error('Error fetching teaching settings:', err)
    );

    // E. teachingAttendance
    let unsubAttendance: () => void;
    if (isAdmin) {
      unsubAttendance = onSnapshot(
        collection(db, 'teachingAttendance'),
        snap => {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeachingAttendance));
          setAttendances(items);
        },
        err => console.error('Error fetching all teachingAttendance:', err)
      );
    } else {
      // Query untuk pejuang (pejuangId == uid)
      const q = query(
        collection(db, 'teachingAttendance'),
        where('pejuangId', '==', currentUser.id)
      );
      unsubAttendance = onSnapshot(
        q,
        snap => {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeachingAttendance));
          setAttendances(items);
        },
        err => console.error('Error fetching pejuang teachingAttendance:', err)
      );
    }

    // F. teachingSubstitutions
    let unsubSubstitutions: () => void;
    if (isAdmin) {
      unsubSubstitutions = onSnapshot(
        collection(db, 'teachingSubstitutions'),
        snap => {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeachingSubstitution));
          setSubstitutions(items);
        },
        err => console.error('Error fetching all teachingSubstitutions:', err)
      );
    } else {
      // Pejuang query (originalPejuangId == uid)
      const q = query(
        collection(db, 'teachingSubstitutions'),
        where('originalPejuangId', '==', currentUser.id)
      );
      unsubSubstitutions = onSnapshot(
        q,
        snap => {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeachingSubstitution));
          setSubstitutions(items);
        },
        err => console.error('Error fetching pejuang teachingSubstitutions:', err)
      );
    }

    setLoading(false);

    return () => {
      unsubLocations();
      unsubClasses();
      unsubSchedules();
      unsubSettings();
      unsubAttendance();
      unsubSubstitutions();
    };
  }, [currentUser?.id, isAdmin]);

  // 3. Actions: Absen Masuk Mengajar
  const submitAbsenMasuk = async (
    arg1: TeachingSchedule | {
      schedule: TeachingSchedule;
      date?: string;
      lat: number;
      lng: number;
      accuracy: number;
      distanceMeters?: number;
      isWithinRadius?: boolean;
      substitution?: TeachingSubstitution;
      notes?: string;
    },
    coords?: { latitude: number; longitude: number; accuracy: number },
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    const isObjectCall = typeof arg1 === 'object' && 'schedule' in arg1;
    const schedule: TeachingSchedule = isObjectCall ? (arg1 as any).schedule : (arg1 as TeachingSchedule);
    const latitude = isObjectCall ? (arg1 as any).lat : coords?.latitude || 0;
    const longitude = isObjectCall ? (arg1 as any).lng : coords?.longitude || 0;
    const accuracy = isObjectCall ? (arg1 as any).accuracy : coords?.accuracy || 10;
    const userNotes = (isObjectCall ? (arg1 as any).notes : notes) || '';

    const now = getAccurateNow();
    const docDate = (isObjectCall && (arg1 as any).date) || now.date;
    const docId = `${schedule.id}_${docDate}`;

    // Cek apakah sudah pernah absen
    const existingRef = doc(db, 'teachingAttendance', docId);
    const existingSnap = await getDoc(existingRef);
    if (existingSnap.exists()) {
      return { success: false, message: 'Absen masuk untuk sesi ini sudah tercatat.' };
    }

    // Validasi Akurasi GPS
    if (accuracy > 100) {
      return {
        success: false,
        message: `Akurasi GPS perangkat Anda terlalu rendah (±${Math.round(accuracy)}m). Pastikan berada di area terbuka dan GPS aktif.`
      };
    }

    // Validasi Radius Lokasi
    const loc = locations.find(l => l.id === schedule.locationId) || locations.find(l => l.isActive);
    let distance = (isObjectCall && (arg1 as any).distanceMeters) || 0;
    if (loc && !distance && latitude && longitude) {
      distance = calculateDistanceMeters(
        latitude,
        longitude,
        loc.latitude,
        loc.longitude
      );
    }

    // Cek apakah ini badal yang disetujui
    const approvedBadal = (isObjectCall && (arg1 as any).substitution && (arg1 as any).substitution.status === 'Disetujui')
      ? (arg1 as any).substitution
      : substitutions.find(
          s => s.scheduleId === schedule.id && s.date === docDate && s.status === 'Disetujui'
        );
    const isBadal = !!approvedBadal;

    // Verifikasi siapa yang berhak absen
    if (isBadal) {
      if (currentUser.id !== approvedBadal.substitutePejuangId) {
        return {
          success: false,
          message: `Sesi ini telah dibadalkan kepada ${approvedBadal.substitutePejuangName}. Anda tidak berhak absen.`
        };
      }
    } else {
      if (currentUser.id !== schedule.pejuangId) {
        return {
          success: false,
          message: 'Anda bukan pengajar terjadwal pada sesi ini.'
        };
      }
    }

    // Hitung keterlambatan
    const tolerance = settings.toleransiTerlambatMenit ?? settings.toleranceLateMinutes ?? 10;
    const lateMinutes = computeLateMinutes(now.time, schedule.jamMulai, tolerance);
    const status = lateMinutes > 0 ? 'Terlambat' : 'Hadir';

    const newRecord: TeachingAttendance = {
      id: docId,
      scheduleId: schedule.id,
      date: docDate,
      pejuangId: currentUser.id,
      pejuangName: currentUser.name,
      actualPejuangId: currentUser.id,
      actualPejuangName: currentUser.name,
      scheduledPejuangId: schedule.pejuangId,
      scheduledPejuangName: schedule.pejuangName,
      isBadal,
      badalSubstitutionId: approvedBadal?.id,
      unit: schedule.unit,
      classId: schedule.classId,
      className: schedule.className,
      mapel: schedule.mapel || schedule.subject || '',
      subject: schedule.subject || schedule.mapel || '',
      jumlahJP: schedule.jumlahJP,
      actualJP: schedule.jumlahJP,
      jamMasuk: now.time,
      status,
      lateMinutes,
      masukLat: latitude,
      masukLng: longitude,
      masukDistanceMeters: distance,
      notes: userNotes,
      source: 'GPS',
      createdAt: new Date(now.timestamp).toISOString(),
      updatedAt: new Date(now.timestamp).toISOString()
    };

    try {
      await setDoc(doc(db, 'teachingAttendance', docId), newRecord);
      return {
        success: true,
        message: status === 'Terlambat'
          ? `Absen masuk berhasil. Anda tercatat Terlambat (${lateMinutes} menit).`
          : 'Alhamdulillah, absen masuk mengajar tepat waktu berhasil tercatat.'
      };
    } catch (err: any) {
      console.error('Error submitAbsenMasuk:', err);
      return { success: false, message: err.message || 'Gagal menyimpan absensi mengajar.' };
    }
  };

  // 4. Actions: Absen Pulang Mengajar
  const submitAbsenPulang = async (
    arg1: string | {
      attendanceId: string;
      lat: number;
      lng: number;
      accuracy: number;
      distanceMeters?: number;
      isWithinRadius?: boolean;
      notes?: string;
    },
    dateOrCoords?: string | { latitude: number; longitude: number; accuracy: number },
    coords?: { latitude: number; longitude: number; accuracy: number },
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    const isObjectCall = typeof arg1 === 'object' && 'attendanceId' in arg1;
    let docId = '';
    let latitude = 0;
    let longitude = 0;
    let userNotes = '';

    if (isObjectCall) {
      const obj = arg1 as any;
      docId = obj.attendanceId;
      latitude = obj.lat;
      longitude = obj.lng;
      userNotes = obj.notes || '';
    } else {
      const scheduleId = arg1 as string;
      const dateStr = typeof dateOrCoords === 'string' ? dateOrCoords : '';
      docId = `${scheduleId}_${dateStr}`;
      latitude = coords?.latitude || (typeof dateOrCoords === 'object' ? (dateOrCoords as any).latitude : 0);
      longitude = coords?.longitude || (typeof dateOrCoords === 'object' ? (dateOrCoords as any).longitude : 0);
      userNotes = notes || '';
    }

    const existingRef = doc(db, 'teachingAttendance', docId);
    const snap = await getDoc(existingRef);

    if (!snap.exists()) {
      return { success: false, message: 'Data absen masuk tidak ditemukan.' };
    }

    const currentData = snap.data() as TeachingAttendance;
    if (currentData.jamPulang) {
      return { success: false, message: 'Absen pulang sudah tercatat sebelumnya.' };
    }

    const sch = schedules.find(s => s.id === currentData.scheduleId);
    const now = getAccurateNow();

    if (sch) {
      const endMin = timeToMinutes(sch.jamSelesai);
      const nowMin = timeToMinutes(now.time);
      const lockEarly = settings.pulangBukaMenit ?? settings.lockPulangEarlyMinutes ?? 5;
      const earliestPulang = endMin - lockEarly;

      if (nowMin < earliestPulang) {
        return {
          success: false,
          message: `Absen pulang terkunci sampai pukul ${sch.jamSelesai} (toleransi maksimal ${lockEarly} menit sebelum selesai).`
        };
      }
    }

    // Hitung durasi mengajar jika ada jamMasuk
    let durationMinutes = 0;
    if (currentData.jamMasuk) {
      const masukM = timeToMinutes(currentData.jamMasuk);
      const pulangM = timeToMinutes(now.time);
      durationMinutes = Math.max(0, pulangM - masukM);
    }

    // Validasi radius pulang jika lokasi ada
    let distance = (isObjectCall && (arg1 as any).distanceMeters) || 0;
    const loc = sch ? locations.find(l => l.id === sch.locationId) || locations.find(l => l.isActive) : undefined;
    if (loc && !distance && latitude && longitude) {
      distance = calculateDistanceMeters(
        latitude,
        longitude,
        loc.latitude,
        loc.longitude
      );
    }

    const updatePayload: Partial<TeachingAttendance> = {
      jamPulang: now.time,
      pulangLat: latitude,
      pulangLng: longitude,
      pulangDistanceMeters: distance,
      durationMinutes,
      updatedAt: new Date(now.timestamp).toISOString()
    };
    if (userNotes) {
      updatePayload.notes = currentData.notes ? `${currentData.notes} | ${userNotes}` : userNotes;
    }

    try {
      await updateDoc(existingRef, updatePayload);
      return { success: true, message: 'Absen pulang mengajar berhasil dicatat.' };
    } catch (err: any) {
      console.error('Error submitAbsenPulang:', err);
      return { success: false, message: err.message || 'Gagal menyimpan absen pulang.' };
    }
  };

  // 5. Badal Actions
  const createSubstitutionRequest = async (
    schedule: TeachingSchedule,
    date: string,
    substitutePejuang: UserAccount,
    alasan: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    const subId = `sub_${schedule.id}_${date}_${Date.now()}`;
    const now = new Date().toISOString();

    const newSub: TeachingSubstitution = {
      id: subId,
      scheduleId: schedule.id,
      date,
      unit: schedule.unit,
      originalPejuangId: currentUser.id,
      originalPejuangName: currentUser.name,
      substitutePejuangId: substitutePejuang.id,
      substitutePejuangName: substitutePejuang.name,
      mapel: schedule.mapel || schedule.subject || '',
      subject: schedule.subject || schedule.mapel || '',
      className: schedule.className,
      jamMulai: schedule.jamMulai,
      jamSelesai: schedule.jamSelesai,
      jumlahJP: schedule.jumlahJP,
      alasan,
      reason: alasan,
      requestedBy: currentUser.name,
      status: 'Menunggu Persetujuan',
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'teachingSubstitutions', subId), newSub);
      return { success: true, message: 'Permohonan badal mengajar berhasil diajukan ke Admin.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal mengajukan badal.' };
    }
  };

  const requestSubstitution = async (
    arg1: TeachingSchedule | {
      schedule: TeachingSchedule;
      date: string;
      substituteTeacher?: UserAccount;
      substitutePejuang?: UserAccount;
      reason?: string;
      alasan?: string;
      requestedBy?: string;
    },
    dateArg?: string,
    substituteArg?: UserAccount,
    alasanArg?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    const isObject = typeof arg1 === 'object' && 'schedule' in arg1;
    const schedule: TeachingSchedule = isObject ? (arg1 as any).schedule : (arg1 as TeachingSchedule);
    const date: string = isObject ? (arg1 as any).date : (dateArg || '');
    const substituteTeacher: UserAccount | undefined = isObject
      ? ((arg1 as any).substituteTeacher || (arg1 as any).substitutePejuang)
      : substituteArg;
    const reasonText: string = (isObject ? ((arg1 as any).reason || (arg1 as any).alasan) : alasanArg) || '';
    const requestedByText: string = (isObject ? (arg1 as any).requestedBy : undefined) || currentUser.name;

    if (!substituteTeacher) {
      return { success: false, message: 'Pengajar pengganti belum ditentukan.' };
    }

    const subId = `sub_${schedule.id}_${date}_${Date.now()}`;
    const now = new Date().toISOString();

    const newSub: TeachingSubstitution = {
      id: subId,
      scheduleId: schedule.id,
      date,
      unit: schedule.unit,
      originalPejuangId: currentUser.id,
      originalPejuangName: currentUser.name,
      substitutePejuangId: substituteTeacher.id,
      substitutePejuangName: substituteTeacher.name,
      mapel: schedule.mapel || schedule.subject || '',
      subject: schedule.subject || schedule.mapel || '',
      className: schedule.className,
      jamMulai: schedule.jamMulai,
      jamSelesai: schedule.jamSelesai,
      jumlahJP: schedule.jumlahJP,
      alasan: reasonText,
      reason: reasonText,
      requestedBy: requestedByText,
      status: 'Menunggu Persetujuan',
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'teachingSubstitutions', subId), newSub);
      return { success: true, message: 'Permohonan badal mengajar berhasil diajukan ke Admin.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal mengajukan badal.' };
    }
  };

  const cancelSubstitution = async (subId: string) => {
    await updateDoc(doc(db, 'teachingSubstitutions', subId), {
      status: 'Dibatalkan',
      updatedAt: new Date().toISOString()
    });
  };

  const approveSubstitution = async (subId: string, approverName: string) => {
    await updateDoc(doc(db, 'teachingSubstitutions', subId), {
      status: 'Disetujui',
      approvedBy: approverName,
      decidedBy: approverName,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const rejectSubstitution = async (subId: string, reason: string) => {
    await updateDoc(doc(db, 'teachingSubstitutions', subId), {
      status: 'Ditolak',
      decidedBy: 'Admin',
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    });
  };

  const respondSubstitution = async (subId: string, status: 'Disetujui' | 'Ditolak', reasonOrApprover?: string) => {
    if (status === 'Disetujui') {
      await approveSubstitution(subId, reasonOrApprover || currentUser?.name || 'Admin');
    } else {
      await rejectSubstitution(subId, reasonOrApprover || 'Ditolak oleh Admin');
    }
  };

  // 6. Admin Management Helpers
  const saveLocation = async (loc: TeachingLocation) => {
    await setDoc(doc(db, 'teachingLocations', loc.id), loc);
  };
  const deleteLocation = async (id: string) => {
    await deleteDoc(doc(db, 'teachingLocations', id));
  };

  const saveClass = async (cls: TeachingClass) => {
    await setDoc(doc(db, 'teachingClasses', cls.id), cls);
  };
  const deleteClass = async (id: string) => {
    await deleteDoc(doc(db, 'teachingClasses', id));
  };

  const saveSchedule = async (sch: TeachingSchedule) => {
    await setDoc(doc(db, 'teachingSchedules', sch.id), sch);
  };
  const deleteSchedule = async (id: string, _info?: string) => {
    await deleteDoc(doc(db, 'teachingSchedules', id));
  };

  const saveSettings = async (newSettings: TeachingSettings) => {
    await setDoc(doc(db, 'settings', 'teaching'), newSettings);
  };

  const saveTeachingSettings = async (newSettings: Partial<TeachingSettings>) => {
    await setDoc(doc(db, 'settings', 'teaching'), { ...settings, ...newSettings }, { merge: true });
  };

  const correctAttendance = async (att: TeachingAttendance) => {
    await setDoc(doc(db, 'teachingAttendance', att.id), {
      ...att,
      updatedAt: new Date().toISOString()
    });
  };

  const koreksiAbsensi = async (att: TeachingAttendance) => {
    await correctAttendance(att);
  };

  const deleteTeachingAttendance = async (id: string, _info?: string) => {
    await deleteDoc(doc(db, 'teachingAttendance', id));
  };

  return {
    locations,
    classes,
    schedules,
    attendances,
    substitutions,
    settings,
    teachingSettings: {
      ...settings,
      cutoffStartDay: settings.cutoffStartDay ?? settings.cutOffDay ?? 26,
      cutoffEndDay: settings.cutoffEndDay ?? (settings.cutOffDay ? settings.cutOffDay - 1 : 25),
      masukBukaMenit: settings.masukBukaMenit ?? 15,
      pulangBukaMenit: settings.pulangBukaMenit ?? settings.lockPulangEarlyMinutes ?? 5,
      toleransiTerlambatMenit: settings.toleransiTerlambatMenit ?? settings.toleranceLateMinutes ?? 10
    },
    isLoading: loading,
    loading,
    getWIBDate: () => {
      const now = new Date(Date.now() + serverTimeOffset);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },
    getCurrentDateStr: () => getAccurateNow().date,
    getCurrentTimeHHmm: () => getAccurateNow().time,
    generateTeachingReport: (opts: {
      startDate: string;
      endDate: string;
      unit?: string;
      pejuangId?: string;
      accounts?: UserAccount[];
    }): TeachingReportSummary => {
      const dates = getDatesBetween(opts.startDate, opts.endDate);
      const periodInfo: PeriodCutOffInfo = {
        periodeLabel: `${opts.startDate} - ${opts.endDate}`,
        codeLabel: `${opts.startDate}_${opts.endDate}`,
        formattedRange: `${opts.startDate} s/d ${opts.endDate}`,
        dates,
        prevMonthName: '',
        prevMonthDates: [],
        currMonthName: '',
        currMonthDates: dates,
        year: new Date(opts.startDate).getFullYear(),
        monthNumber: new Date(opts.startDate).getMonth() + 1
      };

      const holidays: HolidayRecord[] = [];
      const unitFilter = (opts.unit && opts.unit !== 'Semua') ? opts.unit : 'Semua Unit';
      const userAccounts = opts.accounts || [];

      // 1. Rekap Kehadiran
      const attendanceRekap = computeAttendanceRekap(
        unitFilter,
        periodInfo,
        schedules,
        attendances,
        substitutions,
        holidays,
        userAccounts
      );

      // 2. Detail Sesi
      const detailSesi = computeDetailSesi(
        unitFilter,
        periodInfo,
        schedules,
        attendances,
        substitutions,
        holidays,
        locations
      );

      const detailRecords = detailSesi.map(d => {
        const sch = schedules.find(s => s.className === d.kelas && (s.mapel === d.mapel || s.subject === d.mapel));
        const att = attendances.find(a => a.date === d.tanggal && a.className === d.kelas && (a.mapel === d.mapel || a.subject === d.mapel));
        const sub = substitutions.find(s => s.date === d.tanggal && s.className === d.kelas && (s.mapel === d.mapel || s.subject === d.mapel) && s.status === 'Disetujui');

        return {
          ...d,
          date: d.tanggal,
          unit: d.unit,
          className: d.kelas,
          subject: d.mapel,
          pejuangId: sch?.pejuangId || '',
          pejuangName: d.pengajarAsli,
          actualPejuangId: sub ? sub.substitutePejuangId : (sch?.pejuangId || ''),
          actualPejuangName: d.pengajar,
          jamMasuk: d.jamMasuk !== '-' ? d.jamMasuk : '',
          jamPulang: d.jamPulang !== '-' ? d.jamPulang : '',
          jumlahJP: d.jp,
          actualJP: d.jp,
          status: d.status,
          isBadal: d.badal === 'Ya',
          source: att?.source || 'GPS'
        };
      });

      // 3. Map ke TeachingReportItem
      let teacherSummaries: TeachingReportItem[] = attendanceRekap.map(item => {
        const acc = userAccounts.find(a => a.id === item.pejuangId);

        // Hitung rincian JP
        let totalJPTerjadwal = 0;
        let totalJPHadir = 0;
        let totalJPTerlambat = 0;
        let totalJPBadal = 0;

        for (const d of dates) {
          const dayName = getIndonesianDayName(d);
          const dayScheds = schedules.filter(
            s => s.isActive && s.hari === dayName && (unitFilter === 'Semua Unit' || s.unit === unitFilter)
          );

          for (const sch of dayScheds) {
            const approvedBadal = substitutions.find(
              sub => sub.scheduleId === sch.id && sub.date === d && sub.status === 'Disetujui'
            );
            const isOriginal = sch.pejuangId === item.pejuangId;
            const isSubstitute = approvedBadal?.substitutePejuangId === item.pejuangId;

            if (isOriginal && !approvedBadal) {
              totalJPTerjadwal += sch.jumlahJP;
              const att = attendances.find(a => a.scheduleId === sch.id && a.date === d);
              if (att && (att.status === 'Hadir' || att.status === 'Lupa Absen Pulang')) {
                totalJPHadir += att.jumlahJP ?? sch.jumlahJP;
              } else if (att && att.status === 'Terlambat') {
                totalJPTerlambat += att.jumlahJP ?? sch.jumlahJP;
              }
            } else if (isOriginal && approvedBadal) {
              totalJPTerjadwal += sch.jumlahJP;
            } else if (isSubstitute) {
              const att = attendances.find(a => a.scheduleId === sch.id && a.date === d);
              if (att && (att.status === 'Hadir' || att.status === 'Terlambat' || att.status === 'Lupa Absen Pulang')) {
                totalJPBadal += att.jumlahJP ?? sch.jumlahJP;
              }
            }
          }
        }
        const totalJPNetto = totalJPHadir + totalJPTerlambat + totalJPBadal;

        return {
          pejuangId: item.pejuangId,
          pejuangName: item.pejuangName,
          nipy: acc?.nipy || '-',
          unit: acc?.subDivisi || item.unit || '-',
          namaBank: acc?.bankName || '-',
          noRekening: acc?.nomorRekening || '-',
          totalScheduledSessions: item.totalSesiTerjadwal,
          totalPresentSessions: item.hadir,
          totalLateSessions: item.terlambat,
          totalAbsentSessions: item.alpa,
          totalPermitSessions: item.izinSakit,
          totalLateMinutes: item.totalMenitTerlambat,
          totalTeachingMinutes: Math.round(item.totalJamMengajar * 60),
          totalJP: totalJPNetto,
          substitutionsGiven: item.badalDiberikan,
          substitutionsReceived: item.badalDiterima,
          attendanceRate: item.persenKehadiran,
          totalSesiTerjadwal: item.totalSesiTerjadwal,
          totalJPTerjadwal,
          totalJPHadir,
          totalJPTerlambat,
          totalJPBadal,
          totalJPNetto
        };
      });

      if (opts.pejuangId && opts.pejuangId !== 'Semua') {
        teacherSummaries = teacherSummaries.filter(t => t.pejuangId === opts.pejuangId);
      }

      return {
        startDate: opts.startDate,
        endDate: opts.endDate,
        dates,
        unit: opts.unit || 'Semua',
        teacherSummaries,
        detailRecords,
        totalSessions: teacherSummaries.reduce((sum, t) => sum + (t.totalSesiTerjadwal || 0), 0),
        totalJP: teacherSummaries.reduce((sum, t) => sum + (t.totalJPNetto || 0), 0),
        totalLateMinutes: teacherSummaries.reduce((sum, t) => sum + (t.totalLateMinutes || 0), 0),
        totalSesiTerjadwal: teacherSummaries.reduce((sum, t) => sum + (t.totalSesiTerjadwal || 0), 0),
        totalJPTerjadwal: teacherSummaries.reduce((sum, t) => sum + (t.totalJPTerjadwal || 0), 0),
        totalJPHadir: teacherSummaries.reduce((sum, t) => sum + (t.totalJPHadir || 0), 0),
        totalJPTerlambat: teacherSummaries.reduce((sum, t) => sum + (t.totalJPTerlambat || 0), 0),
        totalJPBadal: teacherSummaries.reduce((sum, t) => sum + (t.totalJPBadal || 0), 0),
        totalJPNetto: teacherSummaries.reduce((sum, t) => sum + (t.totalJPNetto || 0), 0)
      };
    },
    getAccurateNow,
    submitAbsenMasuk,
    submitAbsenPulang,
    createSubstitutionRequest,
    requestSubstitution,
    cancelSubstitution,
    approveSubstitution,
    rejectSubstitution,
    respondSubstitution,
    saveLocation,
    deleteLocation,
    saveClass,
    deleteClass,
    saveSchedule,
    deleteSchedule,
    saveSettings,
    saveTeachingSettings,
    correctAttendance,
    koreksiAbsensi,
    deleteTeachingAttendance
  };
}
