import { useState, useEffect } from 'react';

export interface PrayerTimesData {
  Subuh: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
}

export const usePrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; timeRemaining: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Mencari lokasi...');

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const calculateNextPrayer = (times: PrayerTimesData) => {
      if (intervalId) clearInterval(intervalId);

      const updateCountdown = () => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const prayerMinutes = Object.entries(times).map(([name, time]) => {
          const [hours, minutes] = time.split(':').map(Number);
          return { name, time, totalMinutes: hours * 60 + minutes };
        });

        // Sort by time
        prayerMinutes.sort((a, b) => a.totalMinutes - b.totalMinutes);

        // Find next prayer
        let next = prayerMinutes.find(p => p.totalMinutes > currentMinutes);
        
        // If no next prayer today, it's the first prayer tomorrow
        let nextDate = new Date();
        if (!next) {
          next = prayerMinutes[0];
          nextDate.setDate(nextDate.getDate() + 1);
        }
        
        const [nextH, nextM] = next.time.split(':').map(Number);
        nextDate.setHours(nextH, nextM, 0, 0);

        const currentTime = new Date();
        const diff = nextDate.getTime() - currentTime.getTime();
        
        if (diff <= 0 && diff > -2000) {
            // Trigger local notification if permission granted
            if (Notification.permission === 'granted') {
               new Notification('Waktu Sholat', {
                 body: `Waktu sholat ${next.name} telah tiba (${next.time}).`,
                 icon: '/icon.png'
               });
            }
        }
        
        if (diff <= 0) {
            // Wait for next second to recalculate naturally, or just return and next tick will find the new one.
            return;
        }

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        setNextPrayer({
          name: next.name,
          time: next.time,
          timeRemaining: `-${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        });
      };

      updateCountdown();
      intervalId = setInterval(updateCountdown, 1000);
    };

    const fetchPrayerTimes = async (latitude: number, longitude: number) => {
      try {
        const res = await fetch('/api/prayer-times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude, location: 'Cirebon' })
        });
        
        if (!res.ok) {
           throw new Error('Failed to fetch from backend API');
        }
        
        const times = await res.json();
        
        if (times && times.Subuh) {
          const mappedTimes: PrayerTimesData = {
            Subuh: times.Subuh,
            Dzuhur: times.Dzuhur,
            Ashar: times.Ashar,
            Maghrib: times.Maghrib,
            Isya: times.Isya
          };
          setPrayerTimes(mappedTimes);
          calculateNextPrayer(mappedTimes);
        } else {
           throw new Error('Invalid prayer times structure from backend');
        }
      } catch (err) {
        console.error("Error fetching prayer times:", err);
        setLocationError("Gagal mengambil data sholat. Menggunakan waktu statis.");
        
        const fallbackTimes: PrayerTimesData = {
          Subuh: "04:30",
          Dzuhur: "11:55",
          Ashar: "15:15",
          Maghrib: "17:50",
          Isya: "19:05"
        };
        setPrayerTimes(fallbackTimes);
        calculateNextPrayer(fallbackTimes);
      }
    };

    if ('geolocation' in navigator) {
      const getPos = (options: PositionOptions) => {
        return new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
      };

      getPos({ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 })
        .catch(() => getPos({ enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }))
        .then((position) => {
          const { latitude, longitude } = position.coords;
          setLocationName('Lokasi Anda');
          fetchPrayerTimes(latitude, longitude);
        })
        .catch((error) => {
          let errMsg = 'Gagal mendapatkan lokasi. Menampilkan Waktu Cirebon.';
          if (error.code === error.PERMISSION_DENIED) errMsg = 'Izin lokasi ditolak. Menampilkan Waktu Cirebon.';
          if (error.code === error.TIMEOUT) errMsg = 'Waktu permintaan lokasi habis (timeout). Menampilkan Waktu Cirebon.';
          setLocationError(errMsg);
          fetchPrayerTimes(-6.7558, 108.4735);
        });
    } else {
      setLocationError('Geolocation tidak didukung.');
      fetchPrayerTimes(-6.7558, 108.4735);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return { prayerTimes, nextPrayer, locationError, locationName };
};
