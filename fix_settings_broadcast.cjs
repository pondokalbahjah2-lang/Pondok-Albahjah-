const fs = require('fs');

let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const target = `<button
                   onClick={() => {
                     if (onSaveGeneralSettings) {
                       onSaveGeneralSettings({ broadcastMessage: broadcastMsgInput });
                       alert('Pengumuman berhasil disiarkan!');
                     }
                   }}
                   className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold w-full"
                 >
                   Siarkan Pengumuman
                 </button>`;

const replacement = `<div className="flex space-x-2">
                 <button
                   onClick={() => {
                     if (onSaveGeneralSettings) {
                       onSaveGeneralSettings({ broadcastMessage: broadcastMsgInput });
                       alert('Pengumuman berhasil disiarkan!');
                     }
                   }}
                   className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex-1"
                 >
                   Siarkan Pengumuman
                 </button>
                 {broadcastMessage && (
                   <button
                     onClick={() => {
                       if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
                         if (onSaveGeneralSettings) {
                           onSaveGeneralSettings({ broadcastMessage: '' });
                           setBroadcastMsgInput('');
                           alert('Pengumuman berhasil dihapus!');
                         }
                       }
                     }}
                     className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                   >
                     Hapus Pengumuman
                   </button>
                 )}
                 </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/SettingsView.tsx', content);
