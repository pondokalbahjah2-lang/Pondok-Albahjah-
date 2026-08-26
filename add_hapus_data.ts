import fs from 'fs';

let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

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

content = content.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\};/g,
  "</div>\n          </div>\n" + hapusDataUI + "\n        </div>\n      )}\n    </div>\n  );\n};"
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
