const fs = require('fs');
let code = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');

code = code.replace(
  "  exitPermissions?: any[];",
  "  exitPermissions?: any[];\n  izinKeluarApprovers?: string[];\n  cutiApprovers?: string[];"
);

code = code.replace(
  "  leaveRequests = [],\n  exitPermissions = [],",
  "  leaveRequests = [],\n  exitPermissions = [],\n  izinKeluarApprovers = [],\n  cutiApprovers = [],"
);

const isApproverLogic = `
  const isCutiApprover = (recSubDivisi: string) => {
    if (currentUser.role === 'Admin') return true;
    if (cutiApprovers.includes(currentUser.id)) return true;
    const amanah = (currentUser.amanah || '').toLowerCase();
    const isLeader = amanah.includes('ketua') || amanah.includes('kepala') || amanah.includes('manajer') || amanah.includes('manager') || amanah.includes('koordinator');
    return isLeader && currentUser.subDivisi === recSubDivisi;
  };

  const isIzinApprover = (recSubDivisi: string) => {
    if (currentUser.role === 'Admin') return true;
    if (izinKeluarApprovers.includes(currentUser.id)) return true;
    const amanah = (currentUser.amanah || '').toLowerCase();
    const isLeader = amanah.includes('ketua') || amanah.includes('kepala') || amanah.includes('manajer') || amanah.includes('manager') || amanah.includes('koordinator');
    return isLeader && currentUser.subDivisi === recSubDivisi;
  };
`;

code = code.replace(
  "  const pendingCutiCount = currentUser.role === 'Admin' ? leaveRequests.filter(l => l.status === 'Menunggu').length : 0;",
  isApproverLogic + "\n  const pendingCutiCount = leaveRequests.filter(l => l.status === 'Menunggu Persetujuan' && (isCutiApprover(l.subDivisi) || l.pejuangId === currentUser.id)).length;"
);

code = code.replace(
  "  const pendingIzinCount = currentUser.role === 'Admin' ? exitPermissions.filter(e => e.status === 'Menunggu').length : 0;",
  "  const pendingIzinCount = exitPermissions.filter(e => e.status === 'Menunggu Persetujuan' && (isIzinApprover(e.subDivisi) || e.pejuangId === currentUser.id)).length;"
);

code = code.replace(
  "  const pendingIzinCountUser = currentUser.role !== 'Admin' ? exitPermissions.filter(e => e.pejuangId === currentUser.id && e.status === 'Menunggu').length : 0;",
  "  const pendingIzinCountUser = pendingIzinCount;"
);

fs.writeFileSync('src/components/iOSGlassLayout.tsx', code);
console.log('Patched iOSGlassLayout');
