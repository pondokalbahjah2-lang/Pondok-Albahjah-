const fs = require('fs');

// Patch IzinKeluarView.tsx
let izinContent = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf-8');

// 1. Fix isApprover logic
const isApproverTarget = `  const isApprover = (recSubDivisi: string) => {
    if (currentUser.role === 'Admin') return true;
    const amanah = (currentUser.amanah || '').toLowerCase();`;
const isApproverReplacement = `  const isApprover = (recSubDivisi: string) => {
    if (currentUser.role === 'Admin') return true;
    if (izinKeluarApprovers.includes(currentUser.id)) return true;
    const amanah = (currentUser.amanah || '').toLowerCase();`;
izinContent = izinContent.replace(isApproverTarget, isApproverReplacement);

// 2. Fix button rendering
const buttonTarget = `{rec.status === 'Menunggu Persetujuan' && (currentUser.role === 'Admin' || izinKeluarApprovers.includes(currentUser.id)) && (`
const buttonReplacement = `{rec.status === 'Menunggu Persetujuan' && isApprover(rec.subDivisi) && (`
izinContent = izinContent.replace(buttonTarget, buttonReplacement);

// 3. Fix status filters
const filterTarget = `          {['Semua', 'Di Luar', 'Kembali Tepat Waktu', 'Terlambat'].map((st) => (`
const filterReplacement = `          {['Semua', 'Menunggu Persetujuan', 'Di Luar', 'Kembali Tepat Waktu', 'Terlambat', 'Ditolak'].map((st) => (`
izinContent = izinContent.replace(filterTarget, filterReplacement);

fs.writeFileSync('src/components/IzinKeluarView.tsx', izinContent);

// Patch CutiView.tsx
let cutiContent = fs.readFileSync('src/components/CutiView.tsx', 'utf-8');

// 1. Add isCutiApprover logic
const cutiFilterTarget = `  // Filtered requests
  const filteredRequests = leaveRequests.filter((l) => {
    const matchesUser =
      currentUser.role === 'Admin' || l.pejuangId === currentUser.id;`;
const cutiFilterReplacement = `  const isCutiApprover = (recSubDivisi: string) => {
    if (currentUser.role === 'Admin') return true;
    if (cutiApprovers.includes(currentUser.id)) return true;
    const amanah = (currentUser.amanah || '').toLowerCase();
    const isLeader = amanah.includes('ketua') || amanah.includes('kepala') || amanah.includes('manajer') || amanah.includes('manager') || amanah.includes('koordinator');
    return isLeader && currentUser.subDivisi === recSubDivisi;
  };

  // Filtered requests
  const filteredRequests = leaveRequests.filter((l) => {
    const matchesUser = isCutiApprover(l.subDivisi) || l.pejuangId === currentUser.id;`;
cutiContent = cutiContent.replace(cutiFilterTarget, cutiFilterReplacement);

// 2. Fix button rendering
const cutiButtonTarget = `{req.status === 'Menunggu Persetujuan' && (currentUser.role === 'Admin' || cutiApprovers.includes(currentUser.id)) && (`
const cutiButtonReplacement = `{req.status === 'Menunggu Persetujuan' && isCutiApprover(req.subDivisi) && (`
cutiContent = cutiContent.replace(cutiButtonTarget, cutiButtonReplacement);

fs.writeFileSync('src/components/CutiView.tsx', cutiContent);

console.log('Patched correctly.');
