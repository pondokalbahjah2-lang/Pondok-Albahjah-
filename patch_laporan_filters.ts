import fs from 'fs';
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf-8');

// Add shiftFilter state
if (!content.includes('const [shiftFilter, setShiftFilter]')) {
  content = content.replace(
    /const \[searchQuery, setSearchQuery\] = useState\(''\);/,
    "const [searchQuery, setSearchQuery] = useState('');\n  const [shiftFilter, setShiftFilter] = useState('');"
  );
}

// Update pejuangAccounts filtering logic
const newFilteringLogic = `
  const pejuangAccounts = accounts.filter((a) => {
    if (a.role !== 'Pejuang') return false;
    
    // Filter by name (searchQuery)
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by shift (shiftFilter uses schedule targetId)
    if (shiftFilter) {
      const userSchedule = (schedules || []).find(s => s.targetId === a.id || s.targetId === a.subDivisi);
      if (!userSchedule || userSchedule.id !== shiftFilter) {
        return false;
      }
    }

    return true;
  });
`;

content = content.replace(
  /const pejuangAccounts = accounts\.filter\(\(a\) => a\.role === 'Pejuang'\);/,
  newFilteringLogic.trim()
);

// Add UI for filters
const filterUI = `
          <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg flex flex-col gap-4">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Pilih Pejuang Sasaran Laporan:
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Cari nama pejuang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
              
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Shift/Jadwal</option>
                {(schedules || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.targetName} ({s.jamMasuk} - {s.jamPulang})
                  </option>
                ))}
              </select>

              <select
                value={selectedPejuangId}
                onChange={(e) => setSelectedPejuangId(e.target.value)}
                className="w-full sm:w-1/3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500"
              >
                {pejuangAccounts.length === 0 && <option value="">Tidak ada pejuang ditemukan</option>}
                {pejuangAccounts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.subDivisi} ({p.amanah})
                  </option>
                ))}
              </select>
            </div>
          </div>
`;

content = content.replace(
  /<div className="p-4 rounded-3xl bg-white\/70 dark:bg-slate-900\/60 backdrop-blur-2xl border border-white\/60 dark:border-white\/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">[\s\S]*?<\/select>\s*<\/div>/,
  filterUI.trim()
);

fs.writeFileSync('src/components/LaporanView.tsx', content);
