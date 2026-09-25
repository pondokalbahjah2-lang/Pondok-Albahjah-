import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

const backupStartIdx = content.indexOf("{/* Tab Content 5: Backup & Restore */}");
if (backupStartIdx !== -1) {
  content = content.slice(0, backupStartIdx);
}

const hapusDataUI = `
          {/* Hapus Data Bulanan */}
          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-red-600 dark:text-red-400 mb-2 flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Hapus Data Absensi Berdasarkan Bulan</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Fitur ini akan menghapus seluruh data kehadiran pejuang secara permanen untuk bulan yang dipilih. Gunakan dengan sangat hati-hati.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 items-end bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800/50">
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold text-red-700 dark:text-red-300 mb-1">Pilih Bulan</label>
                <input 
                  type="month"
                  value={deleteMonth}
                  onChange={(e) => setDeleteMonth(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700 text-xs font-bold focus:ring-2 focus:ring-red-500 dark:text-white"
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold text-red-700 dark:text-red-300 mb-1">Password Admin</label>
                <input 
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700 text-xs focus:ring-2 focus:ring-red-500 dark:text-white"
                />
              </div>
              <button
                onClick={() => {
                  if (!deleteMonth) {
                    alert('Silakan pilih bulan yang akan dihapus!');
                    return;
                  }
                  if (!deletePassword) {
                    alert('Silakan masukkan password konfirmasi!');
                    return;
                  }
                  if (deletePassword !== currentUser.password) {
                    alert('Password yang Anda masukkan salah!');
                    return;
                  }
                  
                  if (confirm(\`PERINGATAN: Anda yakin ingin MENGHAPUS SEMUA DATA KEHADIRAN pada bulan \${deleteMonth}? Data tidak dapat dikembalikan!\`)) {
                    if (onDeleteAttendanceByMonth) {
                      onDeleteAttendanceByMonth(deleteMonth);
                      alert(\`Data kehadiran untuk bulan \${deleteMonth} berhasil dihapus.\`);
                      setDeleteMonth('');
                      setDeletePassword('');
                    } else {
                      alert('Fungsi penghapusan belum terhubung.');
                    }
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
`;

const backupTab = `      {/* Tab Content 5: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4 max-w-2xl">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <span>Backup & Restore Data Sistem</span>
          </h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 p-4 rounded-xl">
            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
              Sistem saat ini terintegrasi dengan Firebase Firestore. Data absensi, izin, cuti, dan akun tersinkronisasi secara real-time ke cloud. Fitur Backup dan Restore lokal masih tersedia sebagai cadangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Backup Data</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Unduh seluruh data sistem dalam format JSON. Anda dapat menyimpannya sebagai cadangan.
                </p>
              </div>
              <button
                onClick={() => {
                  const data = AppStorage.exportAllData();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = \`backup_albahjah_\${new Date().toISOString().split('T')[0]}.json\`;
                  a.click();
                  URL.revokeObjectURL(url);
                  alert('Backup berhasil diunduh!');
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Unduh File Backup
              </button>
            </div>
            <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Restore Data</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Pulihkan data sistem dari file JSON hasil backup. Peringatan: Data saat ini akan diganti!
                </p>
              </div>
              <div>
                <input 
                  type="file" 
                  accept=".json"
                  className="hidden"
                  id="restore-file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const fileContent = event.target?.result as string;
                      if (fileContent) {
                        const success = AppStorage.importData(fileContent);
                        if (success) {
                          alert('Restore data berhasil! Halaman akan dimuat ulang.');
                          window.location.reload();
                        } else {
                          alert('Gagal melakukan restore data. File tidak valid.');
                        }
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
                <button
                  onClick={() => document.getElementById('restore-file-input')?.click()}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Pilih File Restore
                </button>
              </div>
            </div>
          </div>
${hapusDataUI}
        </div>
      )}
    </div>
  );
};
`;

content = content + backupTab;
fs.writeFileSync('src/components/SettingsView.tsx', content);
