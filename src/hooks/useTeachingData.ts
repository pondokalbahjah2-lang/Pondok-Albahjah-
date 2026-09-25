import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  limit,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../utils/firebase';
import {
  UserAccount,
  TeachingLocation,
  TeachingClass,
  TeachingSchedule,
  TeachingSettings,
  TeachingAttendance,
  TeachingSubstitution,
  TeachingSubstitutionStatus,
  TeachingReportSummary,
} from '../types';
import {
  DEFAULT_TEACHING_SETTINGS,
  getNamaHariFromDate,
  parseHHmmToMinutes,
  generateTeachingReport as generateTeachingReportHelper,
} from '../utils/teachingUtils';

export function useTeachingData(currentUser: UserAccount | null) {
  const [locations, setLocations] = useState<TeachingLocation[]>([]);
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const [schedules, setSchedules] = useState<TeachingSchedule[]>([]);
  const [attendances, setAttendances] = useState<TeachingAttendance[]>([]);
  const [substitutions, setSubstitutions] = useState<TeachingSubstitution[]>([]);
  const [teachingSettings, setTeachingSettings] = useState<TeachingSettings>(DEFAULT_TEACHING_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState<number>(0);

  const isAdmin = currentUser?.role === 'Admin';
  const uid = currentUser?.id;

  // Sync server time offset
  const syncServerTime = useCallback(async () => {
    try {
      const start = Date.now();
      const res = await fetch('/api/server-time');
      if (res.ok) {
        const data = await res.json();
        const end = Date.now();
        const latency = (end - start) / 2;
        const actualServerEpoch = data.serverEpoch + latency;
        const offset = actualServerEpoch - end;
        setServerTimeOffsetMs(offset);
      }
    } catch (e) {
      console.warn('Failed to sync server time, using local clock:', e);
    }
  }, []);

  useEffect(() => {
    syncServerTime();
    const interval = setInterval(syncServerTime, 5 * 60 * 1000); // sync every 5 min
    return () => clearInterval(interval);
  }, [syncServerTime]);

  /**
   * Helper to get current Date object adjusted by server offset (WIB)
   */
  const getWIBDate = useCallback(() => {
    const adjustedEpoch = Date.now() + serverTimeOffsetMs;
    // Format to Asia/Jakarta
    const d = new Date(adjustedEpoch);
    const wibStr = d.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
    return new Date(wibStr);
  }, [serverTimeOffsetMs]);

  const getCurrentDateStr = useCallback(() => {
    const d = getWIBDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, [getWIBDate]);

  const getCurrentTimeHHmm = useCallback(() => {
    const d = getWIBDate();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }, [getWIBDate]);

  // Sync Firestore Collections
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    // 1. Settings / Teaching
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'teaching'),
      (snap) => {
        if (snap.exists()) {
          setTeachingSettings({ ...DEFAULT_TEACHING_SETTINGS, ...(snap.data() as TeachingSettings) });
        } else {
          setTeachingSettings(DEFAULT_TEACHING_SETTINGS);
        }
      },
      (err) => console.warn('Sync teaching settings error:', err)
    );

    // 2. Locations
    const unsubLocations = onSnapshot(
      collection(db, 'teachingLocations'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeachingLocation));
        setLocations(list.sort((a, b) => a.name.localeCompare(b.name)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'teachingLocations')
    );

    // 3. Classes
    const unsubClasses = onSnapshot(
      collection(db, 'teachingClasses'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeachingClass));
        setClasses(list.sort((a, b) => a.name.localeCompare(b.name)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'teachingClasses')
    );

    // 4. Schedules
    const schedQ = isAdmin
      ? collection(db, 'teachingSchedules')
      : query(collection(db, 'teachingSchedules'), where('isActive', '==', true));

    const unsubSchedules = onSnapshot(
      schedQ,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeachingSchedule));
        setSchedules(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'teachingSchedules')
    );

    // 5. Substitutions (Badal)
    const subsQ = isAdmin
      ? query(collection(db, 'teachingSubstitutions'), limit(2000))
      : query(collection(db, 'teachingSubstitutions'), limit(1000));

    const unsubSubs = onSnapshot(
      subsQ,
      (snap) => {
        let list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeachingSubstitution));
        if (!isAdmin && uid) {
          list = list.filter(
            (s) => s.originalPejuangId === uid || s.substitutePejuangId === uid || s.requestedById === uid
          );
        }
        setSubstitutions(list.sort((a, b) => b.date.localeCompare(a.date)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'teachingSubstitutions')
    );

    // 6. Attendance
    const attQ = isAdmin
      ? query(collection(db, 'teachingAttendance'), limit(10000))
      : query(collection(db, 'teachingAttendance'), limit(3000));

    const unsubAtt = onSnapshot(
      attQ,
      (snap) => {
        let list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeachingAttendance));
        if (!isAdmin && uid) {
          list = list.filter((a) => a.pejuangId === uid || a.scheduledPejuangId === uid);
        }
        setAttendances(list);
        setIsLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'teachingAttendance');
        setIsLoading(false);
      }
    );

    return () => {
      unsubSettings();
      unsubLocations();
      unsubClasses();
      unsubSchedules();
      unsubSubs();
      unsubAtt();
    };
  }, [currentUser, isAdmin, uid]);

  // Helper to log audit
  const logAuditAction = async (action: string, details: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(collection(db, 'auditLogs'));
      await setDoc(docRef, {
        id: docRef.id,
        userId: currentUser.id,
        userName: currentUser.name,
        action,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Failed to log audit for teaching:', e);
    }
  };

  // ---------------- OPERATIONS ---------------- //

  // Save / update Location
  const saveLocation = async (loc: TeachingLocation) => {
    try {
      const id = loc.id || doc(collection(db, 'teachingLocations')).id;
      const dataToSave: TeachingLocation = {
        ...loc,
        id,
        radiusMeters: Number(loc.radiusMeters) || 100,
        maxAccuracyMeters: Number(loc.maxAccuracyMeters) || 50,
      };
      await setDoc(doc(db, 'teachingLocations', id), dataToSave, { merge: true });
      await logAuditAction(
        loc.id ? 'UPDATE_TEACHING_LOCATION' : 'CREATE_TEACHING_LOCATION',
        `Menyimpan lokasi mengajar ${loc.name}`
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'teachingLocations');
      throw e;
    }
  };

  const deleteLocation = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'teachingLocations', id));
      await logAuditAction('DELETE_TEACHING_LOCATION', `Menghapus lokasi mengajar ${name}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'teachingLocations');
      throw e;
    }
  };

  // Save / update Class
  const saveClass = async (cls: TeachingClass) => {
    try {
      const id = cls.id || doc(collection(db, 'teachingClasses')).id;
      const dataToSave: TeachingClass = { ...cls, id };
      await setDoc(doc(db, 'teachingClasses', id), dataToSave, { merge: true });
      await logAuditAction(
        cls.id ? 'UPDATE_TEACHING_CLASS' : 'CREATE_TEACHING_CLASS',
        `Menyimpan kelas mengajar ${cls.name} (${cls.unit})`
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'teachingClasses');
      throw e;
    }
  };

  const deleteClass = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'teachingClasses', id));
      await logAuditAction('DELETE_TEACHING_CLASS', `Menghapus kelas mengajar ${name}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'teachingClasses');
      throw e;
    }
  };

  // Save / update Schedule
  const saveSchedule = async (sched: TeachingSchedule) => {
    try {
      const id = sched.id || doc(collection(db, 'teachingSchedules')).id;
      const dataToSave: TeachingSchedule = {
        ...sched,
        id,
        jumlahJP: Number(sched.jumlahJP) || 1,
        createdAt: sched.createdAt || new Date().toISOString(),
      };
      await setDoc(doc(db, 'teachingSchedules', id), dataToSave, { merge: true });
      await logAuditAction(
        sched.id ? 'UPDATE_TEACHING_SCHEDULE' : 'CREATE_TEACHING_SCHEDULE',
        `Menyimpan jadwal mengajar ${sched.pejuangName} - ${sched.className} - ${sched.subject} (${sched.hari.join(', ')})`
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'teachingSchedules');
      throw e;
    }
  };

  const deleteSchedule = async (id: string, info: string) => {
    try {
      await deleteDoc(doc(db, 'teachingSchedules', id));
      await logAuditAction('DELETE_TEACHING_SCHEDULE', `Menghapus jadwal mengajar: ${info}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'teachingSchedules');
      throw e;
    }
  };

  // Save Settings
  const saveTeachingSettings = async (settings: Partial<TeachingSettings>) => {
    try {
      await setDoc(doc(db, 'settings', 'teaching'), settings, { merge: true });
      await logAuditAction('UPDATE_TEACHING_SETTINGS', 'Memperbarui pengaturan absensi mengajar');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/teaching');
      throw e;
    }
  };

  // Clock In (Absen Masuk)
  const submitAbsenMasuk = async (params: {
    schedule: TeachingSchedule;
    date: string;
    actualTeacher: UserAccount;
    isBadal: boolean;
    substitutionId?: string;
    lat: number;
    lng: number;
    accuracy: number;
    distanceMeters: number;
    isWithinRadius: boolean;
    notes?: string;
  }) => {
    const {
      schedule,
      date,
      actualTeacher,
      isBadal,
      substitutionId,
      lat,
      lng,
      accuracy,
      distanceMeters,
      isWithinRadius,
      notes,
    } = params;

    const docId = `${schedule.id}_${date}`;
    const hari = getNamaHariFromDate(date);
    const jamMasuk = getCurrentTimeHHmm();

    // Calculate late minutes
    const toleransi = schedule.tolerance?.toleransiTerlambatMenit ?? teachingSettings.toleransiTerlambatMenit ?? 5;
    const curMin = parseHHmmToMinutes(jamMasuk);
    const startMin = parseHHmmToMinutes(schedule.jamMulai);
    const lateMinutes = Math.max(0, curMin - (startMin + toleransi));
    const status = lateMinutes > 0 ? 'Terlambat' : 'Hadir';

    const record: TeachingAttendance = {
      id: docId,
      scheduleId: schedule.id,
      date,
      hari,
      pejuangId: actualTeacher.id,
      pejuangName: actualTeacher.name,
      scheduledPejuangId: schedule.pejuangId,
      scheduledPejuangName: schedule.pejuangName,
      isBadal,
      substitutionId: substitutionId || undefined,
      unit: schedule.unit,
      classId: schedule.classId,
      className: schedule.className,
      subject: schedule.subject,
      jumlahJP: schedule.jumlahJP,
      locationId: schedule.locationId,
      locationName: schedule.locationName,
      jadwalMulai: schedule.jamMulai,
      jadwalSelesai: schedule.jamSelesai,
      jamMasuk,
      status,
      lateMinutes,
      durationMinutes: 0,
      source: 'GPS',
      notes: notes || undefined,
      masuk: {
        lat,
        lng,
        accuracy,
        distanceMeters,
        isWithinRadius,
      },
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'teachingAttendance', docId), record);
      await logAuditAction(
        'TEACHING_ABSEN_MASUK',
        `Absen Masuk Mengajar: ${actualTeacher.name} di ${schedule.className} (${schedule.subject}) status ${status}`
      );
      return record;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'teachingAttendance');
      throw e;
    }
  };

  // Clock Out (Absen Pulang)
  const submitAbsenPulang = async (params: {
    attendanceId: string;
    lat: number;
    lng: number;
    accuracy: number;
    distanceMeters: number;
    isWithinRadius: boolean;
    notes?: string;
  }) => {
    const { attendanceId, lat, lng, accuracy, distanceMeters, isWithinRadius, notes } = params;
    const jamPulang = getCurrentTimeHHmm();

    const existing = attendances.find((a) => a.id === attendanceId);
    if (!existing) throw new Error('Data absensi tidak ditemukan');

    const curMin = parseHHmmToMinutes(jamPulang);
    const scheduleEndMin = parseHHmmToMinutes(existing.jadwalSelesai);
    const schedule = schedules.find((s) => s.id === existing.scheduleId);
    const pulangBukaMenit = schedule?.tolerance?.pulangBukaMenit ?? teachingSettings.pulangBukaMenit ?? 10;
    const isEarly = curMin < scheduleEndMin - pulangBukaMenit;

    const inMin = parseHHmmToMinutes(existing.jamMasuk || existing.jadwalMulai);
    const durationMinutes = Math.max(0, curMin - inMin);

    const updateData: Partial<TeachingAttendance> = {
      jamPulang,
      durationMinutes,
      pulangFlag: isEarly ? 'Pulang Cepat' : 'Normal',
      pulang: {
        lat,
        lng,
        accuracy,
        distanceMeters,
        isWithinRadius,
      },
    };
    if (notes) updateData.notes = existing.notes ? `${existing.notes} | ${notes}` : notes;

    try {
      await setDoc(doc(db, 'teachingAttendance', attendanceId), updateData, { merge: true });
      await logAuditAction(
        'TEACHING_ABSEN_PULANG',
        `Absen Pulang Mengajar: ${existing.pejuangName} (${existing.subject} - ${existing.className}) pukul ${jamPulang}`
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'teachingAttendance');
      throw e;
    }
  };

  // Admin Koreksi Absensi
  const koreksiAbsensi = async (attendance: TeachingAttendance) => {
    try {
      const dataToSave: TeachingAttendance = {
        ...attendance,
        source: 'Koreksi Admin',
        editedBy: currentUser?.name || 'Admin',
      };
      await setDoc(doc(db, 'teachingAttendance', attendance.id), dataToSave, { merge: true });
      await logAuditAction(
        'KOREKSI_TEACHING_ATTENDANCE',
        `Koreksi absensi mengajar ${attendance.pejuangName} tanggal ${attendance.date} (${attendance.subject}) status: ${attendance.status}`
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'teachingAttendance');
      throw e;
    }
  };

  const deleteTeachingAttendance = async (attendanceId: string, details: string) => {
    try {
      await deleteDoc(doc(db, 'teachingAttendance', attendanceId));
      await logAuditAction('DELETE_TEACHING_ATTENDANCE', `Menghapus presensi mengajar: ${details}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'teachingAttendance');
      throw e;
    }
  };

  // Request Badal (Substitution)
  const requestSubstitution = async (params: {
    schedule: TeachingSchedule;
    date: string;
    substituteTeacher: UserAccount;
    reason: string;
    requestedBy: 'Admin' | 'Pejuang';
  }) => {
    const { schedule, date, substituteTeacher, reason, requestedBy } = params;
    const docId = `${schedule.id}_${date}`;

    const subData: TeachingSubstitution = {
      id: docId,
      scheduleId: schedule.id,
      date,
      originalPejuangId: schedule.pejuangId,
      originalPejuangName: schedule.pejuangName,
      substitutePejuangId: substituteTeacher.id,
      substitutePejuangName: substituteTeacher.name,
      unit: schedule.unit,
      classId: schedule.classId,
      className: schedule.className,
      subject: schedule.subject,
      jumlahJP: schedule.jumlahJP,
      jamMulai: schedule.jamMulai,
      jamSelesai: schedule.jamSelesai,
      reason,
      requestedBy,
      requestedById: currentUser?.id || '',
      status: requestedBy === 'Admin' ? 'Disetujui' : 'Menunggu Persetujuan',
      decidedBy: requestedBy === 'Admin' ? currentUser?.name : undefined,
      decidedAt: requestedBy === 'Admin' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'teachingSubstitutions', docId), subData);
      await logAuditAction(
        'REQUEST_TEACHING_SUBSTITUTION',
        `Pengajuan badal: ${schedule.pejuangName} digantikan ${substituteTeacher.name} untuk mapel ${schedule.subject} kelas ${schedule.className} tanggal ${date}`
      );

      // Create in-app notification for substitute
      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        id: notifRef.id,
        userId: substituteTeacher.id,
        title: 'Tawaran Badal Mengajar',
        message: `${schedule.pejuangName} mengajukan Anda sebagai badal untuk ${schedule.subject} (${schedule.className}) pada ${date}.`,
        timestamp: new Date().toISOString(),
        read: false,
      });

      return subData;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'teachingSubstitutions');
      throw e;
    }
  };

  // Admin / Approver respond to Badal
  const respondSubstitution = async (
    subId: string,
    status: TeachingSubstitutionStatus,
    adminNote?: string
  ) => {
    try {
      const updateData: Partial<TeachingSubstitution> = {
        status,
        decidedBy: currentUser?.name || 'Admin',
        decidedAt: new Date().toISOString(),
      };
      if (adminNote) updateData.adminNote = adminNote;

      await setDoc(doc(db, 'teachingSubstitutions', subId), updateData, { merge: true });

      const sub = substitutions.find((s) => s.id === subId);
      await logAuditAction(
        'RESPOND_TEACHING_SUBSTITUTION',
        `Badal ${subId} diubah menjadi ${status} oleh ${currentUser?.name}. Catatan: ${adminNote || '-'}`
      );

      // Send notification to both original and substitute
      if (sub) {
        const notif1 = doc(collection(db, 'notifications'));
        await setDoc(notif1, {
          id: notif1.id,
          userId: sub.originalPejuangId,
          title: `Status Badal: ${status}`,
          message: `Pengajuan badal untuk ${sub.subject} pada ${sub.date} telah ${status}.`,
          timestamp: new Date().toISOString(),
          read: false,
        });

        const notif2 = doc(collection(db, 'notifications'));
        await setDoc(notif2, {
          id: notif2.id,
          userId: sub.substitutePejuangId,
          title: `Status Badal: ${status}`,
          message: `Tugas badal untuk ${sub.subject} (${sub.className}) pada ${sub.date} telah ${status}.`,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'teachingSubstitutions');
      throw e;
    }
  };

  const cancelSubstitution = async (subId: string) => {
    try {
      await setDoc(doc(db, 'teachingSubstitutions', subId), {
        status: 'Dibatalkan',
        decidedAt: new Date().toISOString(),
      }, { merge: true });
      await logAuditAction('CANCEL_TEACHING_SUBSTITUTION', `Membatalkan permohonan badal ${subId}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'teachingSubstitutions');
      throw e;
    }
  };

  const generateTeachingReport = useCallback(
    (params: {
      startDate: string;
      endDate: string;
      unit?: string;
      pejuangId?: string;
      accounts?: UserAccount[];
    }): TeachingReportSummary => {
      return generateTeachingReportHelper({
        startDate: params.startDate,
        endDate: params.endDate,
        unit: params.unit,
        pejuangId: params.pejuangId,
        accounts: params.accounts || [],
        schedules,
        attendances,
        substitutions,
        teachingSettings,
      });
    },
    [schedules, attendances, substitutions, teachingSettings]
  );

  return {
    locations,
    classes,
    schedules,
    attendances,
    substitutions,
    teachingSettings,
    isLoading,
    serverTimeOffsetMs,
    getWIBDate,
    getCurrentDateStr,
    getCurrentTimeHHmm,
    syncServerTime,
    saveLocation,
    deleteLocation,
    saveClass,
    deleteClass,
    saveSchedule,
    deleteSchedule,
    saveTeachingSettings,
    submitAbsenMasuk,
    submitAbsenPulang,
    koreksiAbsensi,
    deleteTeachingAttendance,
    requestSubstitution,
    respondSubstitution,
    cancelSubstitution,
    generateTeachingReport,
  };
}
