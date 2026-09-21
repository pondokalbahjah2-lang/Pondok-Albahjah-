import React from 'react';
import { motion } from 'framer-motion';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import {
  Clock,
  MapPin,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface PrayerTimesWidgetProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = ({
  variant = 'full',
  className = ''
}) => {
  const {
    prayerTimes,
    nextPrayer,
    activePrayer,
    currentTimeWIB,
    locationName,
    sourceInfo,
    isLoading
  } = usePrayerTimes();

  if (isLoading || !prayerTimes || !nextPrayer) {
    return (
      <div className={`animate-pulse bg-white/70 dark:bg-slate-900/60 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}>
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full mb-3"></div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Compact variant for Navbar / Status header
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm select-none ${className}`}>
        <div className="flex items-center text-xs text-slate-700 dark:text-slate-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">Menuju</span>
          <span className="font-extrabold text-emerald-700 dark:text-emerald-400 mr-1">{nextPrayer.name}</span>
          <span className="text-slate-400 text-[10px] mr-2">({nextPrayer.time})</span>
        </div>
        <div className="flex items-center gap-1 font-mono font-black text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
          <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>{nextPrayer.timeRemaining}</span>
        </div>
      </div>
    );
  }

  // Banner variant (ideal for top of Kalender Cuti)
  if (variant === 'banner') {
    const fardhuKeys = [
      { key: 'Subuh', label: 'Subuh', time: prayerTimes.Subuh, icon: Sunrise },
      { key: 'Terbit', label: 'Terbit', time: prayerTimes.Terbit, icon: Sun, isSunnah: true },
      { key: 'Dhuha', label: 'Dhuha', time: prayerTimes.Dhuha, icon: Sun, isSunnah: true },
      { key: 'Dzuhur', label: 'Dzuhur', time: prayerTimes.Dzuhur, icon: Sun },
      { key: 'Ashar', label: 'Ashar', time: prayerTimes.Ashar, icon: Sunset },
      { key: 'Maghrib', label: 'Maghrib', time: prayerTimes.Maghrib, icon: Sunset },
      { key: 'Isya', label: 'Isya', time: prayerTimes.Isya, icon: Moon },
    ];

    return (
      <div className={`rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 border border-emerald-700/40 shadow-xl relative overflow-hidden select-none ${className}`}>
        {/* Glow & subtle overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Info & Realtime Countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <Clock className="w-6 h-6 text-emerald-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Jadwal Sholat Kemenag RI
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-200/80 font-mono font-medium">{currentTimeWIB}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  Menuju Adzan {nextPrayer.name}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {nextPrayer.time} WIB
                  </span>
                </h3>
              </div>
            </div>

            {/* Live Countdown digits */}
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 self-start sm:self-center">
              <div className="text-center">
                <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider">
                  {String(nextPrayer.hours).padStart(2, '0')}
                </span>
                <span className="block text-[8px] text-emerald-300 uppercase font-semibold">Jam</span>
              </div>
              <span className="font-mono font-black text-emerald-400 text-sm">:</span>
              <div className="text-center">
                <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider">
                  {String(nextPrayer.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[8px] text-emerald-300 uppercase font-semibold">Mnt</span>
              </div>
              <span className="font-mono font-black text-emerald-400 text-sm">:</span>
              <div className="text-center">
                <span className="font-mono text-sm sm:text-base font-black text-emerald-300 tracking-wider">
                  {String(nextPrayer.seconds).padStart(2, '0')}
                </span>
                <span className="block text-[8px] text-emerald-300 uppercase font-semibold">Dtk</span>
              </div>
            </div>
          </div>

          {/* Right: Horizontal Prayer Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {fardhuKeys.map(item => {
              const isNext = item.key === nextPrayer.name;
              const isActive = item.key === activePrayer;
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className={`flex flex-col items-center px-2.5 py-1.5 rounded-xl transition-all shrink-0 ${
                    isNext
                      ? 'bg-emerald-400 text-slate-900 shadow-md scale-105 font-bold'
                      : isActive
                      ? 'bg-white/20 text-white border border-emerald-400/40'
                      : 'bg-white/5 hover:bg-white/10 text-emerald-100/90'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Icon className={`w-3 h-3 ${isNext ? 'text-slate-900' : 'text-emerald-300'}`} />
                    <span className="text-[10px] uppercase font-bold tracking-tight">{item.label}</span>
                  </div>
                  <span className={`text-xs font-mono font-extrabold ${isNext ? 'text-slate-950' : 'text-white'}`}>
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Full Rich Dashboard Card
  const allPrayerList = [
    { key: 'Imsak', label: 'Imsak', time: prayerTimes.Imsak, icon: Moon, isExtra: true },
    { key: 'Subuh', label: 'Subuh', time: prayerTimes.Subuh, icon: Sunrise },
    { key: 'Terbit', label: 'Terbit', time: prayerTimes.Terbit, icon: Sun, isExtra: true },
    { key: 'Dhuha', label: 'Dhuha', time: prayerTimes.Dhuha, icon: Sun, isExtra: true },
    { key: 'Dzuhur', label: 'Dzuhur', time: prayerTimes.Dzuhur, icon: Sun },
    { key: 'Ashar', label: 'Ashar', time: prayerTimes.Ashar, icon: Sunset },
    { key: 'Maghrib', label: 'Maghrib', time: prayerTimes.Maghrib, icon: Sunset },
    { key: 'Isya', label: 'Isya', time: prayerTimes.Isya, icon: Moon },
  ];

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-xl border border-emerald-400/30 p-5 sm:p-6 select-none ${className}`}>
      {/* Decorative Islamic Star Pattern & Ambient Orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-950/40 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

      <div className="relative z-10">
        {/* Top Bar: Location, Live Time WIB & Kemenag Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-white/15">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-emerald-200">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white">{locationName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/40 text-emerald-100 font-bold">
                  WIB (UTC+7)
                </span>
              </div>
              <span className="text-[10px] text-emerald-200/90 font-medium">
                Pondok Pesantren Al-Bahjah Cirebon
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-white shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              <span>{currentTimeWIB}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900/50 backdrop-blur-md border border-emerald-400/30 text-[10px] font-semibold text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{sourceInfo}</span>
            </div>
          </div>
        </div>

        {/* Hero Section: Countdown Counter & Next Prayer Focus */}
        <div className="my-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left Focus (7 Cols): Next Prayer & Progress */}
          <div className="md:col-span-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Sholat Berikutnya
              </span>
              {nextPrayer.isApproaching && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-bounce shadow-sm">
                  Segera Tiba!
                </span>
              )}
              {nextPrayer.isAdzan && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-300 text-emerald-950 font-black text-[10px] animate-pulse shadow-sm">
                  Waktu Adzan!
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {nextPrayer.name}
              </h1>
              <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-200">
                {nextPrayer.time} <span className="text-xs text-emerald-300 font-sans">WIB</span>
              </span>
            </div>

            <p className="text-xs text-emerald-100/90 mt-1">
              Saat ini: <span className="font-bold text-white">{activePrayer}</span> &bull; Menuju waktu sholat fardhu berikutnya
            </p>

            {/* Dynamic Progress Bar */}
            <div className="mt-3.5">
              <div className="flex justify-between items-center text-[10px] font-semibold text-emerald-200 mb-1">
                <span>{nextPrayer.previousPrayerName} ({nextPrayer.previousPrayerTime})</span>
                <span className="font-mono">{nextPrayer.progressPercent}% interval</span>
                <span>{nextPrayer.name} ({nextPrayer.time})</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/25 overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-300 shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${nextPrayer.progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Right Focus (6 Cols): Modern Digital Countdown Flip Boxes */}
          <div className="md:col-span-6 flex flex-col items-center md:items-end justify-center">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              Hitung Mundur Menuju Adzan
            </div>

            {/* 3 Flip Digits: Jam, Menit, Detik */}
            <div className="flex items-center gap-2 sm:gap-3 bg-black/35 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-white/20 shadow-2xl">
              {/* Jam */}
              <div className="flex flex-col items-center min-w-[54px] sm:min-w-[64px]">
                <div className="w-full py-2 bg-gradient-to-b from-white/20 to-white/5 rounded-2xl border border-white/25 flex items-center justify-center shadow-inner">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {String(nextPrayer.hours).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] uppercase font-extrabold text-emerald-200 mt-1">
                  Jam
                </span>
              </div>

              <span className="font-mono text-2xl font-black text-emerald-300 -mt-3">:</span>

              {/* Menit */}
              <div className="flex flex-col items-center min-w-[54px] sm:min-w-[64px]">
                <div className="w-full py-2 bg-gradient-to-b from-white/20 to-white/5 rounded-2xl border border-white/25 flex items-center justify-center shadow-inner">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {String(nextPrayer.minutes).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] uppercase font-extrabold text-emerald-200 mt-1">
                  Menit
                </span>
              </div>

              <span className="font-mono text-2xl font-black text-emerald-300 -mt-3">:</span>

              {/* Detik */}
              <div className="flex flex-col items-center min-w-[54px] sm:min-w-[64px]">
                <div className="w-full py-2 bg-gradient-to-b from-emerald-500/40 to-emerald-900/40 rounded-2xl border border-emerald-400/50 flex items-center justify-center shadow-inner">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                    {String(nextPrayer.seconds).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] uppercase font-extrabold text-amber-300 mt-1">
                  Detik
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 8 Prayer Milestones Grid (Kemenag RI Standard) */}
        <div className="mt-4 pt-4 border-t border-white/15">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              Jadwal Lengkap Hari Ini (Kemenag RI)
            </span>
            <span className="text-[10px] text-emerald-200">
              {(prayerTimes.tanggal || 'Kemenag Kab. Cirebon').replace(/\bMinggu\b/gi, 'Ahad')}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {allPrayerList.map(item => {
              const isNext = item.key === nextPrayer.name;
              const isActive = item.key === activePrayer;
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className={`relative flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl transition-all duration-300 text-center ${
                    isNext
                      ? 'bg-white text-emerald-900 shadow-xl scale-105 ring-2 ring-amber-400 font-extrabold z-10'
                      : isActive
                      ? 'bg-emerald-500/40 text-white border border-emerald-300/50 shadow-md font-bold'
                      : 'bg-white/10 hover:bg-white/15 text-emerald-50 border border-white/10'
                  }`}
                >
                  {isNext && (
                    <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-amber-400 text-[8px] font-black text-slate-950 uppercase tracking-tighter shadow">
                      Berikutnya
                    </span>
                  )}
                  {isActive && !isNext && (
                    <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-emerald-400 text-[8px] font-black text-slate-950 uppercase tracking-tighter shadow">
                      Aktif
                    </span>
                  )}

                  <Icon className={`w-4 h-4 mb-1 ${isNext ? 'text-emerald-700' : 'text-emerald-200'}`} />
                  <span className={`text-[10px] uppercase font-bold tracking-tight ${isNext ? 'text-emerald-950' : 'text-emerald-100'}`}>
                    {item.label}
                  </span>
                  <span className={`text-xs font-mono font-black mt-0.5 ${isNext ? 'text-emerald-900' : 'text-white'}`}>
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
