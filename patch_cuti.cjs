const fs = require('fs');
let code = fs.readFileSync('src/components/CutiView.tsx', 'utf8');

code = code.replace(
  "import { getLocalDateString } from '../utils/dateUtils';",
  "import { getLocalDateString } from '../utils/dateUtils';\nimport { doc, setDoc, collection } from 'firebase/firestore';\nimport { db } from '../utils/firebase';"
);

const handleApproveRejectLogic = `
  const handleApproveReject = async (
    id: string,
    newStatus: 'Disetujui' | 'Ditolak' | 'Sedang Cuti'
  ) => {
    let targetPejuangId = '';
    let jenisCutiNotif = '';
    const updated = leaveRequests.map((l) => {
      if (l.id === id) {
        targetPejuangId = l.pejuangId;
        jenisCutiNotif = l.jenisCuti;
        const now = new Date();
        const approvedTimeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const approvedDateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const newHistory = [...(l.history || []), {
          status: newStatus,
          by: currentUser.name,
          timestamp: new Date().toISOString()
        }];
        return {
          ...l,
          status: newStatus,
          approvedBy: currentUser.name,
          approvedAt: \`\${approvedDateStr} pukul \${approvedTimeStr}\`,
          catatanAdmin: \`Diverifikasi oleh \${currentUser.name} pada \${new Date().toLocaleDateString('id-ID')}\`,
          history: newHistory
        };
      }
      return l;
    });
    onSaveLeaveRequests(updated);

    if (targetPejuangId && (newStatus === 'Disetujui' || newStatus === 'Ditolak')) {
      try {
        const notifRef = doc(collection(db, 'notifications'));
        await setDoc(notifRef, {
          userId: targetPejuangId,
          title: \`Pengajuan Cuti \${newStatus}\`,
          message: \`Pengajuan cuti \${jenisCutiNotif} Anda telah \${newStatus} oleh \${currentUser.name}.\`,
          timestamp: new Date().toISOString(),
          read: false
        });
      } catch (e) {
        console.error('Error sending notification', e);
      }
    }
  };
`;

code = code.replace(
  /const handleApproveReject = \([\s\S]*?onSaveLeaveRequests\(updated\);\n  };/,
  handleApproveRejectLogic
);

// We also need to add remaining cuti logic in PDF
// Let's find PDF generation in CutiView.tsx
const pdfLogic = `
      // get sisa cuti
      const sisaCuti = getSisaCutiTahunan(rec.pejuangId);

      doc.setFontSize(10);
      doc.text(\`Telah kami setujui pengajuan cuti yang bersangkutan.\`, 20, yPos);
      yPos += 7;
      
      doc.text(\`Sisa jatah Cuti Tahunan: \${sisaCuti} Hari\`, 20, yPos);
      yPos += 15;
`;

code = code.replace(
  "doc.text(`Telah kami setujui pengajuan cuti yang bersangkutan.`, 20, yPos);\n      yPos += 20;",
  pdfLogic
);

// We need to show audit log history if the user clicks on it, or just show it underneath.
// Since it's easier, let's just show it in the table or add a simple "Riwayat" button that alerts, or simply render it if expanded?
// Render a small text for latest history or tooltip?
// Actually, I can just render it below the 'catatanAdmin'.
const renderHistory = `
                      {req.history && req.history.length > 0 && (
                        <div className="mt-2 text-left">
                          <p className="text-[9px] font-bold text-slate-500 mb-1">Riwayat Status:</p>
                          <ul className="text-[9px] text-slate-400 space-y-0.5 list-disc pl-3">
                            {req.history.map((h, i) => (
                              <li key={i}>{h.status} oleh {h.by} pada {new Date(h.timestamp).toLocaleString('id-ID')}</li>
                            ))}
                          </ul>
                        </div>
                      )}
`;

code = code.replace(
  "                      {req.status !== 'Menunggu Persetujuan' && req.status !== 'Disetujui' && (\n                        <span className=\"text-[11px] text-slate-400 italic\">\n                          {req.catatanAdmin || 'Selesai'}\n                        </span>\n                      )}",
  "                      {req.status !== 'Menunggu Persetujuan' && req.status !== 'Disetujui' && (\n                        <span className=\"text-[11px] text-slate-400 italic\">\n                          {req.catatanAdmin || 'Selesai'}\n                        </span>\n                      )}\n" + renderHistory
);

fs.writeFileSync('src/components/CutiView.tsx', code);
console.log('Patched CutiView');
