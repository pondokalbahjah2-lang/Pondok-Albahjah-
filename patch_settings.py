with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

target = """                </button>
              </div>
            </div>
          </div>
        </div>
      )}"""

replacement = """                </button>
              </div>

              {/* Purge Old Data (> 3 Months) */}
              <div className="pt-4 border-t border-rose-200 dark:border-rose-900/50">
                <h4 className="text-sm font-bold text-rose-800 dark:text-rose-200 mb-2">Optimalisasi Database</h4>
                <p className="text-xs text-rose-600/80 dark:text-rose-300/70 mb-4">
                  Bersihkan data 'auditLogs' dan data residu lainnya (Absensi, Izin, Cuti, Slip Ubar) yang usianya lebih dari 3 bulan untuk menjaga performa sistem.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const pass = prompt('Masukkan kata sandi Anda untuk konfirmasi pembersihan data:');
                    if (pass !== currentUser.password) {
                      alert('Kata sandi salah. Tindakan ditolak.');
                      return;
                    }
                    if (confirm('PERINGATAN: Anda akan menghapus data residu > 3 bulan. Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) {
                      if (onPurgeOldData) {
                        try {
                          await onPurgeOldData();
                        } catch (err) {
                          alert('Terjadi kesalahan saat membersihkan data.');
                        }
                      }
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Jalankan Pembersihan Data (> 3 Bulan)
                </button>
              </div>

            </div>
          </div>
        </div>
      )}"""

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content.replace(target, replacement))
