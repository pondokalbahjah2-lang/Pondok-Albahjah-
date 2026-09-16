const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

// Update useEffect to use targetLat, targetLng, targetRadius based on kajianName
const useEffectRegex = /useEffect\(\(\) => \{[\s\S]*?\}, \[mode, locationSettings\.latitude, locationSettings\.longitude\]\);/m;

const newUseEffect = `  const isAlHikam = kajianName === "Kajian Al-Hikam Senin Malam";
  const targetLat = isAlHikam ? -6.7100287 : (locationSettings.latitude || 0);
  const targetLng = isAlHikam ? 108.5583596 : (locationSettings.longitude || 0);
  const targetRadius = isAlHikam ? 300 : (locationSettings.radiusMaxMeters || 150);

  useEffect(() => {
    let watchId: number;
    if (mode === 'Offline') {
      if ('geolocation' in navigator) {
        setLocationStatus('loading');
        setLocError('');
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setCoords({ lat, lng });
            const dist = calculateDistanceMeters(
              lat,
              lng,
              targetLat,
              targetLng
            );
            setDistanceMeters(dist);
            setLocationStatus('success');
          },
          (err) => {
            console.warn('Geolocation error:', err);
            let errMsg = 'Gagal mengambil lokasi.';
            if (err.code === err.PERMISSION_DENIED) errMsg = 'Izin akses lokasi ditolak.';
            if (err.code === err.POSITION_UNAVAILABLE) errMsg = 'Lokasi tidak tersedia.';
            if (err.code === err.TIMEOUT) errMsg = 'Waktu permintaan habis.';
            setLocError(errMsg);
            setLocationStatus('error');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        setLocError('Browser tidak mendukung Geolocation.');
        setLocationStatus('error');
      }
    }
    return () => {
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [mode, kajianName, targetLat, targetLng]);`;

code = code.replace(useEffectRegex, newUseEffect);

// Update isWithinRadius and validation msgs
const radiusCheckOld = `const isWithinRadius = distanceMeters !== null && distanceMeters <= locationSettings.radiusMaxMeters;`;
const radiusCheckNew = `const isWithinRadius = distanceMeters !== null && distanceMeters <= targetRadius;`;
code = code.replace(radiusCheckOld, radiusCheckNew);

const validationOld = 'alert(`Absen ditolak: Anda berada di luar radius Pondok (${distanceMeters}m / Maks ${locationSettings.radiusMaxMeters}m).`);';
const validationNew = 'alert(`Absen ditolak: Anda berada di luar radius lokasi (${distanceMeters}m / Maks ${targetRadius}m).`);';
code = code.replace(validationOld, validationNew);

const uiStatusOld1 = `(Maks: {locationSettings.radiusMaxMeters}m)`;
const uiStatusNew1 = `(Maks: {targetRadius}m)`;
code = code.replace(uiStatusOld1, uiStatusNew1);

const uiMapOld1 = `pondokLat={locationSettings.latitude}
                      pondokLng={locationSettings.longitude}
                      radius={locationSettings.radiusMaxMeters}`;
const uiMapNew1 = `pondokLat={targetLat}
                      pondokLng={targetLng}
                      radius={targetRadius}`;
code = code.replace(uiMapOld1, uiMapNew1);


// Save
fs.writeFileSync('src/components/KajianView.tsx', code);
console.log('Location patched successfully');
