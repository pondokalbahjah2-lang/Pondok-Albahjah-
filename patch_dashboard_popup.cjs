const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const popupState = `  const [activeWarning, setActiveWarning] = useState<WarningLetterRecord | null>(null);

  React.useEffect(() => {
    if (currentUser.role === 'Pejuang') {
      const myWarnings = warningLetters.filter(w => w.pejuangId === currentUser.id);
      if (myWarnings.length > 0) {
        // Sort descending
        myWarnings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latest = myWarnings[0];
        const isDismissed = localStorage.getItem(\`dismissedWarning_\${latest.id}\`);
        if (!isDismissed) {
          setActiveWarning(latest);
        }
      }
    }
  }, [warningLetters, currentUser]);

  const dismissWarning = () => {
    if (activeWarning) {
      localStorage.setItem(\`dismissedWarning_\${activeWarning.id}\`, 'true');
      setActiveWarning(null);
    }
  };
`;

content = content.replace(
  'const [pejuangCurrentPage, setPejuangCurrentPage] = useState(1);',
  'const [pejuangCurrentPage, setPejuangCurrentPage] = useState(1);\n' + popupState
);

const popupUI = `
      {/* Warning Letter Popup */}
      {activeWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl relative border-t-8 border-rose-500 animate-in fade-in zoom-in duration-300">
            <button onClick={dismissWarning} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Peringatan Baru!</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Anda menerima <strong>Surat Teguran</strong> baru dari Admin pada tanggal {activeWarning.date}.
            </p>
            <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 mb-6">
              <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 mb-1">Tingkat Teguran:</h4>
              <p className="text-sm text-slate-800 dark:text-slate-200 mb-3">{activeWarning.warningLevel}</p>
              
              <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 mb-1">Alasan/Pelanggaran:</h4>
              <p className="text-sm text-slate-800 dark:text-slate-200">{activeWarning.reason}</p>
            </div>
            <button 
              onClick={dismissWarning}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
`;

content = content.replace(
  '<div className="space-y-6">',
  '<div className="space-y-6">\n' + popupUI
);

// Add X icon to lucide-react imports if not there
if (!content.includes('X,')) {
    content = content.replace('Users,', 'X,\n  Users,');
}

fs.writeFileSync('src/components/DashboardView.tsx', content);
