import React from 'react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { Clock, MapPin } from 'lucide-react';

interface PrayerTimesWidgetProps {
  variant?: 'compact' | 'full';
}

export const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = ({ variant = 'full' }) => {
  const { prayerTimes, nextPrayer, locationName } = usePrayerTimes();

  if (!prayerTimes || !nextPrayer) {
    return (
      <div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl h-16 w-full"></div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-3 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 mr-1 text-emerald-500" />
          <span className="font-bold mr-1">{nextPrayer.name}</span>
          <span>{nextPrayer.time}</span>
        </div>
        <div className="text-[11px] sm:text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
          {nextPrayer.timeRemaining}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <svg viewBox="0 0 100 100" className="w-32 h-32" fill="currentColor">
          <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center text-emerald-100 text-[10px] font-semibold mb-1 uppercase tracking-wider">
              <MapPin className="w-3 h-3 mr-1" />
              {locationName}
            </div>
            <h2 className="text-xl font-bold">Jadwal Sholat</h2>
          </div>
          
          <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
            <div className="text-xs text-emerald-100 mb-1 font-medium">Menuju {nextPrayer.name}</div>
            <div className="text-2xl font-mono font-bold tracking-tight">
              {nextPrayer.timeRemaining}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {Object.entries(prayerTimes).map(([name, time]) => {
            const isNext = name === nextPrayer.name;
            return (
              <div 
                key={name}
                className={`text-center py-3 rounded-xl transition-all ${
                  isNext 
                    ? 'bg-white text-emerald-600 shadow-lg scale-105 origin-bottom' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase mb-1 ${isNext ? 'opacity-100' : 'opacity-70'}`}>
                  {name}
                </div>
                <div className={`text-sm font-bold ${isNext ? '' : 'opacity-90'}`}>
                  {time}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
