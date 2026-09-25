const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// 1. Add broadcastMessage to props
content = content.replace(
  "appLogoUrl?: string,",
  "appLogoUrl?: string,\n    broadcastMessage?: string,"
);
content = content.replace(
  "appLogoUrl,",
  "appLogoUrl,\n  broadcastMessage,"
);

// 2. Add state
content = content.replace(
  "const [isUploadingLogo, setIsUploadingLogo] = useState(false);",
  "const [isUploadingLogo, setIsUploadingLogo] = useState(false);\n  const [broadcastMsgInput, setBroadcastMsgInput] = useState(broadcastMessage || '');"
);

// 3. Add UI in Profil tab, below Logo upload
const logoSectionEnd = `</div>
                </div>
              </div>
            </div>`;

const broadcastSection = `
            {/* Pengaturan Pesan Broadcast Admin */}
            <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <span className="text-amber-500">⚠️</span>
                <span>Pesan Pengumuman Broadcast (Notifikasi Massal)</span>
              </h2>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tulis pesan penting di sini. Pesan ini akan muncul sebagai banner peringatan di bagian atas seluruh dashboard Pejuang secara realtime. Kosongkan lalu simpan untuk menghapus pesan.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={broadcastMsgInput}
                    onChange={(e) => setBroadcastMsgInput(e.target.value)}
                    placeholder="Contoh: Rapat evaluasi ditunda hingga ba'da dzuhur..."
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => {
                      if (onSaveGeneralSettings) {
                        onSaveGeneralSettings({ broadcastMessage: broadcastMsgInput });
                        alert('Pesan pengumuman berhasil diperbarui!');
                      }
                    }}
                    className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs shadow-md transition-all"
                  >
                    Kirim/Simpan
                  </button>
                </div>
              </div>
            </div>
`;

// Insert after the Logo setting block.
// Wait, we need to be careful to insert it exactly inside the activeTab === 'profil' && isAdmin block.
// Let's just find the `Pengaturan Upload Logo Portal` section and insert after its closing div.
content = content.replace(
  `{/* Settings Container for Admin Only */}`,
  broadcastSection + `\n          {/* Settings Container for Admin Only */}`
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
