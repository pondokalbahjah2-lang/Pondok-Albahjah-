const fs = require('fs');
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf8');

content = content.replace(
  "a.timePulang ? a.timePulang : (a.date < getLocalDateString() ? 'Tidak Absen Pulang' : '-'),",
  "a.timePulang ? a.timePulang : (['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : (a.date < getLocalDateString() ? 'Tidak Absen Pulang' : '-')),"
);

content = content.replace(
  "<td className=\"p-2.5 font-bold text-amber-600\">{a.timePulang ? a.timePulang : (a.date < getLocalDateString() ? 'Tidak Absen Pulang' : '-')}</td>",
  "<td className=\"p-2.5 font-bold text-amber-600\">{a.timePulang ? a.timePulang : (['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : (a.date < getLocalDateString() ? 'Tidak Absen Pulang' : '-'))}</td>"
);

fs.writeFileSync('src/components/LaporanView.tsx', content);
