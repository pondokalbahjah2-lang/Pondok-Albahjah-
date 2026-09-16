const fs = require('fs');

let izinCode = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');

if (!izinCode.includes('setConfirmIzinAction')) {
  izinCode = izinCode.replace('const [approvalRecord, setApprovalRecord] = useState<ExitPermissionRecord | null>(null);', 
    'const [approvalRecord, setApprovalRecord] = useState<ExitPermissionRecord | null>(null);\n  const [confirmIzinAction, setConfirmIzinAction] = useState<{isRejected: boolean, event: any} | null>(null);');
}

izinCode = izinCode.replace(/approvalTanggalKembali/g, 'approvalTanggalIzinSampai');

fs.writeFileSync('src/components/IzinKeluarView.tsx', izinCode);
console.log('Fixed IzinKeluar state');
