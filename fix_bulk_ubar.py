import re

with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

# 1. Replace state
content = content.replace(
    "const [bulkRows, setBulkRows] = useState([{ pejuangId: '', gdriveLink: '', password: '' }]);",
    "const [bulkData, setBulkData] = useState<Record<string, { gdriveLink: string, password: string }>>({});"
)

# 2. Extract and replace handleBulkUploadSlip block
target_fn = content[content.find("const handleBulkUploadSlip"):content.find("  const [revealSlipId", content.find("const handleBulkUploadSlip"))]

new_fn = """const handleBulkUploadSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlips: SlipUbarRecord[] = [];
    
    let errorLines = 0;
    Object.keys(bulkData).forEach(pId => {
      const data = bulkData[pId];
      if (!data.gdriveLink) return;
      
      const pejuangObj = pejuangAccounts.find(p => p.id === pId);
      if (pejuangObj) {
        const finalFileName = `Slip_Ubar_${pejuangObj.name.replace(/\\s+/g, '_')}_${bulkPeriode.replace(/\\s+/g, '')}`;
        newSlips.push({
          id: `ubar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pejuangId: pejuangObj.id,
          pejuangName: pejuangObj.name,
          periode: bulkPeriode,
          tanggalUpload: getLocalDateString(new Date()),
          fileName: finalFileName,
          fileUrl: data.gdriveLink,
          filePassword: data.password
        });
      } else {
        errorLines++;
      }
    });

    if (newSlips.length > 0) {
      onSaveSlipUbar([...newSlips, ...slipUbarList]);
      alert(`Berhasil mengunggah ${newSlips.length} slip ubar massal.` + (errorLines > 0 ? ` Gagal memproses ${errorLines} baris.` : ''));
      setBulkData({});
    } else {
      alert('Tidak ada slip ubar yang berhasil diproses. Pastikan data terisi dengan benar.');
    }
  };

"""

content = content.replace(target_fn, new_fn)

# 3. Replace UI
ui_target = r"(\{\s*bulkRows\.map\(\(row, index\) => \([\s\S]*?\)\s*\}\s*</div>\s*<button\s*type=\"button\"\s*onClick=\{\(\) => setBulkRows\(\[\.\.\.bulkRows, \{ pejuangId: '', gdriveLink: '', password: '' \}\]\)\}[\s\S]*?</button>)"

new_ui = """{pejuangAccounts.filter(p => bulkSubDivisiFilter === 'Semua' || p.subDivisi === bulkSubDivisiFilter).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="w-1/3 truncate font-bold text-xs text-slate-700 dark:text-slate-200" title={p.name}>
                      {p.name}
                    </div>
                    <input
                      type="url"
                      placeholder="Link GDrive..."
                      value={bulkData[p.id]?.gdriveLink || ''}
                      onChange={(e) => {
                        setBulkData(prev => ({
                          ...prev,
                          [p.id]: { ...(prev[p.id] || {}), gdriveLink: e.target.value }
                        }));
                      }}
                      className="w-1/3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="Password (opsional)..."
                      value={bulkData[p.id]?.password || ''}
                      onChange={(e) => {
                        setBulkData(prev => ({
                          ...prev,
                          [p.id]: { ...(prev[p.id] || {}), password: e.target.value }
                        }));
                      }}
                      className="w-1/3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                ))}
              </div>"""

content = re.sub(ui_target, new_ui, content)

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)
