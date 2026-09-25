import re

with open("src/components/CutiView.tsx", "r") as f:
    content = f.read()

new_filter = """  const isApprover = (recSubDivisi: string) => {
    if (currentUser.role === 'Admin') return true;
    const amanah = (currentUser.amanah || '').toLowerCase();
    const isLeader = amanah.includes('ketua') || amanah.includes('kepala') || amanah.includes('manajer') || amanah.includes('manager') || amanah.includes('koordinator');
    return isLeader && currentUser.subDivisi === recSubDivisi;
  };

  const filteredRecords = leaveRequests.filter((rec) => {
    const matchesUser = isApprover(rec.subDivisi) || rec.pejuangId === currentUser.id;"""

content = re.sub(r"  const filteredRecords = leaveRequests\.filter\(\(rec\) => \{\n    const matchesUser =\n      currentUser\.role === 'Admin' \|\| rec\.pejuangId === currentUser\.id;", new_filter, content)

with open("src/components/CutiView.tsx", "w") as f:
    f.write(content)
