import re

with open("src/components/IzinKeluarView.tsx", "r") as f:
    content = f.read()

submit_approval_logic = """  const handleSubmitApproval = (e: React.FormEvent, isRejected: boolean = false) => {
    e.preventDefault();
    if (!approvalRecord) return;
    const now = new Date();
    const approvedTimeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const approvedDateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
       
    const updated = exitPermissions.map(p => p.id === approvalRecord.id ? { 
      ...p, 
      status: isRejected ? 'Ditolak' as const : 'Di Luar' as const, 
      tanggalKeluar: approvalTanggalKeluar,
      tanggalIzinSampai: approvalTanggalIzinSampai,
      jamKeluar: approvalJamKeluar,
      jamHarusKembali: approvalJamHarusKembali,
      approvedBy: currentUser.name,
      approvedAt: `${approvedDateStr} pukul ${approvedTimeStr}`
    } : p);
    onSaveExitPermissions(updated);
    setApprovalRecord(null);
  };"""

content = re.sub(r"  const handleSubmitApproval = \(e: React.FormEvent\) => \{.*?setApprovalRecord\(null\);\n  \};\n", submit_approval_logic + "\n", content, flags=re.DOTALL)

with open("src/components/IzinKeluarView.tsx", "w") as f:
    f.write(content)

