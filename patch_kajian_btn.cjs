const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

const anchor = `<div className="flex items-end">
                <input type="text" placeholder="Cari nama..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs" />
              </div>`;

const newAnchor = `<div className="flex items-end">
                <input type="text" placeholder="Cari nama..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs" />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={async () => {
                     if (onForceSync) {
                        const btn = document.getElementById('forceSyncBtn');
                        if (btn) btn.innerHTML = 'Menyinkronkan...';
                        await onForceSync();
                        if (btn) btn.innerHTML = 'Force Sync';
                     }
                  }}
                  id="forceSyncBtn"
                  className="p-2 px-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:bg-blue-200 transition-colors"
                >
                  Force Sync
                </button>
              </div>`;

code = code.replace(anchor, newAnchor);
fs.writeFileSync('src/components/KajianView.tsx', code);
console.log('Patched Force Sync button into KajianView.tsx');
