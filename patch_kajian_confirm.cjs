const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

if (!code.includes('import { motion')) {
  code = "import { motion, AnimatePresence } from 'framer-motion';\n" + code;
}
if (!code.includes('import { AlertTriangle')) {
  code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, AlertTriangle } from 'lucide-react';");
}

code = code.replace(
  'const [filterEndDate, setFilterEndDate] = useState(getLocalDateString(new Date()));',
  'const [filterEndDate, setFilterEndDate] = useState(getLocalDateString(new Date()));\n  const [confirmAction, setConfirmAction] = useState<{id: string, status: "Valid" | "Ditolak"} | null>(null);'
);

code = code.replace(
  `  const handleValidate = (id: string, status: 'Valid' | 'Ditolak') => {
    const updatedRecords = kajianRecords.map(r => r.id === id ? { ...r, statusValidasi: status } : r);
    onSaveKajian(updatedRecords);
  };`,
  `  const handleValidateClick = (id: string, status: 'Valid' | 'Ditolak') => {
    if (navigator.vibrate) navigator.vibrate(50);
    setConfirmAction({ id, status });
  };

  const confirmValidation = () => {
    if (!confirmAction) return;
    const { id, status } = confirmAction;
    const updatedRecords = kajianRecords.map(r => r.id === id ? { ...r, statusValidasi: status } : r);
    onSaveKajian(updatedRecords);
    setConfirmAction(null);
  };`
);

code = code.replace(/handleValidate\(/g, 'handleValidateClick(');

const modalCode = `
      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20 dark:border-slate-700"
            >
              <div className="flex flex-col items-center text-center">
                <div className={\`w-12 h-12 rounded-full flex items-center justify-center mb-4 \${confirmAction.status === 'Valid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}\`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">Konfirmasi Validasi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Apakah Anda yakin ingin memberikan status <strong className={confirmAction.status === 'Valid' ? 'text-emerald-600' : 'text-rose-600'}>{confirmAction.status}</strong> pada catatan kajian ini?
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmValidation}
                    className={\`flex-1 py-3 rounded-2xl text-white font-bold text-xs shadow-lg \${confirmAction.status === 'Valid' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'}\`}
                  >
                    Ya, {confirmAction.status}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

code = code.replace('    </div>\n  );\n};', modalCode + '\n    </div>\n  );\n};');

fs.writeFileSync('src/components/KajianView.tsx', code);
console.log('Patched KajianView with confirm dialog');
