const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const backupHtml = `            <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Backup Data Saat Ini</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Sistem otomatis terhubung ke Firestore.
                </p>
              </div>
              <button 
                onClick={() => alert('Data telah otomatis tersimpan aman di Cloud Firestore Database.')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Status Backup: Aman (Auto-Sync)
              </button>
            </div>`;

const hapusHtml = backupHtml + `

            <div className="p-5 border border-rose-200 dark:border-rose-900/50 rounded-2xl bg-rose-50 dark:bg-rose-900/10 flex flex-col justify-between mt-4">
              <div>
                <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 mb-2">Hapus Database Absensi (Per Bulan)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Fitur ini akan menghapus keseluruhan data absensi kehadiran pada bulan tertentu (Kecuali data Cuti dan Slip Ubar). Masukkan format bulan (Contoh: "Agustus 2026") dan kata sandi Anda untuk konfirmasi.
                </p>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Contoh: Agustus 2026"
                  value={deleteMonth}
                  onChange={(e) => setDeleteMonth(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="password"
                  placeholder="Masukkan Kata Sandi Admin Anda"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button 
                  onClick={async () => {
                    if (!deleteMonth) {
                      alert('Masukkan bulan yang ingin dihapus.');
                      return;
                    }
                    if (deletePassword !== currentUser.password) {
                      alert('Kata sandi salah. Tindakan ditolak.');
                      return;
                    }
                    if (confirm(\`PERINGATAN BAHAYA: Apakah Anda benar-benar yakin ingin MENGHAPUS PERMANEN seluruh data absensi untuk bulan "\${deleteMonth}"? Data yang sudah dihapus tidak dapat dikembalikan.\`)) {
                      if (onDeleteAttendanceByMonth) {
                        try {
                          await onDeleteAttendanceByMonth(deleteMonth);
                          alert(\`Seluruh data absensi bulan "\${deleteMonth}" berhasil dihapus.\`);
                          setDeleteMonth('');
                          setDeletePassword('');
                        } catch (err) {
                          alert('Terjadi kesalahan saat menghapus data.');
                        }
                      }
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Hapus Permanen Data Absensi
                </button>
              </div>
            </div>`;

content = content.replace(backupHtml, hapusHtml);

fs.writeFileSync('src/components/SettingsView.tsx', content);
