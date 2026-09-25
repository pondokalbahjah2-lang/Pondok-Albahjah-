with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

# Make sure ClipboardList is imported
if "ClipboardList" not in content:
    content = content.replace("  Key,\n} from 'lucide-react';", "  Key,\n  ClipboardList,\n} from 'lucide-react';")

# Make sure states are declared
if "showLogModal" not in content:
    states = """  const [showLogModal, setShowLogModal] = useState(false);
  const [bulkLogs, setBulkLogs] = useState<{pejuangName: string, id: string, status: string, message: string}[]>([]);"""
    content = content.replace("  const [currentPage, setCurrentPage] = useState(1);", "  const [currentPage, setCurrentPage] = useState(1);\n" + states)

# Rewrite handleBulkUploadSlip
start_idx = content.find("  const handleBulkUploadSlip = (e: React.FormEvent) => {")
end_idx = content.find("  };", start_idx) + 4

new_bulk = """  const handleBulkUploadSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlips: SlipUbarRecord[] = [];
    const currentLogs: {pejuangName: string, id: string, status: string, message: string}[] = [];
    
    let errorLines = 0;
    Object.keys(bulkData).forEach(pId => {
      const data = bulkData[pId];
      if (!data.gdriveLink) return;
      
      const pejuangObj = pejuangAccounts.find(p => p.id === pId);
      if (pejuangObj) {
        // Unique Check Logic - Validate pejuangId explicitly
        if (pId !== pejuangObj.id) {
           currentLogs.push({ pejuangName: pejuangObj.name, id: pId, status: 'Failed', message: 'ID Mismatch (Keamanan Gagal)' });
           errorLines++;
           return;
        }
        
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
        currentLogs.push({ pejuangName: pejuangObj.name, id: pId, status: 'Success', message: `Tersambung (Periode ${bulkPeriode})` });
      } else {
        currentLogs.push({ pejuangName: 'Unknown', id: pId, status: 'Failed', message: 'Akun Pejuang tidak ditemukan' });
        errorLines++;
      }
    });

    if (newSlips.length > 0) {
      onSaveSlipUbar([...newSlips, ...slipUbarList]);
      setBulkLogs(currentLogs);
      setShowLogModal(true);
      setBulkData({});
    } else {
      alert('Tidak ada link GDrive yang valid untuk diunggah.');
    }
  };"""

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_bulk + content[end_idx:]

# Add Modal
if "Audit Log Modal" not in content:
    modal_code = """
      {/* Audit Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-3xl w-full shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>Log Audit Upload Massal Slip Ubar</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
               <table className="w-full text-left text-xs">
                 <thead className="bg-slate-800 text-slate-300 uppercase text-[10px] font-bold sticky top-0">
                   <tr>
                     <th className="py-2 px-2">Pejuang</th>
                     <th className="py-2 px-2">ID Validasi</th>
                     <th className="py-2 px-2">Status</th>
                     <th className="py-2 px-2">Keterangan</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800/50">
                   {bulkLogs.map((log, idx) => (
                     <tr key={idx} className="hover:bg-slate-800/50">
                       <td className="py-2 px-2 font-bold">{log.pejuangName}</td>
                       <td className="py-2 px-2 text-[10px] text-slate-400 font-mono">{log.id.slice(0, 8)}...</td>
                       <td className="py-2 px-2">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'Success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                           {log.status}
                         </span>
                       </td>
                       <td className="py-2 px-2 text-slate-300">{log.message}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
            
            <button
              onClick={() => setShowLogModal(false)}
              className="mt-4 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Tutup Log
            </button>
          </div>
        </div>
      )}
"""
    idx = content.rfind("    </div>\n  );\n};")
    if idx != -1:
        content = content[:idx] + modal_code + content[idx:]

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)

