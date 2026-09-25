const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const anchor = `          </div>
        </div>
      )}

      {/* Tab Content 1: Lokasi GPS Pondok */}`;

const replace = `          </div>

          {isAdmin && (
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-700/50">
               <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
                 <Bell className="w-4 h-4 text-amber-500" />
                 <span>Pengumuman Global (Broadcast)</span>
               </h3>
               <div className="space-y-3 max-w-sm">
                 <textarea
                   value={broadcastMsgInput}
                   onChange={(e) => setBroadcastMsgInput(e.target.value)}
                   placeholder="Tulis pesan pengumuman untuk seluruh pejuang..."
                   className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                   rows={3}
                 />
                 <button
                   onClick={() => {
                     if (onSaveGeneralSettings) {
                       onSaveGeneralSettings({ broadcastMessage: broadcastMsgInput });
                       alert('Pengumuman berhasil disiarkan!');
                     }
                   }}
                   className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold w-full"
                 >
                   Siarkan Pengumuman
                 </button>
               </div>
            </div>
          )}

        </div>
      )}

      {/* Tab Content 1: Lokasi GPS Pondok */}`;

if (code.includes(anchor)) {
  code = code.replace(anchor, replace);
  fs.writeFileSync('src/components/SettingsView.tsx', code);
  console.log('SettingsView broadcast patched.');
} else {
  console.log('Anchor not found');
}
