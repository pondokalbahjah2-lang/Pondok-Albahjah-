import re

with open("src/components/CutiView.tsx", "r") as f:
    content = f.read()

# Modify handleCreateLeaveRequest to check if currentUser is Admin
# If yes, set status to 'Disetujui', else 'Menunggu Persetujuan'

pattern = r"(const newReq: LeaveRequestRecord = \{[^}]+status:\s*)'Menunggu Persetujuan'"
replacement = r"\1currentUser.role === 'Admin' ? 'Disetujui' : 'Menunggu Persetujuan'"

content = re.sub(pattern, replacement, content)

# If admin creates it, also add approvedBy and approvedAt
pattern2 = r"(const newReq: LeaveRequestRecord = \{[\s\S]*?tanggalPengajuan: new Date\(\)\.toISOString\(\),)"
replacement2 = r"\1\n      ...(currentUser.role === 'Admin' ? { approvedBy: currentUser.name, approvedAt: new Date().toISOString() } : {}),"

content = re.sub(pattern2, replacement2, content)

with open("src/components/CutiView.tsx", "w") as f:
    f.write(content)
