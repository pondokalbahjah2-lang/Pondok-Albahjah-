import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Users,
  MapPin,
  Settings,
  BookOpen,
  GraduationCap,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Eye,
  Sliders,
  Award,
  ChevronRight,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import {
  UserAccount,
  TeachingSchedule,
  TeachingClass,
  TeachingLocation,
  TeachingSettings,
  TeachingSubstitution,
  TeachingAttendance,
} from '../types';
import { useTeachingData } from '../hooks/useTeachingData';
import {
  getNamaHariFromDate,
  formatMenitKeJamMenit,
  calculateHaversineDistance,
  evaluateSessionStatus,
} from '../utils/teachingUtils';
import { triggerHapticFeedback, HAPTIC_PATTERNS } from '../utils/vibration';

interface KelolaMengajarViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  teachingHook?: ReturnType<typeof useTeachingData>;
}

export const KelolaMengajarView: React.FC<KelolaMengajarViewProps> = ({
  currentUser,
  accounts,
  teachingHook: externalHook,
}) => {
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
    getCurrentDateStr,
    getCurrentTimeHHmm,
    saveLocation,
    deleteLocation,
    saveClass,
    deleteClass,
    saveSchedule,
    deleteSchedule,
    saveTeachingSettings,
    respondSubstitution,
    koreksiAbsensi,
    deleteTeachingAttendance,
  } = teachingData;

  const [activeTab, setActiveTab] = useState<
    'monitoring' | 'jadwal' | 'kelas' | 'lokasi' | 'badal' | 'pengaturan'
  >('monitoring');

  const todayStr = getCurrentDateStr();
  const currentHHmm = getCurrentTimeHHmm();
  const namaHariToday = getNamaHariFromDate(todayStr);

  // Filter States
  const [filterUnit, setFilterUnit] = useState<string>('Semua');
  const [filterHari, setFilterHari] = useState<string>('Semua');
  const [searchSchedule, setSearchSchedule] = useState<string>('');

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<TeachingSchedule | null>(null);

  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<TeachingClass | null>(null);

  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [editingLocation, setEditingLocation] = useState<TeachingLocation | null>(null);

  const [showKoreksiModal, setShowKoreksiModal] = useState<boolean>(false);
  const [selectedAttendanceForKoreksi, setSelectedAttendanceForKoreksi] = useState<TeachingAttendance | null>(null);

  // Filter pengajar accounts
  const pengajarAccounts = useMemo(() => {
    return accounts.filter((a) => a.isPengajar || a.role === 'Pejuang');
  }, [accounts]);

  // Today's Live Sessions
  const todayLiveSessions = useMemo(() => {
    return schedules
      .filter((s) => {
        if (!s.active && !s.isActive) return false;
        return Array.isArray(s.hari)
          ? s.hari.includes(namaHariToday)
          : (s.hari as unknown as string) === namaHariToday;
      })
      .map((s) => {
        const att = attendances.find((a) => a.scheduleId === s.id && a.date === todayStr);
        const sub = substitutions.find(
          (sub) => sub.scheduleId === s.id && sub.date === todayStr && sub.status !== 'Dibatalkan'
        );
        const evaluation = evaluateSessionStatus(
          s,
          todayStr,
          currentHHmm,
          currentUser.id,
          att,
          sub,
          teachingSettings
        );
        return {
          schedule: s,
          attendance: att,
          substitution: sub,
          evaluation,
        };
      })
      .sort((a, b) => a.schedule.jamMulai.localeCompare(b.schedule.jamMulai));
  }, [schedules, namaHariToday, attendances, todayStr, substitutions, currentHHmm, currentUser.id, teachingSettings]);

  // Stats for Today Monitoring
  const todayStats = useMemo(() => {
    const total = todayLiveSessions.length;
    const hadir = todayLiveSessions.filter((s) => s.attendance?.status === 'Hadir').length;
    const terlambat = todayLiveSessions.filter((s) => s.attendance?.status === 'Terlambat').length;
    const ongoing = todayLiveSessions.filter(
      (s) => s.evaluation.phase === 'SEDANG_BERLANGSUNG' || s.evaluation.phase === 'SIAP_PULANG'
    ).length;
    const badalCount = todayLiveSessions.filter((s) => s.substitution?.status === 'Disetujui').length;
    const selesai = todayLiveSessions.filter((s) => s.evaluation.phase === 'SELESAI').length;

    return { total, hadir, terlambat, ongoing, badalCount, selesai };
  }, [todayLiveSessions]);

  // Filtered schedules for Schedule Management tab
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchUnit = filterUnit === 'Semua' || s.unit === filterUnit;
      const matchHari =
        filterHari === 'Semua' ||
        (Array.isArray(s.hari) ? s.hari.includes(filterHari) : (s.hari as unknown as string) === filterHari);
      const matchSearch =
        !searchSchedule.trim() ||
        s.pejuangName.toLowerCase().includes(searchSchedule.toLowerCase()) ||
        s.subject.toLowerCase().includes(searchSchedule.toLowerCase()) ||
        s.className.toLowerCase().includes(searchSchedule.toLowerCase());
      return matchUnit && matchHari && matchSearch;
    });
  }, [schedules, filterUnit, filterHari, searchSchedule]);

  // Pending badal requests
  const pendingSubstitutions = useMemo(() => {
    return substitutions.filter((s) => s.status === 'Menunggu Persetujuan');
  }, [substitutions]);

  const pastSubstitutions = useMemo(() => {
    return substitutions.filter((s) => s.status !== 'Menunggu Persetujuan');
  }, [substitutions]);

  // Quick Action: Koreksi Kehadiran
  const handleOpenKoreksi = (session: typeof todayLiveSessions[0]) => {
    if (session.attendance) {
      setSelectedAttendanceForKoreksi(session.attendance);
    } else {
      // Create new draft attendance record
      const draft: TeachingAttendance = {
        id: `${session.schedule.id}_${todayStr}`,
        scheduleId: session.schedule.id,
        date: todayStr,
        hari: namaHariToday,
        pejuangId: session.schedule.pejuangId,
        pejuangName: session.schedule.pejuangName,
        scheduledPejuangId: session.schedule.pejuangId,
        scheduledPejuangName: session.schedule.pejuangName,
        actualPejuangId: session.substitution?.status === 'Disetujui'
          ? session.substitution.substitutePejuangId
          : session.schedule.pejuangId,
        actualPejuangName: session.substitution?.status === 'Disetujui'
          ? session.substitution.substitutePejuangName
          : session.schedule.pejuangName,
        isBadal: session.substitution?.status === 'Disetujui',
        unit: session.schedule.unit,
        classId: session.schedule.classId,
        className: session.schedule.className,
        subject: session.schedule.subject,
        jumlahJP: session.schedule.jumlahJP,
        actualJP: session.schedule.jumlahJP,
        locationId: session.schedule.locationId,
        locationName: session.schedule.locationName,
        jadwalMulai: session.schedule.jamMulai,
        jadwalSelesai: session.schedule.jamSelesai,
        jamMasuk: session.schedule.jamMulai,
        jamPulang: session.schedule.jamSelesai,
        status: 'Hadir',
        lateMinutes: 0,
        durationMinutes: (session.schedule.jumlahJP || 1) * 45,
        source: 'Koreksi Admin',
      };
      setSelectedAttendanceForKoreksi(draft);
    }
    setShowKoreksiModal(true);
  };

  const handleSaveKoreksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendanceForKoreksi) return;
    try {
      await koreksiAbsensi(selectedAttendanceForKoreksi);
      triggerHapticFeedback(HAPTIC_PATTERNS.SUCCESS);
      alert('Presensi berhasil diperbarui oleh Admin.');
      setShowKoreksiModal(false);
    } catch (err: any) {
      alert(`Gagal menyimpan koreksi: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Kelola Absensi & Jadwal Mengajar
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitoring live kelas, manajemen jadwal mingguan, kelas, radius geofence, dan persetujuan badal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {namaHariToday}, {todayStr} • {currentHHmm} WIB
            </div>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex space-x-1 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-md overflow-x-auto hide-scrollbar">
        {[
          { id: 'monitoring', label: 'Monitoring Hari Ini', count: todayStats.total },
          { id: 'jadwal', label: 'Jadwal Mengajar', count: schedules.length },
          { id: 'kelas', label: 'Data Kelas', count: classes.length },
          { id: 'lokasi', label: 'Lokasi Geofence', count: locations.length },
          { id: 'badal', label: 'Persetujuan Badal', count: pendingSubstitutions.length, alert: pendingSubstitutions.length > 0 },
          { id: 'pengaturan', label: 'Pengaturan Sistem' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  tab.alert
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MONITORING HARI INI                                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          {/* Live KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/60 dark:border-white/10 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Sesi Hari Ini</div>
              <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
                {todayStats.total}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/60 dark:border-white/10 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-emerald-500">Hadir Tepat Waktu</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {todayStats.hadir}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/60 dark:border-white/10 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-amber-500">Terlambat</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {todayStats.terlambat}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/60 dark:border-white/10 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-blue-500">Sedang Berlangsung</div>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {todayStats.ongoing}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/60 dark:border-white/10 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-teal-500">Selesai</div>
              <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
                {todayStats.selesai}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/60 dark:border-white/10 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-purple-500">Badal Aktif</div>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {todayStats.badalCount}
              </div>
            </div>
          </div>

          {/* Live Sessions Table */}
          <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Live Status Sesi Mengajar Hari Ini ({todayLiveSessions.length} Kelas)
              </h2>
            </div>

            {todayLiveSessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada kelas yang dijadwalkan pada hari {namaHariToday}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Jam</th>
                      <th className="py-2.5 px-3">Unit / Kelas</th>
                      <th className="py-2.5 px-3">Mata Pelajaran</th>
                      <th className="py-2.5 px-3">Pengajar Terjadwal</th>
                      <th className="py-2.5 px-3">Pengajar Riil (Badal)</th>
                      <th className="py-2.5 px-3">Jam Masuk - Pulang</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    {todayLiveSessions.map((item) => (
                      <tr key={item.schedule.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {item.schedule.jamMulai} - {item.schedule.jamSelesai}
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            {item.schedule.jumlahJP} JP
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 mr-1.5">
                            {item.schedule.unit}
                          </span>
                          <span className="font-bold">{item.schedule.className}</span>
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.schedule.locationName}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold">{item.schedule.subject}</td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {item.schedule.pejuangName}
                        </td>
                        <td className="py-3 px-3">
                          {item.substitution && item.substitution.status === 'Disetujui' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                              Badal: {item.substitution.substitutePejuangName}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {item.attendance ? (
                            <div>
                              <span className="text-emerald-600 font-bold">
                                {item.attendance.jamMasuk || '-'}
                              </span>
                              {' → '}
                              <span className="text-blue-600 font-bold">
                                {item.attendance.jamPulang || 'Belum'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Belum Ada Presensi</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border uppercase ${item.evaluation.badgeColor}`}
                          >
                            {item.evaluation.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenKoreksi(item)}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-all"
                          >
                            {item.attendance ? 'Koreksi' : 'Catat Hadir'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. KELOLA JADWAL MENGAJAR (CRUD)                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'jadwal' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Daftar Jadwal Mengajar Rutin
              </h2>
              <p className="text-xs text-slate-500">
                Atur jadwal mingguan guru, unit pendidikan, kelas, mata pelajaran, dan geofence lokasi
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingSchedule(null);
                setShowScheduleModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal Baru</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <input
              type="text"
              placeholder="Cari nama pengajar, mapel, kelas..."
              value={searchSchedule}
              onChange={(e) => setSearchSchedule(e.target.value)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
            />

            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="Semua">Semua Unit</option>
              <option value="SMPIQu">SMPIQu</option>
              <option value="SMAIQu">SMAIQu</option>
              <option value="SDIQu">SDIQu</option>
              <option value="Tahfidz">Tahfidz</option>
              <option value="Umum">Umum</option>
            </select>

            <select
              value={filterHari}
              onChange={(e) => setFilterHari(e.target.value)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="Semua">Semua Hari</option>
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'].map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Schedules Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Hari & Jam</th>
                  <th className="py-2.5 px-3">Pengajar</th>
                  <th className="py-2.5 px-3">Unit / Kelas</th>
                  <th className="py-2.5 px-3">Mapel</th>
                  <th className="py-2.5 px-3">JP</th>
                  <th className="py-2.5 px-3">Lokasi Geofence</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {filteredSchedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">
                        {s.hari}
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {s.jamMulai} - {s.jamSelesai}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold">{s.pejuangName}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 mr-1.5">
                        {s.unit}
                      </span>
                      <span>{s.className}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{s.subject}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{s.jumlahJP} JP</td>
                    <td className="py-3 px-3 text-slate-500">{s.locationName}</td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSchedule(s);
                          setShowScheduleModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Edit Jadwal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Hapus jadwal mengajar ${s.subject} (${s.pejuangName})?`)) {
                            await deleteSchedule(s.id, `${s.subject} - ${s.pejuangName}`);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. KELOLA DATA KELAS (CRUD)                                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'kelas' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Daftar Ruang Kelas & Kelompok
              </h2>
              <p className="text-xs text-slate-500">
                Data master kelas untuk tiap unit pendidikan di lingkungan Pondok
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingClass(null);
                setShowClassModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {classes.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {c.unit}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                    {c.name}
                  </h3>
                  {c.gradeLevel && (
                    <div className="text-[11px] text-slate-500 mt-0.5">Tingkat: {c.gradeLevel}</div>
                  )}
                  {c.description && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">{c.description}</p>
                  )}
                </div>

                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingClass(c);
                      setShowClassModal(true);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Hapus kelas ${c.name}?`)) {
                        await deleteClass(c.id, c.name);
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/30 text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. KELOLA LOKASI GEOFENCE                                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'lokasi' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Lokasi Geofence Mengajar
              </h2>
              <p className="text-xs text-slate-500">
                Titik koordinat dan radius toleransi GPS untuk ruang kelas/gedung mengajar
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingLocation(null);
                setShowLocationModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lokasi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {loc.name}
                    </h3>
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-1">
                    {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-1">
                    Radius Maks: {loc.radiusMeters} meter • Akurasi GPS Maks: {loc.maxAccuracyMeters || 50}m
                  </div>
                </div>

                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLocation(loc);
                      setShowLocationModal(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Hapus lokasi ${loc.name}?`)) {
                        await deleteLocation(loc.id, loc.name);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/30 text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. PERSETUJUAN BADAL MENGAJAR                                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'badal' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Permohonan Badal Menunggu Persetujuan ({pendingSubstitutions.length})
            </h2>
            <p className="text-xs text-slate-500">
              Verifikasi dan berikan persetujuan permohonan delegasi tugas mengajar
            </p>
          </div>

          {pendingSubstitutions.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              Alhamdulillah, tidak ada permohonan badal yang sedang menunggu persetujuan.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSubstitutions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-white">
                        Menunggu Persetujuan
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {sub.date} • {sub.jamMulai} - {sub.jamSelesai} ({sub.jumlahJP} JP)
                      </span>
                    </div>

                    <div className="font-black text-sm text-slate-900 dark:text-white mt-1">
                      {sub.subject} ({sub.className} - {sub.unit})
                    </div>

                    <div className="mt-1 text-slate-700 dark:text-slate-300">
                      <strong>Pengajar Asli:</strong> {sub.originalPejuangName} →{' '}
                      <strong>Pengganti (Badal):</strong> {sub.substitutePejuangName}
                    </div>

                    {sub.reason && (
                      <div className="text-slate-500 italic mt-0.5">&quot;{sub.reason}&quot;</div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        await respondSubstitution(sub.id, 'Disetujui');
                        triggerHapticFeedback(HAPTIC_PATTERNS.SUCCESS);
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const note = prompt('Masukkan alasan penolakan (opsional):');
                        await respondSubstitution(sub.id, 'Ditolak', note || undefined);
                        triggerHapticFeedback(HAPTIC_PATTERNS.WARNING);
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past Substitutions Log */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">
              Riwayat Badal Terdahulu ({pastSubstitutions.length})
            </h3>
            <div className="space-y-2">
              {pastSubstitutions.slice(0, 10).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold mr-2 ${
                        sub.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {sub.status}
                    </span>
                    <strong>{sub.date}:</strong> {sub.subject} ({sub.originalPejuangName} →{' '}
                    {sub.substitutePejuangName})
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Oleh: {sub.decidedBy || 'Admin'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. PENGATURAN SISTEM MENGAJAR                                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'pengaturan' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-5 max-w-2xl">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Pengaturan Absensi Mengajar
            </h2>
            <p className="text-xs text-slate-500">
              Konfigurasi parameter batas toleransi waktu, cut-off penggajian, dan geofence
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data: Partial<TeachingSettings> = {
                toleransiTerlambatMenit: Number((form.elements.namedItem('toleransiTerlambatMenit') as HTMLInputElement).value),
                masukBukaMenit: Number((form.elements.namedItem('masukBukaMenit') as HTMLInputElement).value),
                pulangBukaMenit: Number((form.elements.namedItem('pulangBukaMenit') as HTMLInputElement).value),
                cutoffStartDay: Number((form.elements.namedItem('cutoffStartDay') as HTMLInputElement).value),
                cutoffEndDay: Number((form.elements.namedItem('cutoffEndDay') as HTMLInputElement).value),
              };
              await saveTeachingSettings(data);
              triggerHapticFeedback(HAPTIC_PATTERNS.SUCCESS);
              alert('Pengaturan absensi mengajar berhasil disimpan.');
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Toleransi Keterlambatan (Menit)
                </label>
                <input
                  type="number"
                  name="toleransiTerlambatMenit"
                  defaultValue={teachingSettings.toleransiTerlambatMenit ?? 15}
                  min={0}
                  max={60}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Batas menit setelah jam mulai sebelum dihitung status &quot;Terlambat&quot;
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Buka Absen Masuk Lebih Awal (Menit)
                </label>
                <input
                  type="number"
                  name="masukBukaMenit"
                  defaultValue={teachingSettings.masukBukaMenit ?? 15}
                  min={0}
                  max={60}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Tombol &quot;Absen Masuk&quot; mulai aktif X menit sebelum jam jadwal
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Buka Absen Pulang Lebih Awal (Menit)
                </label>
                <input
                  type="number"
                  name="pulangBukaMenit"
                  defaultValue={teachingSettings.pulangBukaMenit ?? 10}
                  min={0}
                  max={60}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Tombol &quot;Absen Pulang&quot; mulai aktif X menit sebelum kelas selesai
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Periode Cutoff Penggajian (Tgl Mulai &amp; Akhir)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="cutoffStartDay"
                    defaultValue={teachingSettings.cutoffStartDay ?? 21}
                    min={1}
                    max={31}
                    className="w-1/2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                  <span className="text-xs text-slate-400">s/d</span>
                  <input
                    type="number"
                    name="cutoffEndDay"
                    defaultValue={teachingSettings.cutoffEndDay ?? 20}
                    min={1}
                    max={31}
                    className="w-1/2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Standar Al-Bahjah: tanggal 21 s/d 20 bulan berikutnya
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT / TAMBAH JADWAL MENGAJAR                          */}
      {/* ------------------------------------------------------------- */}
      {showScheduleModal && (
        <ScheduleFormModal
          schedule={editingSchedule}
          accounts={pengajarAccounts}
          classes={classes}
          locations={locations}
          onClose={() => setShowScheduleModal(false)}
          onSave={async (scheduleData) => {
            await saveSchedule(scheduleData);
            setShowScheduleModal(false);
          }}
        />
      )}

      {/* MODAL: EDIT / TAMBAH KELAS */}
      {showClassModal && (
        <ClassFormModal
          item={editingClass}
          onClose={() => setShowClassModal(false)}
          onSave={async (data) => {
            await saveClass(data);
            setShowClassModal(false);
          }}
        />
      )}

      {/* MODAL: EDIT / TAMBAH LOKASI GEOFENCE */}
      {showLocationModal && (
        <LocationFormModal
          item={editingLocation}
          onClose={() => setShowLocationModal(false)}
          onSave={async (data) => {
            await saveLocation(data);
            setShowLocationModal(false);
          }}
        />
      )}

      {/* MODAL: KOREKSI PRESENSI ADMIN */}
      {showKoreksiModal && selectedAttendanceForKoreksi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Koreksi Presensi Mengajar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKoreksiModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
              <div>
                <strong>Pengajar:</strong> {selectedAttendanceForKoreksi.actualPejuangName}
              </div>
              <div>
                <strong>Mata Pelajaran:</strong> {selectedAttendanceForKoreksi.subject} (
                {selectedAttendanceForKoreksi.className})
              </div>
              <div>
                <strong>Tanggal:</strong> {selectedAttendanceForKoreksi.date}
              </div>
            </div>

            <form onSubmit={handleSaveKoreksi} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status Kehadiran
                </label>
                <select
                  value={selectedAttendanceForKoreksi.status}
                  onChange={(e) =>
                    setSelectedAttendanceForKoreksi({
                      ...selectedAttendanceForKoreksi,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alfa">Alfa / Tidak Hadir</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Masuk
                  </label>
                  <input
                    type="time"
                    value={selectedAttendanceForKoreksi.jamMasuk || ''}
                    onChange={(e) =>
                      setSelectedAttendanceForKoreksi({
                        ...selectedAttendanceForKoreksi,
                        jamMasuk: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Pulang
                  </label>
                  <input
                    type="time"
                    value={selectedAttendanceForKoreksi.jamPulang || ''}
                    onChange={(e) =>
                      setSelectedAttendanceForKoreksi({
                        ...selectedAttendanceForKoreksi,
                        jamPulang: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah JP Riil Diakui
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={selectedAttendanceForKoreksi.actualJP ?? selectedAttendanceForKoreksi.jumlahJP}
                  onChange={(e) =>
                    setSelectedAttendanceForKoreksi({
                      ...selectedAttendanceForKoreksi,
                      actualJP: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Koreksi Admin
                </label>
                <input
                  type="text"
                  placeholder="Misal: Hadir mengajar, GPS terkendala sinyal..."
                  value={selectedAttendanceForKoreksi.notes || ''}
                  onChange={(e) =>
                    setSelectedAttendanceForKoreksi({
                      ...selectedAttendanceForKoreksi,
                      notes: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Hapus data absensi mengajar ini?')) {
                      await deleteTeachingAttendance(
                        selectedAttendanceForKoreksi.id,
                        `${selectedAttendanceForKoreksi.subject} (${selectedAttendanceForKoreksi.actualPejuangName})`
                      );
                      setShowKoreksiModal(false);
                    }
                  }}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  Hapus Presensi
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowKoreksiModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                  >
                    Simpan Koreksi
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// SUB-MODAL: FORM JADWAL MENGAJAR
// ----------------------------------------------------------------------
function ScheduleFormModal({
  schedule,
  accounts,
  classes,
  locations,
  onClose,
  onSave,
}: {
  schedule: TeachingSchedule | null;
  accounts: UserAccount[];
  classes: TeachingClass[];
  locations: TeachingLocation[];
  onClose: () => void;
  onSave: (schedule: TeachingSchedule) => Promise<void>;
}) {
  const [formData, setFormData] = useState<Partial<TeachingSchedule>>(() => {
    if (schedule) return { ...schedule };
    return {
      id: `sched_${Date.now()}`,
      pejuangId: accounts[0]?.id || '',
      pejuangName: accounts[0]?.name || '',
      unit: 'SMPIQu',
      classId: classes[0]?.id || '',
      className: classes[0]?.name || '',
      subject: '',
      hari: ['Senin'],
      jamMulai: '07:30',
      jamSelesai: '09:00',
      jumlahJP: 2,
      locationId: locations[0]?.id || '',
      locationName: locations[0]?.name || '',
      berlakuMulai: '2026-01-01',
      isActive: true,
      active: true,
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pejuangId || !formData.subject || !formData.hari || !formData.locationId) {
      alert('Harap lengkapi semua isian wajib.');
      return;
    }

    const selectedTeacher = accounts.find((a) => a.id === formData.pejuangId);
    const selectedClass = classes.find((c) => c.id === formData.classId);
    const selectedLoc = locations.find((l) => l.id === formData.locationId);

    const completeSchedule: TeachingSchedule = {
      id: formData.id || `sched_${Date.now()}`,
      pejuangId: formData.pejuangId,
      pejuangName: selectedTeacher?.name || formData.pejuangName || '',
      unit: formData.unit || 'SMPIQu',
      classId: formData.classId || '',
      className: selectedClass?.name || formData.className || '',
      subject: formData.subject.trim(),
      hari: Array.isArray(formData.hari) ? formData.hari : [formData.hari || 'Senin'],
      jamMulai: formData.jamMulai || '07:30',
      jamSelesai: formData.jamSelesai || '09:00',
      jumlahJP: Number(formData.jumlahJP) || 2,
      locationId: formData.locationId,
      locationName: selectedLoc?.name || formData.locationName || '',
      berlakuMulai: formData.berlakuMulai || formData.startDate || '2026-01-01',
      berlakuSampai: formData.berlakuSampai || formData.endDate || undefined,
      isActive: formData.isActive !== false && formData.active !== false,
      active: formData.active !== false && formData.isActive !== false,
      startDate: formData.startDate || formData.berlakuMulai || undefined,
      endDate: formData.endDate || formData.berlakuSampai || undefined,
    };

    setIsSaving(true);
    try {
      await onSave(completeSchedule);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {schedule ? 'Edit Jadwal Mengajar' : 'Tambah Jadwal Mengajar'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pengajar (Ustadz / Ustadzah) *
            </label>
            <select
              required
              value={formData.pejuangId}
              onChange={(e) => {
                const teacher = accounts.find((a) => a.id === e.target.value);
                setFormData({
                  ...formData,
                  pejuangId: e.target.value,
                  pejuangName: teacher?.name || '',
                });
              }}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
            >
              <option value="">-- Pilih Pengajar --</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.subDivisi || 'Pengajar'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Unit Pendidikan *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="SMPIQu">SMPIQu</option>
                <option value="SMAIQu">SMAIQu</option>
                <option value="SDIQu">SDIQu</option>
                <option value="Tahfidz">Tahfidz</option>
                <option value="Umum">Umum</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ruang / Nama Kelas *
              </label>
              <input
                type="text"
                required
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="Misal: Kelas 7A Putri / Tahfidz 1"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mata Pelajaran (Mapel) *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Misal: Fiqih / Bahasa Arab / Matematika..."
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hari *</label>
              <select
                value={formData.hari}
                onChange={(e) => setFormData({ ...formData, hari: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              >
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'].map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jam Mulai *
              </label>
              <input
                type="time"
                required
                value={formData.jamMulai}
                onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jam Selesai *
              </label>
              <input
                type="time"
                required
                value={formData.jamSelesai}
                onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah JP *
              </label>
              <input
                type="number"
                required
                min={0.5}
                step={0.5}
                value={formData.jumlahJP}
                onChange={(e) => setFormData({ ...formData, jumlahJP: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi Geofence *
              </label>
              <select
                required
                value={formData.locationId}
                onChange={(e) => {
                  const loc = locations.find((l) => l.id === e.target.value);
                  setFormData({
                    ...formData,
                    locationId: e.target.value,
                    locationName: loc?.name || '',
                  });
                }}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="">-- Pilih Lokasi --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.radiusMeters}m)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-MODAL: FORM KELAS
// ----------------------------------------------------------------------
function ClassFormModal({
  item,
  onClose,
  onSave,
}: {
  item: TeachingClass | null;
  onClose: () => void;
  onSave: (data: TeachingClass) => Promise<void>;
}) {
  const [name, setName] = useState(item?.name || '');
  const [unit, setUnit] = useState(item?.unit || 'SMPIQu');
  const [gradeLevel, setGradeLevel] = useState(item?.gradeLevel || '');
  const [description, setDescription] = useState(item?.description || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {item ? 'Edit Kelas' : 'Tambah Kelas Baru'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSave({
              id: item?.id || `cls_${Date.now()}`,
              name: name.trim(),
              unit: unit.trim(),
              gradeLevel: gradeLevel.trim() || undefined,
              description: description.trim() || undefined,
              isActive: item ? item.isActive : true,
            });
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Unit Pendidikan
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
            >
              <option value="SMPIQu">SMPIQu</option>
              <option value="SMAIQu">SMAIQu</option>
              <option value="SDIQu">SDIQu</option>
              <option value="Tahfidz">Tahfidz</option>
              <option value="Umum">Umum</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Kelas *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kelas 7A Putra"
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tingkat / Level (Opsional)
            </label>
            <input
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="Contoh: 7 / 10 / Wustha"
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-MODAL: FORM LOKASI GEOFENCE
// ----------------------------------------------------------------------
function LocationFormModal({
  item,
  onClose,
  onSave,
}: {
  item: TeachingLocation | null;
  onClose: () => void;
  onSave: (data: TeachingLocation) => Promise<void>;
}) {
  const [name, setName] = useState(item?.name || '');
  const [latitude, setLatitude] = useState(item?.latitude ?? -6.758414);
  const [longitude, setLongitude] = useState(item?.longitude ?? 108.513478);
  const [radiusMeters, setRadiusMeters] = useState(item?.radiusMeters ?? 60);
  const [maxAccuracyMeters, setMaxAccuracyMeters] = useState(item?.maxAccuracyMeters ?? 50);
  const [isGettingGps, setIsGettingGps] = useState(false);

  const handleFetchCurrentGps = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsGettingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setIsGettingGps(false);
          alert(`GPS berhasil diperbarui: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        },
        (err) => {
          setIsGettingGps(false);
          alert('Gagal mengambil GPS perangkat. Pastikan izin lokasi aktif.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {item ? 'Edit Lokasi Geofence' : 'Tambah Lokasi Geofence'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSave({
              id: item?.id || `loc_${Date.now()}`,
              name: name.trim(),
              latitude: Number(latitude),
              longitude: Number(longitude),
              radiusMeters: Number(radiusMeters),
              maxAccuracyMeters: Number(maxAccuracyMeters),
              isActive: item ? item.isActive : true,
            });
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lokasi / Gedung *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Gedung SMPIQu Lantai 2"
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px]">
            <span className="text-slate-500">Isi otomatis titik koordinat dari posisi sekarang?</span>
            <button
              type="button"
              onClick={handleFetchCurrentGps}
              disabled={isGettingGps}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold flex items-center space-x-1"
            >
              <Navigation className="w-3 h-3" />
              <span>{isGettingGps ? 'Mencari...' : 'Gunakan GPS Saya'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Radius Geofence (Meter)
              </label>
              <input
                type="number"
                required
                min={10}
                max={500}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Maks Toleransi Akurasi GPS (m)
              </label>
              <input
                type="number"
                required
                min={10}
                max={200}
                value={maxAccuracyMeters}
                onChange={(e) => setMaxAccuracyMeters(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
            >
              Simpan Lokasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
