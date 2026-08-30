const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const anchor1 = `  const my14DaysChartData = React.useMemo(() => {`;
const recentActivityMemo = `  const recentActivities = React.useMemo(() => {
    if (currentUser.role !== 'Pejuang') return [];
    const activities = [];

    // 1. Absensi
    attendance.filter(a => a.pejuangId === currentUser.id).forEach(a => {
      activities.push({
        id: \`abs-\${a.id}\`,
        type: 'absensi',
        title: \`Absensi: \${a.status}\`,
        description: \`Waktu: \${a.time} \${a.timePulang ? '- ' + a.timePulang : ''}\`,
        timestamp: new Date(\`\${a.date}T\${a.time}:00\`).getTime() || 0,
        dateStr: a.date,
        icon: 'map-pin'
      });
    });

    // 2. Izin Keluar
    exitPermissions.filter(e => e.pejuangId === currentUser.id).forEach(e => {
      activities.push({
        id: \`izin-\${e.id}\`,
        type: 'izin',
        title: 'Izin Keluar',
        description: \`Status: \${e.status} | Alasan: \${e.alasan}\`,
        timestamp: new Date(e.tanggalKeluar).getTime() || 0,
        dateStr: e.tanggalKeluar.split('T')[0] || '',
        icon: 'calendar-check'
      });
    });

    // 3. Cuti
    leaveRequests.filter(l => l.pejuangId === currentUser.id).forEach(l => {
      activities.push({
        id: \`cuti-\${l.id}\`,
        type: 'cuti',
        title: \`Cuti: \${l.jenisCuti}\`,
        description: \`Status: \${l.status} | \${l.tanggalMulai} s/d \${l.tanggalSelesai}\`,
        timestamp: new Date(l.tanggalPengajuan).getTime() || 0,
        dateStr: l.tanggalPengajuan.split('T')[0] || '',
        icon: 'calendar'
      });
    });

    // Sort by timestamp descending
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5); // Take top 5
  }, [attendance, exitPermissions, leaveRequests, currentUser]);

  const my14DaysChartData = React.useMemo(() => {`;
code = code.replace(anchor1, recentActivityMemo);

const uiAnchor = `        </div>
        </div>
      )}`;

const recentActivityUI = `        </div>
        
        {/* Recent Activity */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm mt-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" />
            Aktivitas Terkini
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map(act => (
                <div key={act.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${act.type === 'absensi' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : act.type === 'izin' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'}\`}>
                      {act.type === 'absensi' && <MapPin className="w-4 h-4" />}
                      {act.type === 'izin' && <CalendarCheck className="w-4 h-4" />}
                      {act.type === 'cuti' && <Calendar className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 w-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{act.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{act.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(act.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">Belum ada aktivitas.</p>
            )}
          </div>
        </div>
        </div>
      )}`;
code = code.replace(uiAnchor, recentActivityUI);

// Import Activity if missing
if (!code.includes('Activity,')) {
  code = code.replace('CalendarIcon\n}', 'CalendarIcon,\n  Activity\n}');
}

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('DashboardView patched with Recent Activity.');
