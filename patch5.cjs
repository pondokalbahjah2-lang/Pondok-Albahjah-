const fs = require('fs');
let code = fs.readFileSync('src/components/LaporanView.tsx', 'utf8');

const targetPDF = `    const attBody = userAtt.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => [
      a.date,
      ['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : a.time,
      ['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : (a.timePulang ? a.timePulang : (a.date < getLogicalAttendanceDateStr(accounts.find(u => u.id === a.pejuangId)) ? 'Tidak Absen Pulang' : '-')),
      a.status,
      a.notes || '-'
    ]);`;

const replacementPDF = `    const attBody = userAtt.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => [
      a.date,
      ['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : a.time,
      ['Sakit', 'Libur', 'Cuti'].includes(a.status) ? a.status : (a.timePulang ? a.timePulang : (a.date < getLogicalAttendanceDateStr(accounts.find(u => u.id === a.pejuangId)) ? 'Tidak Absen Pulang' : '-')),
      a.status,
      (a.notes || '-') + (a.suratSakitUrl ? ' (Ada Surat Sakit)' : '')
    ]);`;

code = code.replace(targetPDF, replacementPDF);

const targetHTML = `                      <td className="p-2.5 truncate max-w-[150px]">{a.notes || '-'}</td>`;

const replacementHTML = `                      <td className="p-2.5 max-w-[150px]">
                        <div className="truncate">{a.notes || '-'}</div>
                        {a.suratSakitUrl && (
                          <a href={a.suratSakitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-[10px] block mt-1">
                            Lihat Surat Sakit
                          </a>
                        )}
                      </td>`;

code = code.replace(targetHTML, replacementHTML);
fs.writeFileSync('src/components/LaporanView.tsx', code);
console.log('patched LaporanView');
