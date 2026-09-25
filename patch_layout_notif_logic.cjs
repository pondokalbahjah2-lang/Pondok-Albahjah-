const fs = require('fs');
let code = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');

// replace the old approvedLeaves logic with the new notifications logic
const oldLogic = `
  const approvedLeaves = leaveRequests.filter(
    l => l.pejuangId === currentUser.id && l.status === 'Disetujui'
  ).sort((a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime());

  const hasNotifications = approvedLeaves.length > 0;
`;

const newLogic = `
  const unreadNotifications = notifications.filter(n => !n.read);
  const hasNotifications = unreadNotifications.length > 0;
`;

code = code.replace(oldLogic, newLogic);

// now replace the rendering of notifications in both places
// first place: desktop header
const oldDesktopRender = `{approvedLeaves.map(l => (
                        <div key={l.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Cuti {l.jenisCuti} Disetujui!</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{l.catatanAdmin || 'Oleh Admin'}</p>
                        </div>
                      ))}`;

const newDesktopRender = `{unreadNotifications.map(n => (
                        <div key={n.id} onClick={() => onMarkNotificationRead && onMarkNotificationRead(n.id)} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden cursor-pointer hover:bg-slate-50">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{n.message}</p>
                        </div>
                      ))}`;

code = code.replace(oldDesktopRender, newDesktopRender);

// second place: mobile header
const oldMobileRender = `{approvedLeaves.map(l => (
                        <div key={l.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Cuti {l.jenisCuti} Disetujui!</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{l.catatanAdmin || 'Oleh Admin'}</p>
                        </div>
                      ))}`;

code = code.replace(oldMobileRender, newDesktopRender);

fs.writeFileSync('src/components/iOSGlassLayout.tsx', code);
console.log('Patched layout notif logic');
