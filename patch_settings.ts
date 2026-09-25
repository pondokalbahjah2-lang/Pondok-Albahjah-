import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

// State for Manhajiyyah editor
const stateToAdd = `
  // Manhajiyyah State
  const [showManhajiyyahModal, setShowManhajiyyahModal] = useState(false);
  const [editingManhajiyyahId, setEditingManhajiyyahId] = useState<string | null>(null);
  const [manBab, setManBab] = useState('');
  const [manPasalNumber, setManPasalNumber] = useState('');
  const [manTitle, setManTitle] = useState('');
  const [manCategory, setManCategory] = useState('');
  const [manContent, setManContent] = useState('');
`;

content = content.replace(/  const \[activeTab, setActiveTab\] = useState/, stateToAdd + '\n  const [activeTab, setActiveTab] = useState');

// Handler for Manhajiyyah save
const handlerToAdd = `
  const handleSaveManhajiyyah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const newClause: ManhajiyyahClause = {
      id: editingManhajiyyahId || \`man-\${Date.now()}\`,
      bab: manBab,
      pasalNumber: manPasalNumber,
      title: manTitle,
      category: manCategory,
      content: manContent
    };
    
    let updated: ManhajiyyahClause[];
    if (editingManhajiyyahId) {
      updated = manhajiyyahClauses.map(c => c.id === editingManhajiyyahId ? newClause : c);
    } else {
      updated = [...manhajiyyahClauses, newClause];
    }
    
    onSaveManhajiyyahClauses(updated);
    setShowManhajiyyahModal(false);
    setEditingManhajiyyahId(null);
    setManBab('');
    setManPasalNumber('');
    setManTitle('');
    setManCategory('');
    setManContent('');
  };
  
  const handleDeleteManhajiyyah = (id: string) => {
    if (!window.confirm("Hapus pasal ini?")) return;
    const updated = manhajiyyahClauses.filter(c => c.id !== id);
    onSaveManhajiyyahClauses(updated);
  };
`;

content = content.replace(/  const handleBackupData = \(\) => \{/, handlerToAdd + '\n  const handleBackupData = () => {');

const uiReplacement = `      {activeTab === 'manhajiah' && (
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Kaidah Manhajiah Pejuang Al-Bahjah ({manhajiyyahClauses.length} Pasal)</span>
            </h2>
            {isAdmin && (
              <button 
                onClick={() => {
                  setEditingManhajiyyahId(null);
                  setManBab('');
                  setManPasalNumber('');
                  setManTitle('');
                  setManCategory('');
                  setManContent('');
                  setShowManhajiyyahModal(true);
                }}
                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                + Tambah Pasal
              </button>
            )}
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {manhajiyyahClauses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 relative group"
              >
                {isAdmin && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button 
                      onClick={() => {
                        setEditingManhajiyyahId(c.id);
                        setManBab(c.bab || '');
                        setManPasalNumber(c.pasalNumber?.toString() || '');
                        setManTitle(c.title);
                        setManCategory(c.category);
                        setManContent(c.content);
                        setShowManhajiyyahModal(true);
                      }}
                      className="p-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteManhajiyyah(c.id)}
                      className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg"
                    >
                      Hapus
                    </button>
                  </div>
                )}
                <div className="flex flex-col space-y-1">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400 text-xs">
                    {c.bab ? \`Bab \${c.bab}\` : ''} {c.category ? \`- \${c.category}\` : ''}
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                    Pasal {c.pasalNumber}: {c.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Manhajiyyah */}
      {showManhajiyyahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">
                {editingManhajiyyahId ? 'Edit Pasal Manhajiah' : 'Tambah Pasal Manhajiah Baru'}
              </h3>
              <button
                onClick={() => setShowManhajiyyahModal(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveManhajiyyah} className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bab (Opsional)</label>
                  <input
                    type="text"
                    value={manBab}
                    onChange={(e) => setManBab(e.target.value)}
                    placeholder="Contoh: I / II / III"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori / Topik</label>
                  <input
                    type="text"
                    value={manCategory}
                    onChange={(e) => setManCategory(e.target.value)}
                    placeholder="Contoh: Kedisiplinan"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No Pasal</label>
                  <input
                    type="text"
                    required
                    value={manPasalNumber}
                    onChange={(e) => setManPasalNumber(e.target.value)}
                    placeholder="Contoh: 1 / 1A"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-8">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Pasal</label>
                  <input
                    type="text"
                    required
                    value={manTitle}
                    onChange={(e) => setManTitle(e.target.value)}
                    placeholder="Contoh: Kewajiban Mengajar"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Isi Pasal</label>
                <textarea
                  required
                  rows={8}
                  value={manContent}
                  onChange={(e) => setManContent(e.target.value)}
                  placeholder="Ketik isi / detail pasal di sini..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Simpan Pasal
              </button>
            </form>
          </div>
        </div>
      )}`;

content = content.replace(/      \{activeTab === 'manhajiah' && \([\s\S]*?\}\)/, uiReplacement);
fs.writeFileSync('src/components/SettingsView.tsx', content);
