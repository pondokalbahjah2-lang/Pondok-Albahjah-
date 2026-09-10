const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

content = content.replace(
  "{activeListModal === 'izinTdkMasuk' && 'Daftar Izin'}",
  "{activeListModal === 'izinTdkMasuk' && 'Daftar Izin'}\n                  {activeListModal === 'pengajuanCuti' && 'Daftar Pengajuan Cuti'}\n                  {activeListModal === 'sedangCuti' && 'Daftar Sedang Cuti'}"
);

// We need to add click handlers to the cards.
content = content.replace(
  '        {/* Total Sakit */}\n        <div className="p-4 rounded-3xl',
  '        {/* Total Sakit */}\n        <div onClick={() => setActiveListModal(\'sakit\')} className="p-4 rounded-3xl cursor-pointer hover:scale-105 transition-transform'
);

content = content.replace(
  '        {/* Total Libur */}\n        <div className="p-4 rounded-3xl',
  '        {/* Total Libur */}\n        <div onClick={() => setActiveListModal(\'libur\')} className="p-4 rounded-3xl cursor-pointer hover:scale-105 transition-transform'
);

content = content.replace(
  '        {/* Mengajukan Cuti */}\n        <div className="p-4 rounded-3xl',
  '        {/* Mengajukan Cuti */}\n        <div onClick={() => setActiveListModal(\'pengajuanCuti\')} className="p-4 rounded-3xl cursor-pointer hover:scale-105 transition-transform'
);

content = content.replace(
  '        {/* Sedang Cuti */}\n        <div className="p-4 rounded-3xl',
  '        {/* Sedang Cuti */}\n        <div onClick={() => setActiveListModal(\'sedangCuti\')} className="p-4 rounded-3xl cursor-pointer hover:scale-105 transition-transform'
);

content = content.replace(
  '        {/* Total Izin / Tidak Hadir */}\n        <div className="p-4 rounded-3xl',
  '        {/* Total Izin / Tidak Hadir */}\n        <div onClick={() => setActiveListModal(\'izinTdkMasuk\')} className="p-4 rounded-3xl cursor-pointer hover:scale-105 transition-transform'
);


fs.writeFileSync('src/components/DashboardView.tsx', content);
