const fs = require('fs');
let content = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf-8');
content = content.replace(
  `                        <button
                          onClick={() => handleOpenApprovalModal(rec)}
                          className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition-colors shadow-sm"
                        >
                          Approve
                        </button>`,
  `                        <button
                          onClick={() => handleOpenApprovalModal(rec)}
                          className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition-colors shadow-sm"
                        >
                          Review / Proses
                        </button>`
);
fs.writeFileSync('src/components/IzinKeluarView.tsx', content);
