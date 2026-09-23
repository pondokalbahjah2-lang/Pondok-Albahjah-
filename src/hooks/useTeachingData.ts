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
  HolidayRecord
} from '../types';
import {
  computeLateMinutes,
  calculateDistanceMeters,
  timeToMinutes
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
    schedule: TeachingSchedule,
    coords: { latitude: number; longitude: number; accuracy: number },
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    const now = getAccurateNow();
    const docId = `${schedule.id}_${now.date}`;

    // Cek apakah sudah pernah absen
    const existingRef = doc(db, 'teachingAttendance', docId);
    const existingSnap = await getDoc(existingRef);
    if (existingSnap.exists()) {
      return { success: false, message: 'Absen masuk untuk sesi ini sudah tercatat.' };
    }

    // Validasi Akurasi GPS
    if (coords.accuracy > 100) {
      return {
        success: false,
        message: `Akurasi GPS perangkat Anda terlalu rendah (±${Math.round(coords.accuracy)}m). Pastikan berada di area terbuka dan GPS aktif.`
      };
    }

    // Validasi Radius Lokasi
    const loc = locations.find(l => l.id === schedule.locationId) || locations.find(l => l.isActive);
    let distance = 0;
    if (loc) {
      distance = calculateDistanceMeters(
        coords.latitude,
        coords.longitude,
        loc.latitude,
        loc.longitude
      );
      if (distance > loc.radiusMeter) {
        return {
          success: false,
          message: `Di luar radius lokasi mengajar (${loc.nama}). Jarak Anda: ${distance} meter (Maksimal: ${loc.radiusMeter}m).`
        };
      }
    }

    // Cek apakah ini badal yang disetujui
    const approvedBadal = substitutions.find(
      s => s.scheduleId === schedule.id && s.date === now.date && s.status === 'Disetujui'
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
    const lateMinutes = computeLateMinutes(now.time, schedule.jamMulai, settings.toleranceLateMinutes);
    const status = lateMinutes > 0 ? 'Terlambat' : 'Hadir';

    const newRecord: TeachingAttendance = {
      id: docId,
      scheduleId: schedule.id,
      date: now.date,
      pejuangId: currentUser.id,
      pejuangName: currentUser.name,
      scheduledPejuangId: schedule.pejuangId,
      scheduledPejuangName: schedule.pejuangName,
      isBadal,
      badalSubstitutionId: approvedBadal?.id,
      unit: schedule.unit,
      classId: schedule.classId,
      className: schedule.className,
      mapel: schedule.mapel,
      jumlahJP: schedule.jumlahJP,
      jamMasuk: now.time,
      status,
      lateMinutes,
      masukLat: coords.latitude,
      masukLng: coords.longitude,
      masukDistanceMeters: distance,
      notes: notes || '',
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
    scheduleId: string,
    date: string,
    coords: { latitude: number; longitude: number; accuracy: number },
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    const docId = `${scheduleId}_${date}`;
    const existingRef = doc(db, 'teachingAttendance', docId);
    const snap = await getDoc(existingRef);

    if (!snap.exists()) {
      return { success: false, message: 'Data absen masuk tidak ditemukan.' };
    }

    const currentData = snap.data() as TeachingAttendance;
    if (currentData.jamPulang) {
      return { success: false, message: 'Absen pulang sudah tercatat sebelumnya.' };
    }

    const sch = schedules.find(s => s.id === scheduleId);
    const now = getAccurateNow();

    if (sch) {
      const endMin = timeToMinutes(sch.jamSelesai);
      const nowMin = timeToMinutes(now.time);
      const earliestPulang = endMin - settings.lockPulangEarlyMinutes;

      if (nowMin < earliestPulang) {
        return {
          success: false,
          message: `Absen pulang terkunci sampai pukul ${sch.jamSelesai} (toleransi maksimal ${settings.lockPulangEarlyMinutes} menit sebelum selesai).`
        };
      }
    }

    // Validasi radius pulang jika lokasi ada
    let distance = 0;
    const loc = sch ? locations.find(l => l.id === sch.locationId) || locations.find(l => l.isActive) : undefined;
    if (loc && coords) {
      distance = calculateDistanceMeters(
        coords.latitude,
        coords.longitude,
        loc.latitude,
        loc.longitude
      );
    }

    const updatePayload: Partial<TeachingAttendance> = {
      jamPulang: now.time,
      pulangLat: coords.latitude,
      pulangLng: coords.longitude,
      pulangDistanceMeters: distance,
      updatedAt: new Date(now.timestamp).toISOString()
    };
    if (notes) {
      updatePayload.notes = currentData.notes ? `${currentData.notes} | ${notes}` : notes;
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
      mapel: schedule.mapel,
      className: schedule.className,
      jamMulai: schedule.jamMulai,
      jamSelesai: schedule.jamSelesai,
      jumlahJP: schedule.jumlahJP,
      alasan,
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
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const rejectSubstitution = async (subId: string, reason: string) => {
    await updateDoc(doc(db, 'teachingSubstitutions', subId), {
      status: 'Ditolak',
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    });
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
  const deleteSchedule = async (id: string) => {
    await deleteDoc(doc(db, 'teachingSchedules', id));
  };

  const saveSettings = async (newSettings: TeachingSettings) => {
    await setDoc(doc(db, 'settings', 'teaching'), newSettings);
  };

  const correctAttendance = async (att: TeachingAttendance) => {
    await setDoc(doc(db, 'teachingAttendance', att.id), {
      ...att,
      updatedAt: new Date().toISOString()
    });
  };

  return {
    locations,
    classes,
    schedules,
    attendances,
    substitutions,
    settings,
    loading,
    getAccurateNow,
    submitAbsenMasuk,
    submitAbsenPulang,
    createSubstitutionRequest,
    cancelSubstitution,
    approveSubstitution,
    rejectSubstitution,
    saveLocation,
    deleteLocation,
    saveClass,
    deleteClass,
    saveSchedule,
    deleteSchedule,
    saveSettings,
    correctAttendance
  };
}
