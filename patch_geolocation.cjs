const fs = require('fs');
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

const geoEffect = `
  useEffect(() => {
    let watchId: number;
    if ('geolocation' in navigator) {
      setIsLocating(true);
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLat(lat);
          setCurrentLng(lng);

          const dist = calculateDistanceMeters(
            lat,
            lng,
            locationSettings.latitude,
            locationSettings.longitude
          );
          setDistanceMeters(dist);
          setIsLocating(false);
          setLocError('');
        },
        (err) => {
          console.warn('Geolocation error:', err);
          let errMsg = 'Gagal mengambil lokasi.';
          if (err.code === err.PERMISSION_DENIED) errMsg = 'Izin akses lokasi (GPS) ditolak oleh browser. Mohon izinkan akses lokasi atau coba buka app di tab baru.';
          if (err.code === err.POSITION_UNAVAILABLE) errMsg = 'Informasi lokasi tidak tersedia saat ini. Pastikan GPS perangkat menyala.';
          if (err.code === err.TIMEOUT) errMsg = 'Waktu permintaan lokasi habis (timeout). Coba lagi di area terbuka.';
          setLocError(errMsg);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setLocError('Browser Anda tidak mendukung Geolocation.');
    }

    return () => {
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [locationSettings.latitude, locationSettings.longitude]);

  // Keep the old handler but just have it retry fetching the latest explicitly if they click refresh
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocError('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLat(lat);
          setCurrentLng(lng);

          const dist = calculateDistanceMeters(
            lat,
            lng,
            locationSettings.latitude,
            locationSettings.longitude
          );
          setDistanceMeters(dist);
          setIsLocating(false);
        },
        (err) => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };
`;

// Replace handleGetLocation entirely and insert the effect right before it
const originalHandle = `  const handleGetLocation = () => {
    setIsLocating(true);
    setLocError('');

    if ('geolocation' in navigator) {
      const getPos = (options: PositionOptions) => {
        return new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
      };

      getPos({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
        .catch(() => getPos({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }))
        .then((pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLat(lat);
          setCurrentLng(lng);

          const dist = calculateDistanceMeters(
            lat,
            lng,
            locationSettings.latitude,
            locationSettings.longitude
          );
          setDistanceMeters(dist);
          setIsLocating(false);
        })
        .catch((err) => {
          console.warn('Geolocation error:', err);
          let errMsg = 'Gagal mengambil lokasi.';
          if (err.code === err.PERMISSION_DENIED) errMsg = 'Izin akses lokasi (GPS) ditolak oleh browser. Mohon izinkan akses lokasi atau coba buka app di tab baru.';
          if (err.code === err.POSITION_UNAVAILABLE) errMsg = 'Informasi lokasi tidak tersedia saat ini. Pastikan GPS perangkat menyala.';
          if (err.code === err.TIMEOUT) errMsg = 'Waktu permintaan lokasi habis (timeout). Coba lagi di area terbuka.';
          
          setLocError(errMsg);
          setIsLocating(false);
        });
    } else {
      setLocError('Browser Anda tidak mendukung Geolocation.');
      setIsLocating(false);
    }
  };`;

// We use .replace to swap out the old handleGetLocation for the new effect + handleGetLocation
if (content.includes(originalHandle)) {
  content = content.replace(originalHandle, geoEffect);
  fs.writeFileSync('src/components/AbsensiView.tsx', content);
  console.log("Replaced handleGetLocation successfully");
} else {
  console.log("Could not find the original handleGetLocation block.");
}
