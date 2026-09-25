const fs = require('fs');

let content = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf-8');

const target = `                      className={\`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold \${
                        rec.status === 'Di Luar'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                          : rec.status === 'Terlambat'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                      }\`}`;

const replacement = `                      className={\`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold \${
                        rec.status === 'Di Luar'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                          : rec.status === 'Terlambat' || rec.status === 'Ditolak'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                          : rec.status === 'Menunggu Persetujuan'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                      }\`}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/IzinKeluarView.tsx', content);

console.log("Status colors patched.");
