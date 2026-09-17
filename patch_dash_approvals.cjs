const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const logic = `
  const isCutiApprover = cutiApprovers.includes(currentUser.id) || 
    (() => {
      const amanah = (currentUser.amanah || '').toLowerCase();
      return (amanah.includes('ketua') || amanah.includes('kepala') || amanah.includes('manajer') || amanah.includes('manager') || amanah.includes('koordinator'));
    })();

  const isIzinApprover = izinKeluarApprovers.includes(currentUser.id) || 
    (() => {
      const amanah = (currentUser.amanah || '').toLowerCase();
      return (amanah.includes('ketua') || amanah.includes('kepala') || amanah.includes('manajer') || amanah.includes('manager') || amanah.includes('koordinator'));
    })();

  const pendingCutiForMe = leaveRequests.filter(l => l.status === 'Menunggu Persetujuan' && (isCutiApprover && l.subDivisi === currentUser.subDivisi || cutiApprovers.includes(currentUser.id)));
  const pendingIzinForMe = exitPermissions.filter(e => e.status === 'Menunggu Persetujuan' && (isIzinApprover && e.subDivisi === currentUser.subDivisi || izinKeluarApprovers.includes(currentUser.id)));
`;

code = code.replace(
  "  const [searchQuery, setSearchQuery] = useState('');",
  logic + "\n  const [searchQuery, setSearchQuery] = useState('');"
);

const approverDashboard = `
      {/* Approver Dashboard Widget */}
      {currentUser.role === 'Pejuang' && (pendingCutiForMe.length > 0 || pendingIzinForMe.length > 0) && (
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 shadow-xl mt-6">
          <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Menunggu Persetujuan Anda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingCutiForMe.length > 0 && (
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Pengajuan Cuti</h4>
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold">{pendingCutiForMe.length}</span>
                </div>
                <div className="space-y-2">
                  {pendingCutiForMe.slice(0, 3).map(req => (
                    <div key={req.id} className="text-xs flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{req.pejuangName}</p>
                        <p className="text-[10px] text-slate-500">{req.jenisCuti} ({req.totalHari} Hari)</p>
                      </div>
                      <button onClick={() => onNavigate('cuti')} className="text-emerald-600 hover:text-emerald-700 font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">Review</button>
                    </div>
                  ))}
                  {pendingCutiForMe.length > 3 && (
                    <button onClick={() => onNavigate('cuti')} className="w-full text-center text-[10px] font-bold text-slate-500 mt-2 hover:text-emerald-600">Lihat Semua</button>
                  )}
                </div>
              </div>
            )}
            
            {pendingIzinForMe.length > 0 && (
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Izin Keluar</h4>
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold">{pendingIzinForMe.length}</span>
                </div>
                <div className="space-y-2">
                  {pendingIzinForMe.slice(0, 3).map(req => (
                    <div key={req.id} className="text-xs flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{req.pejuangName}</p>
                        <p className="text-[10px] text-slate-500">{req.alasan.substring(0, 20)}...</p>
                      </div>
                      <button onClick={() => onNavigate('izin')} className="text-emerald-600 hover:text-emerald-700 font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">Review</button>
                    </div>
                  ))}
                  {pendingIzinForMe.length > 3 && (
                    <button onClick={() => onNavigate('izin')} className="w-full text-center text-[10px] font-bold text-slate-500 mt-2 hover:text-emerald-600">Lihat Semua</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
`;

code = code.replace(
  "{/* Main Actions - Pejuang Only */}",
  approverDashboard + "\n      {/* Main Actions - Pejuang Only */}"
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('Patched dashboard approver');
