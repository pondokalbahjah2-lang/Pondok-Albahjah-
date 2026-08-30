const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// 1. Add jenisCutiList to DashboardViewProps
code = code.replace(
  /broadcastMessage\?: string;\n  onNavigate:/,
  "broadcastMessage?: string;\n  jenisCutiList?: { id: string; name: string; maxDays: number; }[];\n  onNavigate:"
);

// 2. Add jenisCutiList to component destructuring
code = code.replace(
  /  broadcastMessage,\n  onNavigate,/,
  "  broadcastMessage,\n  jenisCutiList = [],\n  onNavigate,"
);

// 3. Add myLeaveStats memo
const leaveStatsAnchor = `  const myWeeklyStats = React.useMemo(() => {`;
const leaveStatsMemo = `  const myLeaveStats = React.useMemo(() => {
    if (currentUser.role !== 'Pejuang') return { totalUsed: 0, sisa: 12 };
    
    // Default max cuti tahunan
    let maxCutiTahunan = 12;
    const cutiTahunanSetting = jenisCutiList.find(j => j.name === 'Cuti Tahunan');
    if (cutiTahunanSetting) {
      maxCutiTahunan = cutiTahunanSetting.maxDays;
    }

    const currentYear = new Date().getFullYear();
    const annualLeaves = leaveRequests.filter(l => 
      l.pejuangId === currentUser.id && 
      l.jenisCuti === 'Cuti Tahunan' && 
      l.status === 'Disetujui' &&
      l.tanggalMulai.startsWith(currentYear.toString())
    );

    const totalUsed = annualLeaves.reduce((acc, curr) => acc + curr.totalHari, 0);
    const sisa = Math.max(0, maxCutiTahunan - totalUsed);

    return { totalUsed, sisa, max: maxCutiTahunan };
  }, [leaveRequests, currentUser, jenisCutiList]);

  const myWeeklyStats = React.useMemo(() => {`;
code = code.replace(leaveStatsAnchor, leaveStatsMemo);

// 4. Add UI for leave stats
const uiAnchor = `      {/* Weekly Stats for Pejuang */}
      {currentUser.role === 'Pejuang' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">`;

const uiReplacement = `      {/* Weekly Stats for Pejuang */}
      {currentUser.role === 'Pejuang' && (
        <div className="space-y-4">
          {/* Cuti Tahunan Widget */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Palmtree className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Saldo Cuti Tahunan ({new Date().getFullYear()})</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{myLeaveStats.sisa} Hari</h4>
                  <span className="text-xs font-semibold text-slate-500">Tersisa dari {myLeaveStats.max}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:justify-end">
              <div className="flex flex-col items-end">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Terpakai</p>
                <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">{myLeaveStats.totalUsed} Hari</h4>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
              {myLeaveStats.sisa <= 3 ? (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 animate-pulse">
                  Hampir Habis!
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Aman
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">`;
code = code.replace(uiAnchor, uiReplacement);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('DashboardView patched with cuti.');
