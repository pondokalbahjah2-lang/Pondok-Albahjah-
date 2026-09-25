import re
with open("src/components/KajianView.tsx", "r") as f:
    content = f.read()

# Add calculateDistanceMeters import if not exist
if "calculateDistanceMeters" not in content:
    content = content.replace("import { getLocalDateString } from '../utils/dateUtils';", "import { getLocalDateString } from '../utils/dateUtils';\nimport { calculateDistanceMeters } from '../utils/storage';")

# Add locationSettings to props
content = content.replace("accounts: UserAccount[];", "accounts: UserAccount[];\n  locationSettings: any;")
content = content.replace("{ currentUser, kajianRecords, onSaveKajian, accounts }", "{ currentUser, kajianRecords, onSaveKajian, accounts, locationSettings }")

# Update state
content = content.replace("const [locationStatus, setLocationStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');", "const [locationStatus, setLocationStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');\n  const [locError, setLocError] = useState('');\n  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);\n")

# Update getLocation function
get_location_old = """  const getLocation = () => {
    setLocationStatus('loading');
    setTimeout(() => {
      setCoords({lat: -6.74, lng: 108.55}); // Dummy coordinates
      setLocationStatus('success');
    }, 1500);
  };"""

get_location_new = """  const getLocation = () => {
    setLocationStatus('loading');
    setLocError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          const dist = calculateDistanceMeters(
            lat,
            lng,
            locationSettings.latitude,
            locationSettings.longitude
          );
          setDistanceMeters(dist);
          setLocationStatus('success');
        },
        (err) => {
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
  };
  
  const isWithinRadius = distanceMeters !== null && distanceMeters <= locationSettings.radiusMaxMeters;"""

content = content.replace(get_location_old, get_location_new)

# Update handleSubmit
submit_old = """    if (mode === 'Offline' && locationStatus !== 'success') {
      alert("Harap ambil lokasi Anda terlebih dahulu untuk absen Offline.");
      return;
    }"""

submit_new = """    if (mode === 'Offline') {
      if (locationStatus !== 'success') {
        alert("Harap ambil lokasi Anda terlebih dahulu untuk absen Offline.");
        return;
      }
      if (!isWithinRadius && currentUser.role === 'Pejuang') {
        alert(`Absen ditolak: Anda berada di luar radius Pondok (${distanceMeters}m / Maks ${locationSettings.radiusMaxMeters}m).`);
        return;
      }
    }"""
content = content.replace(submit_old, submit_new)

# Update UI for Location section
ui_loc_old = """              {coords.lat && coords.lng && (
                <div className="mt-2 relative z-0 h-48 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <LocationMap 
                    userLat={coords.lat}
                    userLng={coords.lng}
                    pondokLat={-6.758801}
                    pondokLng={108.472935}
                    radius={100}
                  />
                </div>
              )}"""

ui_loc_new = """              {locError && <div className="mt-2 p-2 bg-rose-100 text-rose-700 text-xs rounded-lg font-bold">{locError}</div>}
              {coords.lat !== 0 && coords.lng !== 0 && (
                <div className="mt-3">
                  <div className="text-xs mb-2">
                    Jarak dari pondok: <strong className={isWithinRadius ? 'text-emerald-600' : 'text-rose-600'}>{distanceMeters} meter</strong> (Maks: {locationSettings.radiusMaxMeters}m)
                  </div>
                  <div className="relative z-0 h-48 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <LocationMap 
                      userLat={coords.lat}
                      userLng={coords.lng}
                      pondokLat={locationSettings.latitude}
                      pondokLng={locationSettings.longitude}
                      radius={locationSettings.radiusMaxMeters}
                    />
                  </div>
                </div>
              )}"""
content = content.replace(ui_loc_old, ui_loc_new)

with open("src/components/KajianView.tsx", "w") as f:
    f.write(content)
