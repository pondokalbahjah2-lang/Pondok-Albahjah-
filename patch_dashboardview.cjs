const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// 1. Add broadcastMessage to props
const interfaceMatch = `interface DashboardViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  attendance: AttendanceRecord[];
  exitPermissions: ExitPermissionRecord[];
  leaveRequests: LeaveRequestRecord[];
  warningLetters: WarningLetterRecord[];
  manhajiyyahClauses: ManhajiyyahClause[];
  onNavigate: (tab: string) => void;
}`;
const interfaceReplace = `interface DashboardViewProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  attendance: AttendanceRecord[];
  exitPermissions: ExitPermissionRecord[];
  leaveRequests: LeaveRequestRecord[];
  warningLetters: WarningLetterRecord[];
  manhajiyyahClauses: ManhajiyyahClause[];
  broadcastMessage?: string;
  onNavigate: (tab: string) => void;
}`;
code = code.replace(interfaceMatch, interfaceReplace);

// 2. Add broadcastMessage to component args
const compArgsMatch = `  warningLetters,
  manhajiyyahClauses,
  onNavigate,
}) => {`;
const compArgsReplace = `  warningLetters,
  manhajiyyahClauses,
  broadcastMessage,
  onNavigate,
}) => {`;
code = code.replace(compArgsMatch, compArgsReplace);

// 3. Calculate weekly stats for current user
const metricsAnchor = `  // Today's Attendance Statistics`;
const weeklyStatsLogic = `  // Weekly Stats for current user
  const myWeeklyStats = React.useMemo(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    let totalHadir = 0;
    let totalIzin = 0;
    let totalCuti = 0;

    // Filter attendance in last 7 days
    attendance.forEach(a => {
      if (a.pejuangId === currentUser.id) {
        const d = new Date(a.date);
        if (d >= lastWeek && d <= today) {
          if (a.status === 'Hadir' || a.status === 'Terlambat') {
            totalHadir++;
          }
        }
      }
    });

    // Filter izin in last 7 days
    exitPermissions.forEach(e => {
      if (e.pejuangId === currentUser.id && e.status === 'Disetujui') {
        const d = new Date(e.tanggalKeluar);
        if (d >= lastWeek && d <= today) {
          totalIzin++;
        }
      }
    });

    // Filter cuti in last 7 days
    leaveRequests.forEach(l => {
      if (l.pejuangId === currentUser.id && l.status === 'Disetujui') {
        const d = new Date(l.tanggalMulai);
        const end = new Date(l.tanggalSelesai);
        if (end >= lastWeek && d <= today) {
          totalCuti++;
        }
      }
    });

    return { totalHadir, totalIzin, totalCuti };
  }, [attendance, exitPermissions, leaveRequests, currentUser.id]);

  // Today's Attendance Statistics`;
code = code.replace(metricsAnchor, weeklyStatsLogic);

// 4. Render broadcast message and weekly stats
const renderAnchor = `      {/* Welcome & Pasal Header */}`;
const renderReplace = `      {/* Broadcast Message */}
      {broadcastMessage && (
        <div className="bg-emerald-500 text-white rounded-2xl p-4 shadow-md flex items-start gap-3 relative animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Pengumuman dari Admin</h4>
            <p className="text-xs mt-1">{broadcastMessage}</p>
          </div>
        </div>
      )}

      {/* Weekly Stats for Pejuang */}
      {currentUser.role === 'Pejuang' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Hadir (7 Hari)</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{myWeeklyStats.totalHadir} Hari</h4>
            </div>
          </div>
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Izin (7 Hari)</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{myWeeklyStats.totalIzin} Kali</h4>
            </div>
          </div>
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Cuti (7 Hari)</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{myWeeklyStats.totalCuti} Pengajuan</h4>
            </div>
          </div>
        </div>
      )}

      {/* Welcome & Pasal Header */}`;
code = code.replace(renderAnchor, renderReplace);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('DashboardView patched');
