const fs = require('fs');
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf8');

const oldLogicPDF = `    const attBody = userAtt.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => [
      a.date,
      a.time,
      a.timePulang ? a.timePulang : (['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : (a.date < getLocalDateString() ? 'Tidak Absen Pulang' : '-')),
      a.status,
      a.notes || '-'
    ]);`;

const newLogicPDF = `    const attBody = userAtt.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => [
      a.date,
      ['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : a.time,
      ['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : (a.timePulang ? a.timePulang : (a.date < getLocalDateString() ? 'Tidak Absen Pulang' : '-')),
      a.status,
      a.notes || '-'
    ]);`;

const oldLogicHTML = `                      <td className="p-2.5 font-medium">{a.date}</td>
                      <td className="p-2.5 font-bold text-emerald-600">{a.time}</td>
                      <td className="p-2.5 font-bold text-amber-600">{a.timePulang ? a.timePulang : (['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : (a.date < getLocalDateString() ? 'Tidak Absen Pulang' : '-'))}</td>`;

const newLogicHTML = `                      <td className="p-2.5 font-medium">{a.date}</td>
                      <td className="p-2.5 font-bold text-emerald-600">{['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : a.time}</td>
                      <td className="p-2.5 font-bold text-amber-600">{['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : (a.timePulang ? a.timePulang : (a.date < getLocalDateString() ? 'Tidak Absen Pulang' : '-'))}</td>`;


if (content.includes(oldLogicPDF)) {
  content = content.replace(oldLogicPDF, newLogicPDF);
} else {
  console.log("oldLogicPDF not found");
}

if (content.includes(oldLogicHTML)) {
  content = content.replace(oldLogicHTML, newLogicHTML);
} else {
  console.log("oldLogicHTML not found");
}

fs.writeFileSync('src/components/LaporanView.tsx', content);
console.log("LaporanView updated successfully.");
