import re

with open("src/components/CutiView.tsx", "r") as f:
    content = f.read()

# Add a checkbox for manual entry in the add modal for Admin
target_form = """<form onSubmit={handleCreateLeaveRequest} className="space-y-4">"""
replacement = """<form onSubmit={handleCreateLeaveRequest} className="space-y-4">
              {currentUser.role === 'Admin' && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-slate-800/50 rounded-xl border border-slate-700">
                  <input
                    type="checkbox"
                    id="manualEntry"
                    checked={isManualEntry}
                    onChange={(e) => setIsManualEntry(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded bg-slate-800 border-slate-700 focus:ring-emerald-500"
                  />
                  <label htmlFor="manualEntry" className="text-xs font-semibold text-emerald-400">
                    Bypass Approval (Input Data Historis Cuti)
                  </label>
                </div>
              )}"""

if "isManualEntry" not in content:
    content = content.replace("const [nipy, setNipy] = useState('');", "const [nipy, setNipy] = useState('');\n  const [isManualEntry, setIsManualEntry] = useState(false);")
    content = content.replace(target_form, replacement)

# Update handleCreateLeaveRequest
target_submit = """const newRequest: LeaveRequestRecord = {
      id: `cuti-${Date.now()}`,
      pejuangId: targetPejuangId,
      pejuangName: pejuangObj.name,
      nipy,
      subDivisi: pejuangObj.subDivisi || currentUser.subDivisi,
      jenisCuti,
      alasan,
      tanggalMulai,
      tanggalSelesai: finalTanggalSelesai,
      totalHari,
      status: 'Menunggu Persetujuan',
      tanggalPengajuan: getLocalDateString(new Date()),
    };"""
replacement_submit = """const newRequest: LeaveRequestRecord = {
      id: `cuti-${Date.now()}`,
      pejuangId: targetPejuangId,
      pejuangName: pejuangObj.name,
      nipy,
      subDivisi: pejuangObj.subDivisi || currentUser.subDivisi,
      jenisCuti,
      alasan,
      tanggalMulai,
      tanggalSelesai: finalTanggalSelesai,
      totalHari,
      status: (currentUser.role === 'Admin' && isManualEntry) ? 'Disetujui' : 'Menunggu Persetujuan',
      tanggalPengajuan: getLocalDateString(new Date()),
      approvedBy: (currentUser.role === 'Admin' && isManualEntry) ? currentUser.name : undefined,
      approvedAt: (currentUser.role === 'Admin' && isManualEntry) ? getLocalDateString(new Date()) : undefined,
    };"""
content = content.replace(target_submit, replacement_submit)

with open("src/components/CutiView.tsx", "w") as f:
    f.write(content)

