const fs = require('fs');

let viewCode = fs.readFileSync('src/components/KajianView.tsx', 'utf8');
if (!viewCode.includes('onForceSync')) {
    viewCode = viewCode.replace('onSaveKajian: (records: KajianRecord[]) => void;', 'onSaveKajian: (records: KajianRecord[]) => void;\n  onForceSync?: () => Promise<void>;');
    viewCode = viewCode.replace('accounts, locationSettings }) => {', 'accounts, locationSettings, onForceSync }) => {');
    
    // Add button in Admin search area
    const btnHtml = `              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">&nbsp;</label>
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
              
    viewCode = viewCode.replace('<div>\n                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cari Pejuang</label>', btnHtml + '\n              <div>\n                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cari Pejuang</label>');
    fs.writeFileSync('src/components/KajianView.tsx', viewCode);
    console.log("Patched KajianView.tsx");
}

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('handleForceSyncKajian')) {
    const fnCode = `  const handleForceSyncKajian = async () => {
    try {
      const { collection, query, getDocs, limit, where } = await import('firebase/firestore');
      const db = (await import('./lib/firebase')).db;
      const isAd = currentUser?.role === 'Admin';
      const kajianQ = isAd 
          ? query(collection(db, 'kajian'), limit(3000))
          : query(collection(db, 'kajian'), where('pejuangId', '==', currentUser?.id));
      const snap = await getDocs(kajianQ);
      let data = snap.docs.map(d => d.data() as KajianRecord);
      data = data.sort((a, b) => {
        const dateDiff = new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        if (dateDiff !== 0) return dateDiff;
        return (b.id || '').localeCompare(a.id || '');
      });
      setKajianRecords(data);
      console.log('Force synced kajian records, found:', data.length);
      alert('Data Kajian berhasil disinkronisasi paksa dari server.');
    } catch (e) {
      console.error('Error force syncing kajian:', e);
      alert('Gagal menyinkronisasi data.');
    }
  };`;
  
    appCode = appCode.replace('const handleSaveKajian =', fnCode + '\n\n  const handleSaveKajian =');
    
    appCode = appCode.replace('onSaveKajian={handleSaveKajian}', 'onSaveKajian={handleSaveKajian}\n                onForceSync={handleForceSyncKajian}');
    
    fs.writeFileSync('src/App.tsx', appCode);
    console.log("Patched App.tsx");
}
