const fs = require('fs');
let code = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');

code = code.replace(
  "import { getLocalDateString, getFormattedTime } from '../utils/dateUtils';",
  "import { getLocalDateString, getFormattedTime } from '../utils/dateUtils';\nimport { doc, setDoc, collection } from 'firebase/firestore';\nimport { db } from '../utils/firebase';"
);

const handleApproveLogic = `
  const confirmSubmitApproval = async () => {
    if (!confirmIzinAction || !approvalRecord) return;
    const { isRejected } = confirmIzinAction;
    const now = new Date();
    const approvedTimeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const approvedDateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
       
    const newStatus = isRejected ? 'Ditolak' as const : 'Di Luar' as const;
    const newHistory = [...(approvalRecord.history || []), {
      status: newStatus,
      by: currentUser.name,
      timestamp: new Date().toISOString()
    }];

    const updated = exitPermissions.map(p => p.id === approvalRecord.id ? { 
      ...p, 
      status: newStatus, 
      tanggalKeluar: approvalTanggalKeluar,
      tanggalIzinSampai: approvalTanggalIzinSampai,
      jamKeluar: approvalJamKeluar,
      jamHarusKembali: approvalJamHarusKembali,
      approvedBy: currentUser.name,
      approvedAt: \`\${approvedDateStr} pukul \${approvedTimeStr}\`,
      history: newHistory
    } : p);
    onSaveExitPermissions(updated);

    try {
      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        userId: approvalRecord.pejuangId,
        title: \`Pengajuan Izin Keluar \${newStatus}\`,
        message: \`Pengajuan izin keluar Anda (\${approvalTanggalKeluar}) telah \${newStatus} oleh \${currentUser.name}.\`,
        timestamp: new Date().toISOString(),
        read: false
      });
    } catch (e) {
      console.error('Error sending notification', e);
    }

    setApprovalRecord(null);
    setConfirmIzinAction(null);
  };
`;

code = code.replace(
  /const confirmSubmitApproval = \(\) => \{[\s\S]*?setConfirmIzinAction\(null\);\n  \};/,
  handleApproveLogic
);


const renderHistory = `
                      {rec.history && rec.history.length > 0 && (
                        <div className="mt-2 text-left">
                          <p className="text-[9px] font-bold text-slate-500 mb-1">Riwayat Status:</p>
                          <ul className="text-[9px] text-slate-400 space-y-0.5 list-disc pl-3">
                            {rec.history.map((h, i) => (
                              <li key={i}>{h.status} oleh {h.by} pada {new Date(h.timestamp).toLocaleString('id-ID')}</li>
                            ))}
                          </ul>
                        </div>
                      )}
`;

code = code.replace(
  "                      {rec.keteranganKeterlambatan && (\n                        <span className=\"text-[10px] text-rose-500 block\">\n                          {rec.keteranganKeterlambatan}\n                        </span>\n                      )}",
  "                      {rec.keteranganKeterlambatan && (\n                        <span className=\"text-[10px] text-rose-500 block\">\n                          {rec.keteranganKeterlambatan}\n                        </span>\n                      )}\n" + renderHistory
);

fs.writeFileSync('src/components/IzinKeluarView.tsx', code);
console.log('Patched IzinKeluarView');
