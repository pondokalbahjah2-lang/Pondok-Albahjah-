import { getLocalDateString } from '../utils/dateUtils';
import React, { useState } from 'react';
import {
  PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart as RechartsLineChart, Line
} from 'recharts';
import {
  X,
  Users,
  Clock,
  HeartPulse,
  Palmtree,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronRight,
  TrendingUp,
  MapPin,
  FileCheck,
  ShieldCheck,
  UserCheck,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3 as BarChartIcon,
  LineChart as LineChartIcon,
  Calendar as CalendarIcon
} from 'lucide-react';
import {
  UserAccount,
  AttendanceRecord,
  ExitPermissionRecord,
  LeaveRequestRecord,
  WarningLetterRecord,
  ManhajiyyahClause
} from '../types';
import { getDailyClauseIndex } from '../utils/hijriCalendar';
import { PrayerTimesWidget } from './PrayerTimesWidget';
import { AdminQRGenerator } from './AdminQRGenerator';

interface DashboardViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  attendance: AttendanceRecord[];
  exitPermissions: ExitPermissionRecord[];
  leaveRequests: LeaveRequestRecord[];
  warningLetters: WarningLetterRecord[];
  manhajiyyahClauses: ManhajiyyahClause[];
  broadcastMessage?: string;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  accounts,
  attendance,
  exitPermissions,
  leaveRequests,
  warningLetters,
  manhajiyyahClauses,
  broadcastMessage,
  onNavigate,
}) => {
  const dailyClauseIndex = getDailyClauseIndex(manhajiyyahClauses?.length || 0, new Date());
  const clauseToday = manhajiyyahClauses ? (manhajiyyahClauses[dailyClauseIndex] || manhajiyyahClauses[0]) : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeWarning, setActiveWarning] = useState<WarningLetterRecord | null>(null);

  React.useEffect(() => {
    if (currentUser.role === 'Pejuang') {
      const myWarnings = warningLetters.filter(w => w.pejuangId === currentUser.id);
      if (myWarnings.length > 0) {
        // Sort descending
        myWarnings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latest = myWarnings[0];
        const isDismissed = localStorage.getItem(`dismissedWarning_${latest.id}`);
        if (!isDismissed) {
          setActiveWarning(latest);
        }
      }
    }
  }, [warningLetters, currentUser]);

  const dismissWarning = () => {
    if (activeWarning) {
      localStorage.setItem(`dismissedWarning_${activeWarning.id}`, 'true');
      setActiveWarning(null);
    }
  };

  const [selectedSubDivisi, setSelectedSubDivisi] = useState('Semua');

  const pejuangList = React.useMemo(() => accounts.filter((a) => a.role === 'Pejuang'), [accounts]);
  
  const subDivisiList: string[] = React.useMemo(() => [
    'Semua',
    ...(Array.from(new Set(pejuangList.map((a) => a.subDivisi))) as string[]),
  ], [pejuangList]);

  // Metric Calculations
  const metrics = React.useMemo(() => {
    let totalIzinKeluar = exitPermissions.length;
    let totalSakit = 0;
    let totalLibur = 0;
    let totalHadirTepatWaktu = 0;
    let totalTerlambatHadir = 0;

    for (let i = 0; i < attendance.length; i++) {
      const status = attendance[i].status;
      if (status === 'Sakit') totalSakit++;
      else if (status === 'Libur') totalLibur++;
      else if (status === 'Hadir') totalHadirTepatWaktu++;
      else if (status === 'Terlambat') totalTerlambatHadir++;
    }

    let totalMengajukanCuti = 0;
    let totalSedangCuti = 0;
    for (let i = 0; i < leaveRequests.length; i++) {
      const status = leaveRequests[i].status;
      if (status === 'Menunggu Persetujuan') totalMengajukanCuti++;
      else if (status === 'Sedang Cuti') totalSedangCuti++;
    }

    return {
      totalPejuang: pejuangList.length,
      totalIzinKeluar,
      totalSakit,
      totalLibur,
      totalHadirTepatWaktu,
      totalTerlambatHadir,
      totalMengajukanCuti,
      totalSedangCuti
    };
  }, [pejuangList.length, exitPermissions.length, attendance, leaveRequests]);

  const {
    totalPejuang,
    totalIzinKeluar,
    totalSakit,
    totalLibur,
    totalHadirTepatWaktu,
    totalTerlambatHadir,
    totalMengajukanCuti,
    totalSedangCuti
  } = metrics;

  // Compute frequent exit permit request count per pejuang
  const { topExitPejuangs, chartDataDivisi } = React.useMemo(() => {
    const exitCountMap: Record<string, { name: string; subDivisi: string; count: number; lateCount: number }> = {};

    exitPermissions.forEach((ep) => {
      if (!exitCountMap[ep.pejuangId]) {
        exitCountMap[ep.pejuangId] = {
          name: ep.pejuangName,
          subDivisi: ep.subDivisi,
          count: 0,
          lateCount: 0,
        };
      }
      exitCountMap[ep.pejuangId].count += 1;
      if (ep.status === 'Terlambat') {
        exitCountMap[ep.pejuangId].lateCount += 1;
      }
    });

    const topExits = Object.values(exitCountMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Prepare data for "Kehadiran vs Izin per Divisi" Chart
    const divStats: Record<string, { divisi: string; hadir: number; izin: number }> = {};
    pejuangList.forEach((p) => {
      if (!divStats[p.subDivisi]) {
        divStats[p.subDivisi] = { divisi: p.subDivisi, hadir: 0, izin: 0 };
      }
    });

    attendance.forEach((a) => {
      if (divStats[a.subDivisi] && (a.status === 'Hadir' || a.status === 'Terlambat')) {
        divStats[a.subDivisi].hadir += 1;
      }
    });

    exitPermissions.forEach((ep) => {
      if (divStats[ep.subDivisi]) {
        divStats[ep.subDivisi].izin += 1;
      }
    });

    const chartData = Object.values(divStats);
    
    return { topExitPejuangs: topExits, chartDataDivisi: chartData };
  }, [exitPermissions, pejuangList, attendance]);
  // --- Chart Data Processing ---
  const pieData = React.useMemo(() => [
    { name: 'Hadir', value: totalHadirTepatWaktu, color: '#10b981' },
    { name: 'Terlambat', value: totalTerlambatHadir, color: '#f59e0b' },
    { name: 'Sakit', value: totalSakit, color: '#f43f5e' },
    { name: 'Libur', value: totalLibur, color: '#a855f7' },
    { name: 'Cuti', value: totalSedangCuti, color: '#6366f1' },
  ].filter(d => d.value > 0), [totalHadirTepatWaktu, totalTerlambatHadir, totalSakit, totalLibur, totalSedangCuti]);

  const frequentExitList = topExitPejuangs;
  const barData = chartDataDivisi.filter(d => d.hadir > 0 || d.izin > 0);

    // Current User Weekly Attendance Consistency Trend
  const weeklyAttendanceData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      
      const dayRecords = attendance.filter(a => a.pejuangId === currentUser.id && a.date === dateStr);
      let statusValue = 0; // 0 = No Record/Sakit/Libur, 1 = Terlambat, 2 = Hadir
      
      if (dayRecords.length > 0) {
        const latest = dayRecords[0]; // Assuming newest first
        if (latest.status === 'Hadir') statusValue = 2;
        else if (latest.status === 'Terlambat') statusValue = 1;
      }
      
      data.push({
        name: dayName,
        konsistensi: statusValue,
      });
    }
    return data;
  }, [attendance, currentUser.id]);


  // Weekly Stats for current user
  // Today's specific attendance for current user
  const myTodayRecord = React.useMemo(() => {
    if (currentUser.role !== 'Pejuang') return null;
    const todayStr = getLocalDateString(new Date());
    return attendance.find(a => a.pejuangId === currentUser.id && a.date === todayStr) || null;
  }, [attendance, currentUser.id, currentUser.role]);

  const myWeeklyStats = React.useMemo(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    let totalHadir = 0;
    let totalIzin = 0;
    let totalCuti = 0;

    // Filter attendance in last 7 days
    attendance.forEach(a => {
      if (a.pejuangId === currentUser.id) {
        const d = new Date(a.date);
        if (d >= lastWeek && d <= today) {
          if (a.status === 'Hadir' || a.status === 'Terlambat') {
            totalHadir++;
          }
        }
      }
    });

    // Filter izin in last 7 days
    exitPermissions.forEach(e => {
      if (e.pejuangId === currentUser.id && e.status === 'Disetujui') {
        const d = new Date(e.tanggalKeluar);
        if (d >= lastWeek && d <= today) {
          totalIzin++;
        }
      }
    });

    // Filter cuti in last 7 days
    leaveRequests.forEach(l => {
      if (l.pejuangId === currentUser.id && l.status === 'Disetujui') {
        const d = new Date(l.tanggalMulai);
        const end = new Date(l.tanggalSelesai);
        if (end >= lastWeek && d <= today) {
          totalCuti++;
        }
      }
    });

    return { totalHadir, totalIzin, totalCuti };
  }, [attendance, exitPermissions, leaveRequests, currentUser.id]);

  // Today's Attendance Statistics
  const todayStats = React.useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    const pejuangs = accounts.filter(a => a.role === 'Pejuang');
    const totalPejuang = pejuangs.length;
    
    const todayAttendance = attendance.filter(a => a.date === todayStr);
    const hadir = todayAttendance.filter(a => a.status === 'Hadir').length;
    const terlambat = todayAttendance.filter(a => a.status === 'Terlambat').length;
    // To find out who hasn't clocked in, we check who isn't in todayAttendance
    const attendeesIds = new Set(todayAttendance.map(a => a.pejuangId));
    const belumAbsen = pejuangs.filter(p => !attendeesIds.has(p.id)).length;
    
    return { total: totalPejuang, hadir, terlambat, belumAbsen };
  }, [accounts, attendance]);

  
  // --- New Logic: Hari Ini & Efektif Bulanan ---
  const todayDateStr = getLocalDateString(new Date());
  
  // List Pejuang Terlambat Hari Ini
  const pejuangTerlambatHadir = React.useMemo(() => {
    return attendance.filter(a => a.date === todayDateStr && a.status === 'Terlambat');
  }, [attendance, todayDateStr]);

  // List Pejuang Sedang Cuti Hari Ini
  const pejuangCutiHariIni = React.useMemo(() => {
    return leaveRequests.filter(l => l.status === 'Disetujui' && l.tanggalMulai <= todayDateStr && l.tanggalSelesai >= todayDateStr);
  }, [leaveRequests, todayDateStr]);

  // List Pejuang Sedang Izin Keluar Hari Ini
  const pejuangIzinHariIni = React.useMemo(() => {
    return exitPermissions.filter(e => e.tanggalKeluar <= todayDateStr && e.tanggalIzinSampai >= todayDateStr && e.status === 'Disetujui');
  }, [exitPermissions, todayDateStr]);

  // Total Jam Kerja Efektif Bulanan (Bulan Ini)
  const efektifBulanan = React.useMemo(() => {
    const currentMonthPrefix = todayDateStr.substring(0, 7); // YYYY-MM
    const attBulanIni = attendance.filter(a => a.date.startsWith(currentMonthPrefix));
    
    const jamKerja: Record<string, number> = {}; // pejuangId -> total minutes
    
    attBulanIni.forEach(att => {
      if (!att.time || !att.timePulang) return;
      if (['Sakit', 'Libur', 'Cuti', 'Tidak Absen Pulang', '-'].includes(att.timePulang)) return;
      if (['Sakit', 'Libur', 'Cuti', '-'].includes(att.time)) return;

      const [hIn, mIn] = att.time.split(':').map(Number);
      const [hOut, mOut] = att.timePulang.split(':').map(Number);
      
      if (!isNaN(hIn) && !isNaN(mIn) && !isNaN(hOut) && !isNaN(mOut)) {
        let diff = (hOut * 60 + mOut) - (hIn * 60 + mIn);
        if (diff > 0) {
          jamKerja[att.pejuangId] = (jamKerja[att.pejuangId] || 0) + diff;
        }
      }
    });
    
    // Sort pejuang by highest effective hours
    const sortedPejuang = Object.entries(jamKerja).map(([id, mins]) => {
      const p = accounts.find(a => a.id === id);
      return {
        id,
        name: p ? p.name : 'Unknown',
        subDivisi: p ? p.subDivisi : '-',
        totalHours: (mins / 60).toFixed(1),
        totalMins: mins
      };
    }).sort((a, b) => b.totalMins - a.totalMins);

    return sortedPejuang;
  }, [attendance, todayDateStr, accounts]);

  // 30 Days Trend Percentage Calculation
  const monthlyKehadiranPercentage = React.useMemo(() => {
    const data = [];
    const today = new Date();
    const activePejuangs = accounts.filter(a => a.role === 'Pejuang').length;
    if (activePejuangs === 0) return []; // avoid division by zero

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      
      const dayRecords = attendance.filter(a => a.date === dateStr && (a.status === 'Hadir' || a.status === 'Terlambat'));
      // Using unique pejuang count who attended that day
      const uniqueAttendees = new Set(dayRecords.map(a => a.pejuangId)).size;
      const percentage = Math.round((uniqueAttendees / activePejuangs) * 100);
      
      data.push({
        name: dayName,
        persentase: percentage,
      });
    }
    return data;
  }, [attendance, accounts]);

  // 6 Months Trend Real Data Calculation
  const monthsArr = [];
  const trendData = [];
  const today = new Date();
  
  // Weekly Trend Data for Current Month (Hadir vs Izin)
  const weeklyKehadiranData = React.useMemo(() => {
    const data = [];
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Divide current month into 4 weeks roughly
    for (let i = 1; i <= 4; i++) {
      const startDay = (i - 1) * 7 + 1;
      const endDay = i === 4 ? new Date(currentYear, currentMonth + 1, 0).getDate() : i * 7;
      
      let hadirCount = 0;
      let izinCount = 0;

      // Ensure zero-padding for matching string dates
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      
      attendance.forEach(a => {
        if (!a.date) return;
        const [y, m, d] = a.date.split('-');
        if (parseInt(y) === currentYear && parseInt(m) === currentMonth + 1) {
          const day = parseInt(d);
          if (day >= startDay && day <= endDay && (a.status === 'Hadir' || a.status === 'Terlambat')) {
            hadirCount++;
          }
        }
      });

      exitPermissions.forEach(e => {
        if (!e.tanggalKeluar) return;
        const [y, m, d] = e.tanggalKeluar.split('-');
        if (parseInt(y) === currentYear && parseInt(m) === currentMonth + 1) {
          const day = parseInt(d);
          if (day >= startDay && day <= endDay) {
            izinCount++;
          }
        }
      });

      data.push({
        name: `Minggu ${i}`,
        hadir: hadirCount,
        izin: izinCount
      });
    }
    return data;
  }, [attendance, exitPermissions]);

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = d.toLocaleString('id-ID', { month: 'short' });
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // e.g. "2026-08"

    const hadirTepat = attendance.filter(a => a.date?.startsWith(yearMonth) && a.status === 'Hadir').length;
    const terlambat = attendance.filter(a => a.date?.startsWith(yearMonth) && a.status === 'Terlambat').length;
    const cuti = leaveRequests.filter(l => l.tanggalMulai?.startsWith(yearMonth)).length;
    const izin = exitPermissions.filter(e => e.tanggalKeluar?.startsWith(yearMonth)).length;

    trendData.push({
      name: monthName,
      hadirTepat,
      terlambat,
      cuti,
      izin,
    });
  }

  // Filter Pejuang for table view
  const filteredPejuang = pejuangList.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.amanah?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivisi =
      selectedSubDivisi === 'Semua' || p.subDivisi === selectedSubDivisi;
    return matchesSearch && matchesDivisi;
  });

  return (
    <div className="space-y-6">

      {/* Warning Letter Popup */}
      {activeWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl relative border-t-8 border-rose-500 animate-in fade-in zoom-in duration-300">
            <button onClick={dismissWarning} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Peringatan Baru!</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Anda menerima <strong>Surat Teguran</strong> baru dari Admin pada tanggal {activeWarning.date}.
            </p>
            <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 mb-6">
              <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 mb-1">Tingkat Teguran:</h4>
              <p className="text-sm text-slate-800 dark:text-slate-200 mb-3">{activeWarning.warningLevel}</p>
              
              <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 mb-1">Alasan/Pelanggaran:</h4>
              <p className="text-sm text-slate-800 dark:text-slate-200">{activeWarning.reason}</p>
            </div>
            <button 
              onClick={dismissWarning}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Message */}
      {broadcastMessage && (
        <div className="bg-emerald-500 text-white rounded-2xl p-4 shadow-md flex items-start gap-3 relative animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Pengumuman dari Admin</h4>
            <p className="text-xs mt-1">{broadcastMessage}</p>
          </div>
        </div>
      )}

      {/* Weekly Stats for Pejuang */}
      {currentUser.role === 'Pejuang' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Jam Masuk (Hari Ini)</p>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">
                    {myTodayRecord ? myTodayRecord.time : '--:--'} WIB
                  </h4>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${myTodayRecord ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                {myTodayRecord ? (myTodayRecord.status === 'Terlambat' ? 'Terlambat' : 'Sudah Absen') : 'Belum Absen'}
              </span>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Jam Pulang (Hari Ini)</p>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">
                    {myTodayRecord && myTodayRecord.timePulang ? myTodayRecord.timePulang : '--:--'} WIB
                  </h4>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${myTodayRecord && myTodayRecord.timePulang ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                {myTodayRecord && myTodayRecord.timePulang ? 'Selesai' : 'Belum Pulang'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Hadir (7 Hari)</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{myWeeklyStats.totalHadir} Hari</h4>
            </div>
          </div>
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Izin (7 Hari)</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{myWeeklyStats.totalIzin} Kali</h4>
            </div>
          </div>
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Cuti (7 Hari)</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{myWeeklyStats.totalCuti} Pengajuan</h4>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Welcome & Pasal Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-inner flex-shrink-0">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <span className="text-xl font-bold uppercase">{currentUser.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Assalamu’alaikum, {currentUser.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Amanah: {currentUser.amanah} ({currentUser.subDivisi})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 rounded-lg p-2 max-w-md">
            <div className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
              Pasal Manhajiyyah Hari Ini:
            </div>
            {clauseToday ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 line-clamp-2" title={clauseToday.content}>
                <strong>Pasal {clauseToday.pasalNumber}: {clauseToday.title}</strong> - "{clauseToday.content}"
              </p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Memuat Pasal Manhajiyyah...
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Prayer Times Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={currentUser.role === 'Admin' ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <PrayerTimesWidget />
        </div>
        {currentUser.role === 'Admin' && (
          <div className="lg:col-span-1 h-full">
            <AdminQRGenerator />
          </div>
        )}
      </div>

      
      {/* Quick Actions (Pejuang) */}
      {currentUser.role === 'Pejuang' && (
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('izin')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Request Izin</span>
          </button>
          <button
            onClick={() => onNavigate('cuti')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2">
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Submit Cuti</span>
          </button>
          <button
            onClick={() => onNavigate('ubar')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <FileCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">View Slip Ubar</span>
          </button>
        </div>
      )}

      {/* Attendance Summary Circular Progress */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Tingkat Kehadiran Harian</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ringkasan absensi seluruh pejuang (Hadir & Terlambat).</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * (totalPejuang > 0 ? Math.round(((totalHadirTepatWaktu + totalTerlambatHadir) / totalPejuang) * 100) : 0)) / 100}
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-800 dark:text-white">
                {totalPejuang > 0 ? Math.round(((totalHadirTepatWaktu + totalTerlambatHadir) / totalPejuang) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Telah Absen ({totalHadirTepatWaktu + totalTerlambatHadir})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Belum Absen ({totalPejuang - (totalHadirTepatWaktu + totalTerlambatHadir)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Metrics Overview Cards (Grid of iOS Glass Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Pejuang */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Pejuang
            </span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            {totalPejuang}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Pejuang Terdaftar
          </div>
        </div>

        {/* Hadir Tepat Waktu */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Hadir Tepat
            </span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalHadirTepatWaktu}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Absen Tepat Waktu
          </div>
        </div>

        {/* Terlambat Hadir */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Terlambat Hadir
            </span>
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {totalTerlambatHadir}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Melewati Jam Masuk
          </div>
        </div>

        {/* Total Izin Keluar */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Izin Keluar
            </span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalIzinKeluar}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Rekap Keluar Pondok
          </div>
        </div>

        {/* Total Sakit */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Pejuang Sakit
            </span>
            <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {totalSakit}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Dalam Perawatan
          </div>
        </div>

        {/* Total Libur */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Total Libur
            </span>
            <div className="p-2 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Palmtree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            {totalLibur}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Jadwal Libur
          </div>
        </div>

        {/* Mengajukan Cuti */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Pengajuan Cuti
            </span>
            <div className="p-2 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
            {totalMengajukanCuti}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Menunggu Persetujuan
          </div>
        </div>

        {/* Sedang Cuti */}
        <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Sedang Cuti
            </span>
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {totalSedangCuti}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Cuti Disetujui
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Weekly Attendance Trends (Current Month) */}
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Tren Kehadiran Mingguan (Bulan Ini)</h3>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={weeklyKehadiranData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="hadir" name="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="izin" name="Izin" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Attendance Status */}
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Status Kehadiran Hari Ini</h3>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Attendance & Izin by Sub Divisi */}
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BarChartIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Kehadiran vs Izin per Divisi</h3>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={barData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="hadir" name="Kehadiran" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="izin" name="Izin Keluar" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Punctuality Trend (6 Months) */}
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <LineChartIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Tren Ketepatan Waktu (6 Bulan)</h3>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="hadirTepat" name="Hadir Tepat Waktu" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="terlambat" name="Terlambat" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Leave & Exit Permission Trend (6 Months) */}
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Tren Cuti & Izin Keluar (6 Bulan)</h3>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="cuti" name="Cuti" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="izin" name="Izin Keluar" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

            
        {/* Line Chart: 30 Days Attendance Percentage Trend */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <LineChartIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Tren Persentase Kehadiran (30 Hari Terakhir)</h3>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={monthlyKehadiranPercentage}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]} 
                  tickFormatter={(val) => `${val}%`} 
                />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Tingkat Kehadiran']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="persentase" name="Tingkat Kehadiran (%)" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

            {/* Current User Weekly Attendance Consistency Trend */}
      <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <LineChartIcon className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Tren Konsistensi Kehadiran Mingguan (Anda)</h3>
        </div>
        <div className="flex-1 min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={weeklyAttendanceData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 2]} 
                ticks={[0, 1, 2]} 
                tickFormatter={(val) => val === 2 ? 'Hadir' : val === 1 ? 'Telat' : 'Absen'}
              />
              <RechartsTooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [value === 2 ? 'Hadir Tepat Waktu' : value === 1 ? 'Terlambat' : 'Tidak Hadir/Lainnya', 'Status']}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Line type="stepAfter" dataKey="konsistensi" name="Konsistensi" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: List Pejuang Frequent Exit + List Pejuang & Amanah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List Pejuang Sering Izin Keluar */}
        <div className="lg:col-span-1 p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Pejuang Sering Izin Keluar
              </h2>
            </div>
            <button
              onClick={() => onNavigate('izin')}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {frequentExitList.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Belum ada data izin keluar recorded
              </p>
            ) : (
              frequentExitList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.subDivisi}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      {item.count}x Izin
                    </span>
                    {item.lateCount > 0 && (
                      <div className="text-[10px] text-rose-500 font-semibold mt-0.5">
                        {item.lateCount}x Terlambat
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Daftar Nama Pejuang & Amanah */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Daftar Pejuang & Amanah Divisi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan {filteredPejuang.length} dari {pejuangList.length} pejuang
              </p>
            </div>

            {/* Filter Sub Divisi Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1">
              {subDivisiList.slice(0, 5).map((div) => (
                <button
                  key={div}
                  onClick={() => setSelectedSubDivisi(div)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                    selectedSubDivisi === div
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pejuang atau amanah..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          {/* Table List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Nama Pejuang</th>
                  <th className="py-2.5 px-3">Sub Divisi</th>
                  <th className="py-2.5 px-3">Amanah</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredPejuang.slice(0, 8).map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-slate-800 dark:text-slate-100">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        {p.subDivisi}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {p.amanah}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('laporan')}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                        title="Lihat Laporan"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
