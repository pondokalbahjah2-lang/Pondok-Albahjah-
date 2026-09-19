import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Users, 
  Sparkles, 
  TrendingUp, 
  CalendarDays,
  ChevronDown,
  Award
} from 'lucide-react';
import { UserAccount, AttendanceRecord, WorkSchedule } from '../types';
import { CircularShiftProgress } from './CircularShiftProgress';

interface MonthlyShiftProgressSectionProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  attendance: AttendanceRecord[];
  schedules?: WorkSchedule[];
  className?: string;
}

export const MonthlyShiftProgressSection: React.FC<MonthlyShiftProgressSectionProps> = ({
  currentUser,
  accounts,
  attendance,
  schedules = [],
  className = '',
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubDivisi, setSelectedSubDivisi] = useState<string>('Semua Divisi');
  const [sortBy, setSortBy] = useState<'highest' | 'lowest' | 'name'>('highest');

  // Month information
  const monthInfo = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const dateObj = new Date(year, month, 1);
    const monthName = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    // Total days in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Working days calculation (excluding Sundays by default, typically 25-26 days)
    let defaultWorkingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      if (d.getDay() !== 0) { // Not Sunday
        defaultWorkingDays++;
      }
    }

    return {
      year,
      month,
      monthName,
      daysInMonth,
      defaultWorkingDays: defaultWorkingDays || 25,
      prefix: selectedMonth,
    };
  }, [selectedMonth]);

  // Extract all sub-divisi for filter
  const allSubDivisions = useMemo(() => {
    const set = new Set<string>();
    accounts.forEach((acc) => {
      if (acc.subDivisi) set.add(acc.subDivisi);
    });
    return ['Semua Divisi', ...Array.from(set).sort()];
  }, [accounts]);

  // Calculate shift progress per user
  const userShiftStats = useMemo(() => {
    const targetMonthPrefix = monthInfo.prefix;

    // Filter active pejuang accounts
    const activePejuang = accounts.filter(acc => acc.role === 'Pejuang' || acc.role === 'Admin');

    return activePejuang.map(pejuang => {
      // Find user's schedule if available
      const userSchedule = schedules.find(s => 
        (s.targetType === 'Individu' && (s.targetId === pejuang.id || s.pejuangIds?.includes(pejuang.id))) ||
        (s.targetType === 'Divisi' && (s.targetName === pejuang.subDivisi || s.targetId === pejuang.subDivisi))
      );

      // Determine target shifts
      let targetShifts = monthInfo.defaultWorkingDays;
      if (userSchedule && userSchedule.hariKerja && userSchedule.hariKerja.length > 0) {
        // Calculate days in month matching work schedule
        const hariMap: Record<number, string> = {
          0: 'Minggu',
          1: 'Senin',
          2: 'Selasa',
          3: 'Rabu',
          4: 'Kamis',
          5: 'Jumat',
          6: 'Sabtu'
        };
        let schedDays = 0;
        for (let day = 1; day <= monthInfo.daysInMonth; day++) {
          const d = new Date(monthInfo.year, monthInfo.month, day);
          const dayName = hariMap[d.getDay()];
          if (userSchedule.hariKerja.includes(dayName)) {
            schedDays++;
          }
        }
        if (schedDays > 0) targetShifts = schedDays;
      }

      // Count attendance in target month
      const userMonthAttendance = attendance.filter(a => 
        (a.pejuangId === pejuang.id || (pejuang.username && a.pejuangName.toLowerCase() === pejuang.name.toLowerCase())) &&
        a.date.startsWith(targetMonthPrefix)
      );

      const hadirCount = userMonthAttendance.filter(a => a.status === 'Hadir').length;
      const terlambatCount = userMonthAttendance.filter(a => a.status === 'Terlambat').length;
      const izinCount = userMonthAttendance.filter(a => a.status === 'Izin').length;
      const sakitCount = userMonthAttendance.filter(a => a.status === 'Sakit').length;
      const liburCount = userMonthAttendance.filter(a => a.status === 'Libur').length;

      const completedShifts = hadirCount + terlambatCount;
      const percentage = targetShifts > 0 ? Math.min(100, Math.round((completedShifts / targetShifts) * 100)) : 0;
      const remainingShifts = Math.max(0, targetShifts - completedShifts);

      // Status classification
      let statusText = 'Mulai Berjalan';
      let statusColor = 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300';
      if (percentage >= 100) {
        statusText = 'Target Tuntas 🌟';
        statusColor = 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300';
      } else if (percentage >= 80) {
        statusText = 'Sangat Baik ✨';
        statusColor = 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300';
      } else if (percentage >= 50) {
        statusText = 'Sesuai Jadwal 🎯';
        statusColor = 'text-blue-700 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300';
      } else if (percentage >= 25) {
        statusText = 'Perlu Dipacu ⏱️';
        statusColor = 'text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300';
      } else {
        statusText = 'Awal Periode 🚀';
        statusColor = 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300';
      }

      return {
        pejuang,
        targetShifts,
        completedShifts,
        hadirCount,
        terlambatCount,
        izinCount,
        sakitCount,
        liburCount,
        remainingShifts,
        percentage,
        statusText,
        statusColor,
      };
    });
  }, [accounts, attendance, schedules, monthInfo]);

  // Overall statistics
  const overallStats = useMemo(() => {
    if (userShiftStats.length === 0) return { avgPercentage: 0, totalCompleted: 0, totalTarget: 0 };
    const totalCompleted = userShiftStats.reduce((acc, u) => acc + u.completedShifts, 0);
    const totalTarget = userShiftStats.reduce((acc, u) => acc + u.targetShifts, 0);
    const avgPercentage = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;
    return { avgPercentage, totalCompleted, totalTarget };
  }, [userShiftStats]);

  // Logged-in user's personal stats
  const currentUserStat = useMemo(() => {
    return userShiftStats.find(u => u.pejuang.id === currentUser.id) || null;
  }, [userShiftStats, currentUser.id]);

  // Filtered and sorted pejuang for the team view
  const filteredPejuangStats = useMemo(() => {
    return userShiftStats
      .filter(item => {
        // Sub divisi filter
        if (selectedSubDivisi !== 'Semua Divisi' && item.pejuang.subDivisi !== selectedSubDivisi) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.pejuang.name.toLowerCase().includes(q);
          const matchDiv = (item.pejuang.subDivisi || '').toLowerCase().includes(q);
          return matchName || matchDiv;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest') return b.percentage - a.percentage;
        if (sortBy === 'lowest') return a.percentage - b.percentage;
        return a.pejuang.name.localeCompare(b.pejuang.name);
      });
  }, [userShiftStats, selectedSubDivisi, searchQuery, sortBy]);

  const isAdminOrLeader = currentUser.role === 'Admin' || Boolean((currentUser.amanah || '').toLowerCase().match(/ketua|kepala|manajer|manager|koordinator/));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. HERO CARD: PERSONAL MONTHLY SHIFT PROGRESS (For current user) */}
      {currentUserStat && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            {/* Left Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Target Shift Saya
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {monthInfo.monthName}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Progres Kehadiran Shift Bulanan
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Capaian presensi shift kerja Anda bulan ini berdasarkan jadwal dinas Pondok Pesantren Al-Bahjah.
              </p>

              {/* Quick Metrics Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                    <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
                    Target Shift
                  </div>
                  <div className="text-xl font-black text-slate-800 dark:text-white">
                    {currentUserStat.targetShifts} <span className="text-xs font-normal text-slate-400">Hari</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Tepat Waktu
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {currentUserStat.hadirCount} <span className="text-xs font-normal text-slate-400">Shift</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Terlambat
                  </div>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {currentUserStat.terlambatCount} <span className="text-xs font-normal text-slate-400">Shift</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                    Sisa Target
                  </div>
                  <div className="text-xl font-black text-slate-800 dark:text-white">
                    {currentUserStat.remainingShifts} <span className="text-xs font-normal text-slate-400">Shift</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-lg shrink-0">
              <CircularShiftProgress
                percentage={currentUserStat.percentage}
                completedShifts={currentUserStat.completedShifts}
                targetShifts={currentUserStat.targetShifts}
                size={160}
                strokeWidth={14}
              />
              <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${currentUserStat.statusColor}`}>
                {currentUserStat.statusText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEAM / ALL USERS SHIFT PROGRESS (For Admin & Leaders, or team visibility) */}
      {isAdminOrLeader && (
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/40">
          {/* Header & Overall Metric */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                  Progres Kehadiran Shift Pejuang (Bulan Ini)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitoring persentase penyelesaian target shift seluruh pejuang pada {monthInfo.monthName}.
              </p>
            </div>

            {/* Average Completion Circular Gauge */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/70 px-4 py-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <CircularShiftProgress
                percentage={overallStats.avgPercentage}
                completedShifts={overallStats.totalCompleted}
                targetShifts={overallStats.totalTarget}
                size={64}
                strokeWidth={7}
              />
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Rata-rata Pondok
                </span>
                <p className="text-base font-black text-slate-800 dark:text-white">
                  {overallStats.avgPercentage}% Tercapai
                </p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {overallStats.totalCompleted} dari {overallStats.totalTarget} Total Shift
                </span>
              </div>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 pb-2">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pejuang atau divisi..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Sub Divisi Filter */}
            <div className="relative w-full sm:w-auto shrink-0">
              <select
                value={selectedSubDivisi}
                onChange={(e) => setSelectedSubDivisi(e.target.value)}
                className="w-full sm:w-48 appearance-none px-3.5 py-2 pr-8 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                {allSubDivisions.map((div) => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Filter */}
            <div className="relative w-full sm:w-auto shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'highest' | 'lowest' | 'name')}
                className="w-full sm:w-44 appearance-none px-3.5 py-2 pr-8 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="highest">Persentase Tertinggi</option>
                <option value="lowest">Persentase Terendah</option>
                <option value="name">Urut Nama (A-Z)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Grid of Pejuang Circular Shift Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            <AnimatePresence>
              {filteredPejuangStats.map((item) => (
                <motion.div
                  key={item.pejuang.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100/90 dark:hover:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                        {item.pejuang.avatarUrl ? (
                          <img src={item.pejuang.avatarUrl} alt={item.pejuang.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          item.pejuang.name.charAt(0)
                        )}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {item.pejuang.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                          {item.pejuang.subDivisi || 'Divisi Umum'}
                        </span>
                      </div>
                    </div>

                    {/* Circular Progress Gauge */}
                    <div className="shrink-0">
                      <CircularShiftProgress
                        percentage={item.percentage}
                        completedShifts={item.completedShifts}
                        targetShifts={item.targetShifts}
                        size={60}
                        strokeWidth={6}
                      />
                    </div>
                  </div>

                  {/* Shift Counts Breakdown */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50 grid grid-cols-3 text-center gap-1">
                    <div className="p-1 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30">
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-medium">Hadir</span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{item.hadirCount}</span>
                    </div>
                    <div className="p-1 rounded-lg bg-amber-50/50 dark:bg-amber-950/30">
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 block font-medium">Telat</span>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{item.terlambatCount}</span>
                    </div>
                    <div className="p-1 rounded-lg bg-blue-50/50 dark:bg-blue-950/30">
                      <span className="text-[9px] text-blue-600 dark:text-blue-400 block font-medium">Sisa</span>
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{item.remainingShifts}</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.statusColor}`}>
                      {item.statusText}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Target: {item.targetShifts} Shift
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredPejuangStats.length === 0 && (
            <div className="text-center py-10">
              <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-500">Tidak ada pejuang yang sesuai dengan kriteria pencarian.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
