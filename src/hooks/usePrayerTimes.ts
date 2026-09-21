import { useState, useEffect, useRef } from 'react';

export interface PrayerTimesData {
  Imsak: string;
  Subuh: string;
  Terbit: string;
  Dhuha: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
  source?: string;
  location?: string;
  tanggal?: string;
  date?: string;
}

export interface NextPrayerInfo {
  name: string;
  time: string;
  hours: number;
  minutes: number;
  seconds: number;
  timeRemaining: string;
  totalSecondsRemaining: number;
  progressPercent: number; // 0 - 100
  isApproaching: boolean; // < 15 mins
  isAdzan: boolean; // 0 - 2 mins after time
  previousPrayerName: string;
  previousPrayerTime: string;
}

export const usePrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [activePrayer, setActivePrayer] = useState<string>('Dzuhur');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Kab. Cirebon (Al-Bahjah)');
  const [sourceInfo, setSourceInfo] = useState<string>('Kemenag RI (Bimas Islam)');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Keep latest times in ref for timer
  const timesRef = useRef<PrayerTimesData | null>(null);

  // Recalculate countdown and active prayer
  const updateTick = (times: PrayerTimesData) => {
    const now = new Date();
    setCurrentTime(now);

    const parseTimeToDate = (timeStr: string, baseDate = new Date()): Date => {
      const [h, m] = (timeStr || '00:00').split(':').map(Number);
      const d = new Date(baseDate);
      d.setHours(h, m, 0, 0);
      return d;
    };

    // The primary 5 prayers for active state & countdown
    const sequence = [
      { name: 'Subuh', time: times.Subuh },
      { name: 'Dzuhur', time: times.Dzuhur },
      { name: 'Ashar', time: times.Ashar },
      { name: 'Maghrib', time: times.Maghrib },
      { name: 'Isya', time: times.Isya }
    ];

    const nowMs = now.getTime();

    // Map each prayer to today's timestamp
    const todaySchedule = sequence.map(item => ({
      name: item.name,
      time: item.time,
      date: parseTimeToDate(item.time, now)
    }));

    // Find next prayer today
    let nextIndex = todaySchedule.findIndex(item => item.date.getTime() > nowMs);
    let nextItem: { name: string; time: string; date: Date };
    let prevItem: { name: string; time: string; date: Date };

    if (nextIndex !== -1) {
      nextItem = todaySchedule[nextIndex];
      if (nextIndex > 0) {
        prevItem = todaySchedule[nextIndex - 1];
        setActivePrayer(prevItem.name);
      } else {
        // Before Subuh: previous was yesterday's Isya
        const yesterdayIsya = parseTimeToDate(times.Isya, new Date(nowMs - 86400000));
        prevItem = { name: 'Isya', time: times.Isya, date: yesterdayIsya };
        setActivePrayer('Isya');
      }
    } else {
      // After Isya: next is tomorrow's Subuh
      const tomorrowSubuh = parseTimeToDate(times.Subuh, new Date(nowMs + 86400000));
      nextItem = { name: 'Subuh', time: times.Subuh, date: tomorrowSubuh };
      prevItem = todaySchedule[todaySchedule.length - 1]; // Isya today
      setActivePrayer('Isya');
    }

    const diffMs = nextItem.date.getTime() - nowMs;
    const totalIntervalMs = nextItem.date.getTime() - prevItem.date.getTime();

    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    let progress = 0;
    if (totalIntervalMs > 0) {
      const elapsedMs = nowMs - prevItem.date.getTime();
      progress = Math.min(100, Math.max(0, Math.round((elapsedMs / totalIntervalMs) * 100)));
    }

    const isAdzan = diffMs <= 0 && diffMs > -120000;
    const isApproaching = totalSeconds > 0 && totalSeconds <= 900; // 15 mins

    // Notification trigger when time matches
    if (diffMs <= 1000 && diffMs > -2000) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`Waktu Sholat ${nextItem.name}`, {
            body: `Waktu sholat ${nextItem.name} untuk Cirebon dan sekitarnya telah tiba (${nextItem.time} WIB).`,
            icon: '/icon.png'
          });
        } catch (e) {
          console.log('Notification error:', e);
        }
      }
    }

    setNextPrayer({
      name: nextItem.name,
      time: nextItem.time,
      hours: h,
      minutes: m,
      seconds: s,
      timeRemaining: `-${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      totalSecondsRemaining: totalSeconds,
      progressPercent: progress,
      isApproaching,
      isAdzan,
      previousPrayerName: prevItem.name,
      previousPrayerTime: prevItem.time
    });
  };

  useEffect(() => {
    let intervalId: any = null;

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const fetchPrayerTimes = async (latitude?: number, longitude?: number) => {
      setIsLoading(true);
      try {
        const bodyPayload: any = { location: 'Cirebon' };
        if (latitude && longitude) {
          bodyPayload.latitude = latitude;
          bodyPayload.longitude = longitude;
        }

        const res = await fetch('/api/prayer-times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });

        if (!res.ok) throw new Error('Failed to fetch from prayer API');

        const data = await res.json();
        if (data && data.Subuh) {
          const validatedTimes: PrayerTimesData = {
            Imsak: data.Imsak || '04:12',
            Subuh: data.Subuh || '04:22',
            Terbit: data.Terbit || '05:34',
            Dhuha: data.Dhuha || '06:01',
            Dzuhur: data.Dzuhur || '11:43',
            Ashar: data.Ashar || '14:55',
            Maghrib: data.Maghrib || '17:46',
            Isya: data.Isya || '18:54',
            source: data.source || 'Kemenag RI (Bimas Islam)',
            location: data.location || 'KAB. CIREBON',
            tanggal: (data.tanggal || '').replace(/\bMinggu\b/gi, 'Ahad'),
            date: data.date || ''
          };

          timesRef.current = validatedTimes;
          setPrayerTimes(validatedTimes);
          setSourceInfo(validatedTimes.source || 'Kemenag RI');
          if (data.location) {
            setLocationName(data.location.includes('CIREBON') ? 'Kab. Cirebon (Al-Bahjah)' : data.location);
          }
          updateTick(validatedTimes);
        } else {
          throw new Error('Invalid structure');
        }
      } catch (err) {
        console.warn('Prayer times error, using Kemenag Cirebon fallback:', err);
        setLocationError('Menggunakan data resmi Kemenag RI Cirebon');
        const fallback: PrayerTimesData = {
          Imsak: '04:12',
          Subuh: '04:22',
          Terbit: '05:34',
          Dhuha: '06:01',
          Dzuhur: '11:43',
          Ashar: '14:55',
          Maghrib: '17:46',
          Isya: '18:54',
          source: 'Kemenag RI (Bimas Islam)',
          location: 'KAB. CIREBON'
        };
        timesRef.current = fallback;
        setPrayerTimes(fallback);
        updateTick(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    // Primary: fetch for Cirebon (Pondok Al-Bahjah)
    fetchPrayerTimes(-6.7558, 108.4735);

    // Live clock & countdown interval (1 second)
    intervalId = setInterval(() => {
      if (timesRef.current) {
        updateTick(timesRef.current);
      } else {
        setCurrentTime(new Date());
      }
    }, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const formattedWib = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + ' WIB';

  return {
    prayerTimes,
    nextPrayer,
    activePrayer,
    currentTime,
    currentTimeWIB: formattedWib,
    locationError,
    locationName,
    sourceInfo,
    isLoading
  };
};
