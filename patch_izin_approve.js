const fs = require('fs');
let content = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');
content = content.replace(/<button\s+onClick=\{\(\) => \{\s+const now = new Date\(\);\s+const approvedTimeStr = now.toLocaleTimeString\('id-ID', \{ hour: '2-digit', minute: '2-digit' \}\);\s+const approvedDateStr = now.toLocaleDateString\('id-ID', \{ day: '2-digit', month: 'long', year: 'numeric' \}\);\s+const updated = exitPermissions.map\(p => p.id === rec.id \? \{\s+\.\.\.p,\s+status: 'Di Luar' as const,\s+approvedBy: currentUser.name,\s+approvedAt: `\$\{approvedDateStr\} pukul \$\{approvedTimeStr\}`\s+\} : p\);\s+onSaveExitPermissions\(updated\);\s+\}\}\s+className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-\[11px\] transition-colors shadow-sm"\s+>\s+Approve\s+<\/button>/, `<button
                          onClick={() => handleOpenApprovalModal(rec)}
                          className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors shadow-sm"
                        >
                          Approve
                        </button>`);
fs.writeFileSync('src/components/IzinKeluarView.tsx', content);
