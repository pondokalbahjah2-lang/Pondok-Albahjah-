import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Users,
  AlertCircle,
  FileText,
  Send,
  X,
  Compass,
  ChevronRight,
  Sparkles,
  Award,
  Check,
  Building2,
  Maximize2
} from 'lucide-react';
import {
  UserAccount,
  TeachingSchedule,
  TeachingAttendance,
  TeachingSubstitution,
  TeachingLocation,
  TeachingClass,
} from '../types';
import { useTeachingData } from '../hooks/useTeachingData';
import {
  getNamaHariFromDate,
  formatMenitKeJamMenit,
  evaluateSessionStatus,
  calculateHaversineDistance,
  getLocalDateStr,
} from '../utils/teachingUtils';
import { triggerHapticFeedback, HAPTIC_PATTERNS } from '../utils/vibration';
import { LocationMap } from './LocationMap';

interface AbsenMengajarViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  teachingHook?: ReturnType<typeof useTeachingData>;
}

export const AbsenMengajarView: React.FC<AbsenMengajarViewProps> = ({
  currentUser,
  accounts,
  teachingHook: externalHook,
}) => {
  // Use either the shared hook instance or local hook instance
  const defaultHook = useTeachingData(currentUser);
  const teachingData = externalHook || defaultHook;

  const {
    locations,
    classes,
    schedules,
    attendances,
    substitutions,
    teachingSettings,
    isLoading,
    getWIBDate,
    getCurrentDateStr,
    getCurrentTimeHHmm,
    submitAbsenMasuk,
    submitAbsenPulang,
    requestSubstitution,
  } = teachingData;

  const [activeSubTab, setActiveSubTab] = useState<'hari-ini' | 'jadwal' | 'badal' | 'riwayat'>('hari-ini');
  const [currentTimeWIB, setCurrentTimeWIB] = useState(new Date());

  // GPS Watch State
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Submitting States
  const [submittingScheduleId, setSubmittingScheduleId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string>('');
  const [notesInput, setNotesInput] = useState<Record<string, string>>({});

  // Badal Request Modal
  const [showBadalModal, setShowBadalModal] = useState<boolean>(false);
  const [selectedScheduleForBadal, setSelectedScheduleForBadal] = useState<TeachingSchedule | null>(null);
  const [badalDate, setBadalDate] = useState<string>(getCurrentDateStr());
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<string>('');
  const [badalReason, setBadalReason] = useState<string>('');
  const [isSubmittingBadal, setIsSubmittingBadal] = useState<boolean>(false);

  // Map Modal
  const [activeMapSchedule, setActiveMapSchedule] = useState<{
    schedule: TeachingSchedule;
    location: TeachingLocation;
  } | null>(null);

  // Live WIB clock ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeWIB(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // GPS Watcher
  useEffect(() => {
    let watchId: number;
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCurrentLat(pos.coords.latitude);
          setCurrentLng(pos.coords.longitude);
          setCurrentAccuracy(Math.round(pos.coords.accuracy));
          setGpsError('');
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation teaching error:', err);
          let msg = 'Gagal mengakses GPS perangkat.';
          if (err.code === err.PERMISSION_DENIED) {
            msg = 'Izin akses GPS ditolak. Silakan izinkan akses lokasi pada peramban Anda.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = 'Sinyal GPS tidak tersedia saat ini.';
          } else if (err.code === err.TIMEOUT) {
            msg = 'Permintaan sinyal GPS memakan waktu terlalu lama.';
          }
          setGpsError(msg);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
      );
    } else {
      setGpsError('Peramban ini tidak mendukung Geolocation.');
    }

    return () => {
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const todayStr = getCurrentDateStr();
  const currentHHmm = getCurrentTimeHHmm();
  const namaHariToday = getNamaHariFromDate(todayStr);

  // Filter list of eligible substitute teachers
  const eligibleSubstitutes = useMemo(() => {
    return accounts.filter((acc) => acc.isPengajar && acc.id !== currentUser.id);
  }, [accounts, currentUser.id]);

  // Schedules for today relevant to this teacher:
  // 1. Where teacher is the scheduled teacher (pejuangId === currentUser.id)
  // 2. OR where teacher is assigned as approved badal for someone else today
  const todaySessions = useMemo(() => {
    const result: Array<{
      schedule: TeachingSchedule;
      isBadalForMe: boolean; // teacher is substituted
      isSubstituteRole: boolean; // teacher is teaching for someone else
      substitution?: TeachingSubstitution;
      attendance?: TeachingAttendance;
      location?: TeachingLocation;
      statusEvaluation: ReturnType<typeof evaluateSessionStatus>;
      distanceMeters: number | null;
      isWithinRadius: boolean;
    }> = [];

    // 1. Direct schedules matching today's day of week
    schedules.forEach((sch) => {
      if (!sch.active) return;
      if (sch.hari !== namaHariToday) return;

      // Check effective dates if specified
      if (sch.startDate && todayStr < sch.startDate) return;
      if (sch.endDate && todayStr > sch.endDate) return;

      // Find substitution for this schedule today
      const sub = substitutions.find(
        (s) => s.scheduleId === sch.id && s.date === todayStr && s.status !== 'Dibatalkan'
      );

      const isMySchedule = sch.pejuangId === currentUser.id;
      const isApprovedBadalForMe = sub && sub.status === 'Disetujui' && sub.originalPejuangId === currentUser.id;
      const isApprovedSubstitute = sub && sub.status === 'Disetujui' && sub.substitutePejuangId === currentUser.id;

      // If it's my schedule OR I am the approved substitute
      if (isMySchedule || isApprovedSubstitute) {
        const att = attendances.find((a) => a.scheduleId === sch.id && a.date === todayStr);
        const loc = locations.find((l) => l.id === sch.locationId);

        let distanceMeters: number | null = null;
        let isWithinRadius = false;

        if (loc && currentLat !== null && currentLng !== null) {
          distanceMeters = calculateHaversineDistance(
            currentLat,
            currentLng,
            loc.latitude,
            loc.longitude
          );
          isWithinRadius = distanceMeters <= loc.radiusMeters;
        }

        const evaluation = evaluateSessionStatus(
          sch,
          todayStr,
          currentHHmm,
          att,
          sub,
          teachingSettings
        );

        result.push({
          schedule: sch,
          isBadalForMe: Boolean(isApprovedBadalForMe),
          isSubstituteRole: Boolean(isApprovedSubstitute && !isMySchedule),
          substitution: sub,
          attendance: att,
          location: loc,
          statusEvaluation: evaluation,
          distanceMeters,
          isWithinRadius,
        });
      }
    });

    // Sort by start time
    return result.sort((a, b) => a.schedule.jamMulai.localeCompare(b.schedule.jamMulai));
  }, [
    schedules,
    namaHariToday,
    todayStr,
    currentUser.id,
    substitutions,
    attendances,
    locations,
    currentLat,
    currentLng,
    currentHHmm,
    teachingSettings,
  ]);

  // Handle Absen Masuk Click
  const handleAbsenMasuk = async (item: typeof todaySessions[0]) => {
    if (currentLat === null || currentLng === null) {
      alert('Lokasi GPS belum terdeteksi. Pastikan GPS aktif dan izin lokasi telah diberikan.');
      return;
    }

    const loc = item.location;
    if (!loc) {
      alert('Konfigurasi lokasi mengajar tidak ditemukan.');
      return;
    }

    const dist = calculateHaversineDistance(
      currentLat,
      currentLng,
      loc.latitude,
      loc.longitude
    );
    const within = dist <= loc.radiusMeters;

    if (!within) {
      const confirmOutside = window.confirm(
        `Perhatian: Posisi Anda berada di luar radius geofence lokasi (${dist} meter dari radius maks ${loc.radiusMeters}m).\n\nTetap lakukan absensi masuk?`
      );
      if (!confirmOutside) return;
    }

    setSubmittingScheduleId(item.schedule.id);
    try {
      await submitAbsenMasuk({
        schedule: item.schedule,
        date: todayStr,
        lat: currentLat,
        lng: currentLng,
        accuracy: currentAccuracy || 10,
        distanceMeters: dist,
        isWithinRadius: within,
        substitution: item.substitution,
        notes: notesInput[item.schedule.id] || '',
      });

      triggerHapticFeedback(HAPTIC_PATTERNS.SUCCESS);
      setActionSuccessMessage(`Alhamdulillah, Absen Masuk berhasil dicatat untuk mapel ${item.schedule.subject}!`);
      setTimeout(() => setActionSuccessMessage(''), 4000);
    } catch (err: any) {
      triggerHapticFeedback(HAPTIC_PATTERNS.WARNING);
      alert(`Gagal menyimpan absensi masuk: ${err.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setSubmittingScheduleId(null);
    }
  };

  // Handle Absen Pulang Click
  const handleAbsenPulang = async (item: typeof todaySessions[0]) => {
    if (!item.attendance) {
      alert('Data absensi masuk belum ditemukan.');
      return;
    }

    if (currentLat === null || currentLng === null) {
      alert('Lokasi GPS belum terdeteksi. Pastikan GPS aktif.');
      return;
    }

    const loc = item.location;
    const dist = loc
      ? calculateHaversineDistance(currentLat, currentLng, loc.latitude, loc.longitude)
      : 0;
    const within = loc ? dist <= loc.radiusMeters : true;

    setSubmittingScheduleId(item.schedule.id);
    try {
      await submitAbsenPulang({
        attendanceId: item.attendance.id,
        lat: currentLat,
        lng: currentLng,
        accuracy: currentAccuracy || 10,
        distanceMeters: dist,
        isWithinRadius: within,
        notes: notesInput[item.schedule.id] || '',
      });

      triggerHapticFeedback(HAPTIC_PATTERNS.SUCCESS);
      setActionSuccessMessage(`Alhamdulillah, Absen Pulang berhasil dicatat! Sesi mengajar telah selesai.`);
      setTimeout(() => setActionSuccessMessage(''), 4000);
    } catch (err: any) {
      triggerHapticFeedback(HAPTIC_PATTERNS.WARNING);
      alert(`Gagal menyimpan absensi pulang: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setSubmittingScheduleId(null);
    }
  };

  // Open Badal Request Modal
  const handleOpenBadalModal = (schedule: TeachingSchedule) => {
    setSelectedScheduleForBadal(schedule);
    setBadalDate(todayStr);
    setSelectedSubstituteId('');
    setBadalReason('');
    setShowBadalModal(true);
  };

  // Submit Badal Request
  const handleSubmitBadal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleForBadal) return;
    if (!selectedSubstituteId) {
      alert('Silakan pilih pengajar pengganti (badal).');
      return;
    }
    if (!badalReason.trim()) {
      alert('Silakan masukkan alasan permohonan badal.');
      return;
    }

    const substituteTeacher = accounts.find((a) => a.id === selectedSubstituteId);
    if (!substituteTeacher) {
      alert('Data pengajar badal tidak valid.');
      return;
    }

    setIsSubmittingBadal(true);
    try {
      await requestSubstitution({
        schedule: selectedScheduleForBadal,
        date: badalDate,
        substituteTeacher,
        reason: badalReason.trim(),
        requestedBy: 'Pejuang',
      });

      triggerHapticFeedback(HAPTIC_PATTERNS.SUCCESS);
      alert('Permohonan badal mengajar berhasil diajukan dan menunggu persetujuan koordinator/admin.');
      setShowBadalModal(false);
    } catch (err: any) {
      alert(`Gagal mengajukan badal: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSubmittingBadal(false);
    }
  };

  // User's full weekly schedule list
  const myWeeklySchedules = useMemo(() => {
    return schedules.filter((s) => s.pejuangId === currentUser.id);
  }, [schedules, currentUser.id]);

  // User's past teaching attendances
  const myAttendances = useMemo(() => {
    return attendances
      .filter((a) => a.actualPejuangId === currentUser.id || a.pejuangId === currentUser.id)
      .sort((a, b) => {
        const dDiff = b.date.localeCompare(a.date);
        if (dDiff !== 0) return dDiff;
        return (b.jamMasuk || '').localeCompare(a.jamMasuk || '');
      });
  }, [attendances, currentUser.id]);

  // User's badal history
  const mySubstitutions = useMemo(() => {
    return substitutions
      .filter(
        (s) => s.originalPejuangId === currentUser.id || s.substitutePejuangId === currentUser.id
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [substitutions, currentUser.id]);

  // Statistics for this teacher
  const stats = useMemo(() => {
    const totalSesi = myAttendances.length;
    const totalJP = myAttendances.reduce((acc, a) => acc + (a.actualJP ?? a.jumlahJP ?? 0), 0);
    const totalTepatWaktu = myAttendances.filter((a) => a.status === 'Hadir').length;
    const totalTerlambat = myAttendances.filter((a) => a.status === 'Terlambat').length;
    const totalBadalMasuk = myAttendances.filter(
      (a) => a.isBadal && a.actualPejuangId === currentUser.id
    ).length;

    return { totalSesi, totalJP, totalTepatWaktu, totalTerlambat, totalBadalMasuk };
  }, [myAttendances, currentUser.id]);

  return (
    <div className="space-y-6">
      {/* Header Banner - iOS Glass Design */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Absensi Mengajar
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Pengajar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Presensi berbasis geofence ruang kelas, jadwal jam pelajaran (JP), dan delegasi badal
              </p>
            </div>
          </div>

          {/* Real-time Clock & GPS Badge */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Realtime WIB Clock */}
            <div className="px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center space-x-2 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {currentTimeWIB.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}{' '}
                WIB
              </span>
            </div>

            {/* GPS Status Indicator */}
            <div
              className={`px-3 py-1.5 rounded-2xl border flex items-center space-x-2 text-xs font-semibold ${
                currentLat !== null
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : isLocating
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              <Compass
                className={`w-3.5 h-3.5 ${
                  isLocating ? 'animate-spin text-amber-500' : currentLat ? 'text-emerald-500' : 'text-rose-500'
                }`}
              />
              <span>
                {currentLat !== null
                  ? `GPS Aktif (±${currentAccuracy || 0}m)`
                  : isLocating
                  ? 'Mencari Lokasi...'
                  : 'GPS Nonaktif'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Action Message */}
        <AnimatePresence>
          {actionSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{actionSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {gpsError && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Sesi Mengajar</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalSesi} <span className="text-xs font-normal text-slate-400">kali</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Akumulasi JP</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.totalJP} <span className="text-xs font-normal text-slate-400">JP</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Hadir Tepat Waktu</div>
          <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {stats.totalTepatWaktu} <span className="text-xs font-normal text-slate-400">sesi</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Tugas Badal Mengajar</div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.totalBadalMasuk} <span className="text-xs font-normal text-slate-400">sesi</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex space-x-1 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-md max-w-md">
        <button
          onClick={() => setActiveSubTab('hari-ini')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'hari-ini'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Presensi Hari Ini
        </button>
        <button
          onClick={() => setActiveSubTab('jadwal')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'jadwal'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Jadwal Mingguan
        </button>
        <button
          onClick={() => setActiveSubTab('badal')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'badal'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Badal ({mySubstitutions.length})
        </button>
        <button
          onClick={() => setActiveSubTab('riwayat')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'riwayat'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Riwayat
        </button>
      </div>

      {/* TAB 1: PRESENSI HARI INI */}
      {activeSubTab === 'hari-ini' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Jadwal Mengajar Hari Ini ({namaHariToday}, {todayStr})
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {todaySessions.length} sesi terdaftar
            </span>
          </div>

          {todaySessions.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Tidak ada jadwal mengajar pada hari {namaHariToday}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Anda tidak memiliki kelas terjadwal atau tugas badal untuk hari ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todaySessions.map((item) => {
                const {
                  schedule,
                  isBadalForMe,
                  isSubstituteRole,
                  substitution,
                  attendance,
                  location,
                  statusEvaluation,
                  distanceMeters,
                  isWithinRadius,
                } = item;

                const isSubmitting = submittingScheduleId === schedule.id;

                return (
                  <div
                    key={schedule.id}
                    className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    {/* Header Card: Class & Unit & Badal Info */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {schedule.unit}
                            </span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              {schedule.className}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              • {schedule.jumlahJP} JP
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                            {schedule.subject}
                          </h3>
                        </div>

                        {/* Status Evaluation Pill */}
                        <div
                          className={`px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider border text-right shrink-0 ${statusEvaluation.badgeColor}`}
                        >
                          {statusEvaluation.label}
                        </div>
                      </div>

                      {/* Badal Notification Banner if applicable */}
                      {isSubstituteRole && substitution && (
                        <div className="mt-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-center space-x-2">
                          <Users className="w-4 h-4 shrink-0 text-amber-500" />
                          <span>
                            <strong>Tugas Badal:</strong> Menggantikan <em>{substitution.originalPejuangName}</em>
                          </span>
                        </div>
                      )}

                      {isBadalForMe && substitution && (
                        <div className="mt-3 p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-200 text-xs flex items-center space-x-2">
                          <UserCheck className="w-4 h-4 shrink-0 text-blue-500" />
                          <span>
                            <strong>Delegasi Badal:</strong> Digantikan oleh <em>{substitution.substitutePejuangName}</em>
                          </span>
                        </div>
                      )}

                      {/* Time & Location Details */}
                      <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Waktu Mengajar</div>
                          <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {schedule.jamMulai} - {schedule.jamSelesai} WIB
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Lokasi Kelas</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center justify-between">
                            <span className="truncate">{location?.name || schedule.locationName}</span>
                            {location && (
                              <button
                                type="button"
                                onClick={() => setActiveMapSchedule({ schedule, location })}
                                className="text-emerald-500 hover:text-emerald-600 ml-1 p-0.5"
                                title="Lihat Peta Geofence"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Geofence Proximity Status */}
                      {location && (
                        <div className="mt-2.5 flex items-center justify-between text-[11px]">
                          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Jarak:{' '}
                              <strong>
                                {distanceMeters !== null ? `${distanceMeters} meter` : 'Menghitung...'}
                              </strong>{' '}
                              (Radius maks: {location.radiusMeters}m)
                            </span>
                          </div>

                          <span
                            className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${
                              isWithinRadius
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isWithinRadius ? 'Dalam Geofence' : 'Di Luar Geofence'}
                          </span>
                        </div>
                      )}

                      {/* Existing Attendance Timestamps */}
                      {attendance && (
                        <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Jam Masuk:</span>
                            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                              {attendance.jamMasuk || '-'}
                            </span>
                          </div>
                          {attendance.jamPulang && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Jam Pulang:</span>
                              <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                                {attendance.jamPulang}
                              </span>
                            </div>
                          )}
                          {attendance.durationMinutes !== undefined && (
                            <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-[11px]">
                              <span className="text-slate-500">Durasi Mengajar:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {formatMenitKeJamMenit(attendance.durationMinutes)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      {/* Can Clock In */}
                      {statusEvaluation.canClockIn && (
                        <button
                          type="button"
                          onClick={() => handleAbsenMasuk(item)}
                          disabled={isSubmitting}
                          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>Absen Masuk Sekarang ({schedule.jumlahJP} JP)</span>
                        </button>
                      )}

                      {/* Can Clock Out */}
                      {statusEvaluation.canClockOut && (
                        <button
                          type="button"
                          onClick={() => handleAbsenPulang(item)}
                          disabled={isSubmitting}
                          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>Absen Pulang (Selesaikan Sesi)</span>
                        </button>
                      )}

                      {/* Badal Request Button (Only if not already substituted and not yet completed) */}
                      {!isBadalForMe && !attendance && !isSubstituteRole && (
                        <button
                          type="button"
                          onClick={() => handleOpenBadalModal(schedule)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                        >
                          <Send className="w-3.5 h-3.5 text-amber-500" />
                          <span>Ajukan Pengajar Badal</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JADWAL MINGGUAN SAYA */}
      {activeSubTab === 'jadwal' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Jadwal Mengajar Rutin Mingguan
              </h2>
              <p className="text-xs text-slate-500">
                Daftar kelas rutin yang diamanahkan kepada Anda
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600">
              Total {myWeeklySchedules.reduce((a, s) => a + s.jumlahJP, 0)} JP / Minggu
            </span>
          </div>

          {myWeeklySchedules.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada jadwal mengajar yang didaftarkan oleh admin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Hari</th>
                    <th className="py-2.5 px-3">Jam</th>
                    <th className="py-2.5 px-3">Unit & Kelas</th>
                    <th className="py-2.5 px-3">Mata Pelajaran</th>
                    <th className="py-2.5 px-3">JP</th>
                    <th className="py-2.5 px-3">Lokasi Geofence</th>
                    <th className="py-2.5 px-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {myWeeklySchedules.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {s.hari}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {s.jamMulai} - {s.jamSelesai}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 mr-1.5">
                          {s.unit}
                        </span>
                        {s.className}
                      </td>
                      <td className="py-3 px-3 font-bold">{s.subject}</td>
                      <td className="py-3 px-3 font-bold text-emerald-600">{s.jumlahJP} JP</td>
                      <td className="py-3 px-3 text-slate-500">{s.locationName}</td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleOpenBadalModal(s)}
                          className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-[10px] font-bold"
                        >
                          Ajukan Badal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERMOHONAN & RIWAYAT BADAL */}
      {activeSubTab === 'badal' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Daftar Permohonan & Tugas Badal
              </h2>
              <p className="text-xs text-slate-500">
                Catatan pertukaran pengajar dan delegasi badal mengajar
              </p>
            </div>
          </div>

          {mySubstitutions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada riwayat badal mengajar.
            </div>
          ) : (
            <div className="space-y-3">
              {mySubstitutions.map((sub) => {
                const isRequestedByMe = sub.originalPejuangId === currentUser.id;
                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            sub.status === 'Disetujui'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : sub.status === 'Ditolak'
                              ? 'bg-rose-500/10 text-rose-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {sub.status}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {sub.date} ({sub.jamMulai} - {sub.jamSelesai})
                        </span>
                        <span className="text-slate-400">• {sub.jumlahJP} JP</span>
                      </div>

                      <div className="font-bold text-slate-900 dark:text-white mt-1">
                        {sub.subject} ({sub.className} - {sub.unit})
                      </div>

                      <div className="text-slate-500 dark:text-slate-400 mt-1">
                        {isRequestedByMe ? (
                          <span>
                            Anda mendelegasikan ke <strong>{sub.substitutePejuangName}</strong>
                          </span>
                        ) : (
                          <span>
                            Anda ditugaskan menggantikan <strong>{sub.originalPejuangName}</strong>
                          </span>
                        )}
                        {sub.reason && <span className="italic"> — &quot;{sub.reason}&quot;</span>}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 shrink-0">
                      <div>Diajukan oleh: {sub.requestedBy}</div>
                      {sub.decidedBy && <div>Persetujuan: {sub.decidedBy}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RIWAYAT PRESENSI MENGAJAR */}
      {activeSubTab === 'riwayat' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Log Presensi Mengajar Saya
              </h2>
              <p className="text-xs text-slate-500">
                Rekaman riwayat presensi mengajar yang telah dilakukan
              </p>
            </div>
          </div>

          {myAttendances.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada riwayat absensi mengajar yang tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Kelas & Mapel</th>
                    <th className="py-2.5 px-3">Jam Masuk</th>
                    <th className="py-2.5 px-3">Jam Pulang</th>
                    <th className="py-2.5 px-3">JP</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Badal?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {myAttendances.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {att.date}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold">{att.subject}</div>
                        <div className="text-[11px] text-slate-400">
                          {att.className} ({att.unit})
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-600 font-bold">
                        {att.jamMasuk || '-'}
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-600 font-bold">
                        {att.jamPulang || '-'}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">
                        {att.actualJP ?? att.jumlahJP} JP
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            att.status === 'Hadir'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {att.isBadal ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            Badal
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: AJUKAN BADAL MENGAJAR */}
      {showBadalModal && selectedScheduleForBadal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Pengajuan Pengajar Badal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBadalModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
              <div>
                <strong>Mata Pelajaran:</strong> {selectedScheduleForBadal.subject}
              </div>
              <div>
                <strong>Kelas & Unit:</strong> {selectedScheduleForBadal.className} (
                {selectedScheduleForBadal.unit})
              </div>
              <div>
                <strong>Jadwal:</strong> {selectedScheduleForBadal.hari},{' '}
                {selectedScheduleForBadal.jamMulai} - {selectedScheduleForBadal.jamSelesai} (
                {selectedScheduleForBadal.jumlahJP} JP)
              </div>
            </div>

            <form onSubmit={handleSubmitBadal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Berhalangan Mengajar
                </label>
                <input
                  type="date"
                  required
                  value={badalDate}
                  onChange={(e) => setBadalDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Pengajar Pengganti (Badal)
                </label>
                <select
                  required
                  value={selectedSubstituteId}
                  onChange={(e) => setSelectedSubstituteId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Pilih Ustadz/Ustadzah Pengajar --</option>
                  {eligibleSubstitutes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subDivisi || t.amanah || 'Pengajar'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan / Keterangan Berhalangan
                </label>
                <textarea
                  required
                  rows={3}
                  value={badalReason}
                  onChange={(e) => setBadalReason(e.target.value)}
                  placeholder="Contoh: Sedang sakit / menghadiri tugas pondok di luar kota..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBadalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBadal}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmittingBadal ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Kirim Permohonan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MAP GEOFENCE PREVIEW */}
      {activeMapSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Peta Radius Geofence: {activeMapSchedule.location.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Radius batas: {activeMapSchedule.location.radiusMeters} meter
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMapSchedule(null)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <LocationMap
                userLat={currentLat || activeMapSchedule.location.latitude}
                userLng={currentLng || activeMapSchedule.location.longitude}
                pondokLat={activeMapSchedule.location.latitude}
                pondokLng={activeMapSchedule.location.longitude}
                radius={activeMapSchedule.location.radiusMeters}
                height="h-64"
              />
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setActiveMapSchedule(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                Tutup Peta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
