const fs = require('fs');
let code = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');

if (!code.includes('import { AlertTriangle')) {
  code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, AlertTriangle } from 'lucide-react';");
}

code = code.replace(
  'const [approvalTanggalKeluar, setApprovalTanggalKeluar] = useState(getLocalDateString(new Date()));',
  'const [approvalTanggalKeluar, setApprovalTanggalKeluar] = useState(getLocalDateString(new Date()));\n  const [confirmIzinAction, setConfirmIzinAction] = useState<{isRejected: boolean, event: any} | null>(null);'
);

const oldHandleSubmit = `  const handleSubmitApproval = (e: React.FormEvent, isRejected: boolean = false) => {
    e.preventDefault();
    if (!approvalRecord) return;
    const now = new Date();`;

const newHandleSubmit = `  const handleSubmitApprovalClick = (e: React.FormEvent, isRejected: boolean = false) => {
    e.preventDefault();
    if (navigator.vibrate) navigator.vibrate(50);
    setConfirmIzinAction({ isRejected, event: e });
  };

  const confirmSubmitApproval = () => {
    if (!confirmIzinAction || !approvalRecord) return;
    const { isRejected } = confirmIzinAction;
    const now = new Date();`;

code = code.replace(oldHandleSubmit, newHandleSubmit);

code = code.replace(/handleSubmitApproval\(e, true\)/g, 'handleSubmitApprovalClick(e, true)');
code = code.replace(/handleSubmitApproval\(e, false\)/g, 'handleSubmitApprovalClick(e, false)');

const executeConfirm = `      status: isRejected ? 'Ditolak' as const : 'Di Luar' as const, 
      tanggalKeluar: approvalTanggalKeluar,
      tanggalKembali: approvalTanggalKembali,
      waktuKeluar: isRejected ? undefined : approvedTimeStr
    } : p);
    onSaveExitPermissions(updated);
    setApprovalRecord(null);
    setConfirmIzinAction(null);
  };`;

code = code.replace(/status: isRejected \? 'Ditolak' as const : 'Di Luar' as const, [\s\S]*?setApprovalRecord\(null\);\n  };/, executeConfirm);

const modalCode = `
      {/* Confirmation Modal for Izin */}
      <AnimatePresence>
        {confirmIzinAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20 dark:border-slate-700"
            >
              <div className="flex flex-col items-center text-center">
                <div className={\`w-12 h-12 rounded-full flex items-center justify-center mb-4 \${!confirmIzinAction.isRejected ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}\`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">Konfirmasi Persetujuan</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Apakah Anda yakin ingin <strong className={!confirmIzinAction.isRejected ? 'text-emerald-600' : 'text-rose-600'}>{!confirmIzinAction.isRejected ? 'Menyetujui' : 'Menolak'}</strong> izin keluar ini?
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setConfirmIzinAction(null)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmSubmitApproval}
                    className={\`flex-1 py-3 rounded-2xl text-white font-bold text-xs shadow-lg \${!confirmIzinAction.isRejected ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'}\`}
                  >
                    Ya, {!confirmIzinAction.isRejected ? 'Setuju' : 'Tolak'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

code = code.replace('    </div>\n  );\n};', modalCode + '\n    </div>\n  );\n};');

fs.writeFileSync('src/components/IzinKeluarView.tsx', code);
console.log('Patched IzinKeluarView with confirm dialog');
