const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const anchor = `<div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Latitude`;

const replacement = `<div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => {
                  if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setLat(pos.coords.latitude);
                        setLng(pos.coords.longitude);
                        alert('Koordinat berhasil diambil. Jangan lupa klik Simpan Pengaturan Lokasi.');
                      },
                      (err) => {
                        alert('Gagal mengambil lokasi: ' + err.message);
                      },
                      { enableHighAccuracy: true, timeout: 15000 }
                    );
                  } else {
                    alert('Browser tidak mendukung GPS');
                  }
                }}
                className="py-1.5 px-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-900"
              >
                <MapPin className="w-3 h-3" /> Ambil Lokasi Saat Ini
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Latitude`;

if (code.includes(anchor)) {
  code = code.replace(anchor, replacement);
  fs.writeFileSync('src/components/SettingsView.tsx', code);
  console.log('SettingsView loc button patched');
}
