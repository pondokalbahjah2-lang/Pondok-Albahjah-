const fs = require('fs');
let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

const targetNotes = `                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-[150px] truncate">
                        {rec.notes || '-'}
                      </td>`;

const replacementNotes = `                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-[150px] truncate">
                        <div>{rec.notes || '-'}</div>
                        {rec.suratSakitUrl && (
                          <a href={rec.suratSakitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-1 block">
                            Lihat Surat Sakit
                          </a>
                        )}
                      </td>`;

code = code.replace(targetNotes, replacementNotes);
fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('patched notes with surat sakit');
