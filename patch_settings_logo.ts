import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

// The Logo setting should be in the "profil" tab for Admin, or maybe a new general/system settings section.
// The user says "tambahkan fitur pada pengaturan untuk mengupload logo Pondok" -> Profil Admin.

const uploadLogic = `
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSaveGeneralSettings) {
      if (file.size > 1024 * 1024 * 2) {
        alert("Ukuran logo maksimal 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onSaveGeneralSettings({ appLogoUrl: base64String });
        alert("Logo berhasil diperbarui!");
      };
      reader.readAsDataURL(file);
    }
  };
`;

content = content.replace(/  const handleSaveManhajiyyah = /, uploadLogic + '\n  const handleSaveManhajiyyah = ');

// Inject Props
content = content.replace(/  onSaveManhajiyyahClauses: \(clauses: ManhajiyyahClause\[\]\) => void;/, `  onSaveManhajiyyahClauses: (clauses: ManhajiyyahClause[]) => void;\n  appLogoUrl?: string;\n  onSaveGeneralSettings?: (gen: { appLogoUrl?: string }) => void;`);
content = content.replace(/  onSaveManhajiyyahClauses,\n\}\) => \{/, `  onSaveManhajiyyahClauses,\n  appLogoUrl,\n  onSaveGeneralSettings\n}) => {`);

// Add Logo UI to Profil tab for Admin
const logoUI = `
            {isAdmin && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 mt-4">
                <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                  <Image className="w-4 h-4 text-blue-600" />
                  <span>Logo Aplikasi (Portal Pejuang)</span>
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                    {appLogoUrl ? (
                      <img src={appLogoUrl} alt="App Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-xs text-slate-400">Kosong</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block w-full text-center py-2 px-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs font-bold">
                      <span>Upload Logo Baru</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoUpload}
                      />
                    </label>
                    <p className="text-[10px] text-slate-500 mt-1.5">Format: JPG, PNG (Maks 2MB). Akan mengubah logo di seluruh sistem.</p>
                  </div>
                </div>
              </div>
            )}
`;

content = content.replace(/<Settings className="w-4 h-4 text-indigo-500" \/>\n                  <span>Data Profil Sistem<\/span>\n                <\/h3>\n                <div className="space-y-3">/, `<Settings className="w-4 h-4 text-indigo-500" />
                  <span>Data Profil Sistem</span>
                </h3>
                ${logoUI}
                <div className="space-y-3 mt-4">`);

content = `import { Image } from 'lucide-react';\n` + content;

fs.writeFileSync('src/components/SettingsView.tsx', content);
console.log("Patched SettingsView for Logo");
