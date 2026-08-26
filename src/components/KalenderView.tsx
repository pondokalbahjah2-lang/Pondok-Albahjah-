import { getLocalDateString } from '../utils/dateUtils';
import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Palmtree,
  Users,
  Info,
  X
} from 'lucide-react';
import { LeaveRequestRecord, UserAccount } from '../types';
import { getHijriDate } from '../utils/hijriCalendar';

interface KalenderViewProps {
  leaveRequests: LeaveRequestRecord[];
  accounts: UserAccount[];
  currentUser: UserAccount;
}

export const KalenderView: React.FC<KalenderViewProps> = ({ leaveRequests, accounts, currentUser }) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<{ [key: string]: string } | null>(null);
  const [isLoadingPrayer, setIsLoadingPrayer] = useState(false);
  const [divisiFilter, setDivisiFilter] = useState('Semua');

  const subDivisiList = React.useMemo(() => {
    return ['Semua', ...Array.from(new Set(accounts.filter(a => a.role === 'Pejuang' && a.subDivisi).map(a => a.subDivisi)))];
  }, [accounts]);

  React.useEffect(() => {
    const fetchPrayerTimes = async () => {
      setIsLoadingPrayer(true);
      try {
        const res = await fetch('/api/prayer-times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: 'Cirebon' })
        });
        const data = await res.json();
        if (res.ok && data.Subuh) {
          setPrayerTimes(data);
        }
      } catch (err) {
        console.error('Failed to fetch prayer times via Gemini', err);
      } finally {
        setIsLoadingPrayer(false);
      }
    };
    fetchPrayerTimes();
  }, []);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0: Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  // Blank padding cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(new Date(year, month, day));
  }

  // Get pejuang on cuti for a given date
  const getPejuangOnLeaveForDate = (d: Date) => {
    const dateStr = getLocalDateString(d);
    return leaveRequests.filter((l) => {
      const isApprovedOrPending =
        l.status === 'Disetujui' ||
        l.status === 'Sedang Cuti' ||
        l.status === 'Menunggu Persetujuan' ||
        l.status === 'Selesai';
      const isWithinDate =
        dateStr >= l.tanggalMulai && dateStr <= l.tanggalSelesai;
      
      let matchesDivisi = true;
      if (divisiFilter !== 'Semua') {
        const pejuang = accounts.find(a => a.id === l.pejuangId);
        if (pejuang && pejuang.subDivisi !== divisiFilter) {
          matchesDivisi = false;
        }
      }

      return isApprovedOrPending && isWithinDate && matchesDivisi;
    });
  };

  const pejuangOnLeaveForSelectedDay = selectedDayDate
    ? getPejuangOnLeaveForDate(selectedDayDate)
    : [];

  const handleDayClick = (cellDate: Date) => {
    setSelectedDayDate(cellDate);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Kalender Kehadiran & Jadwal Cuti Pondok</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
            Kalender Hijriyah & Masehi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Penanggalan Masehi & Hijriyah berdampingan beserta daftar Pejuang yang sedang Cuti
          </p>
        </div>

        {currentUser.role === 'Admin' && (
          <div className="flex items-center bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 whitespace-nowrap">Divisi:</span>
            <select
              value={divisiFilter}
              onChange={(e) => setDivisiFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {subDivisiList.map(sd => (
                <option key={sd} value={sd}>{sd}</option>
              ))}
            </select>
          </div>
        )}


        {/* Gemini Search Grounded Prayer Times */}
        <div className="hidden lg:flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mr-2 flex items-center">
             Jadwal Sholat Cirebon (Google Search):
          </div>
          {isLoadingPrayer ? (
            <div className="animate-pulse bg-emerald-200/50 dark:bg-emerald-800/50 h-5 w-48 rounded-md"></div>
          ) : prayerTimes ? (
            <div className="flex space-x-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].map(p => (
                 <span key={p} className="flex items-center space-x-1">
                   <span className="opacity-70 uppercase text-[9px]">{p}</span>
                   <span>{prayerTimes[p]}</span>
                 </span>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500">Tidak tersedia</div>
          )}
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-xs px-3 text-slate-800 dark:text-slate-100 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        {/* Calendar Grid Container */}
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-emerald-700 dark:text-emerald-400 uppercase py-2 border-b border-slate-200 dark:border-slate-800">
            <div>Minggu</div>
            <div>Senin</div>
            <div>Selasa</div>
            <div>Rabu</div>
            <div>Kamis</div>
            <div>Jumat</div>
            <div>Sabtu</div>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cellDate, idx) => {
              if (!cellDate) {
                return (
                  <div
                    key={`blank-${idx}`}
                    className="h-20 sm:h-24 rounded-2xl bg-slate-100/30 dark:bg-slate-800/20"
                  />
                );
              }

              const hijri = getHijriDate(cellDate);
              const pejuangLeaves = getPejuangOnLeaveForDate(cellDate);
              const isSelected =
                selectedDayDate &&
                cellDate.toDateString() === selectedDayDate.toDateString();
              const isToday =
                cellDate.toDateString() === new Date().toDateString();

              return (
                <div
                  key={cellDate.toISOString()}
                  onClick={() => handleDayClick(cellDate)}
                  className={`h-24 sm:h-28 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col overflow-hidden relative ${
                    isSelected
                      ? 'bg-emerald-600/10 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : isToday
                      ? 'bg-amber-500/10 border-amber-400 dark:border-amber-500/40'
                      : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-400'
                  }`}
                >
                  {/* Top Day Header: Masehi + Hijri Day */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-black text-xs sm:text-base ${
                        isToday
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {cellDate.getDate()}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {hijri.day} {hijri.monthName.split(' ')[0]}
                    </span>
                  </div>

                  {/* Badges for Pejuang Cuti */}
                  <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1">
                    {pejuangLeaves.map(l => {
                      const isPending = l.status === 'Menunggu Persetujuan';
                      return (
                        <div key={l.id} className={`px-1.5 py-0.5 rounded-md font-bold text-[8px] sm:text-[9px] truncate ${
                          isPending 
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30' 
                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                        }`}>
                          {l.pejuangName.split(' ')[0]} {isPending ? '(?)' : ''}
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Inspector Modal */}
      {isModalOpen && selectedDayDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Detail Jadwal Cuti</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 -mr-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border border-emerald-500/20">
                <div className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  {selectedDayDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-300 mt-1">
                  {getHijriDate(selectedDayDate).formatted}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Daftar Pejuang Cuti Pada Tanggal Ini
                </h3>

                {pejuangOnLeaveForSelectedDay.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400 italic border border-slate-100 dark:border-slate-800">
                    Tidak ada pejuang yang mengajukan atau sedang cuti pada tanggal ini.
                  </div>
                ) : (
                  pejuangOnLeaveForSelectedDay.map((l) => (
                    <div
                      key={l.id}
                      className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 space-y-2 relative"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-bold text-sm text-amber-900 dark:text-amber-100">
                            {l.pejuangName}
                          </div>
                          <div className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                            {l.subDivisi}
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${l.status === 'Menunggu Persetujuan' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                          {l.status}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1">
                        "{l.alasan}"
                      </div>
                      <div className="text-[10px] text-amber-600/80 dark:text-amber-300/80 font-semibold border-t border-amber-100 dark:border-amber-800 pt-2 mt-2">
                        Durasi: {l.tanggalMulai} s/d {l.tanggalSelesai} ({l.totalHari} Hari)
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[10px] text-slate-500">
              <p className="flex items-center justify-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-500" />
                <span>Kalender Hijriyah menyesuaikan parameter lokal.</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

