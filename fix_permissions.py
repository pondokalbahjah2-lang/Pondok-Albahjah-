import re

def update_file(filename, list_name):
    with open(filename, "r") as f:
        content = f.read()

    new_filter = f"""  const isApprover = (recSubDivisi: string) => {{
    if (currentUser.role === 'Admin') return true;
    const amanah = (currentUser.amanah || '').toLowerCase();
    const isLeader = amanah.includes('ketua') || amanah.includes('kepala') || amanah.includes('manajer') || amanah.includes('manager') || amanah.includes('koordinator');
    return isLeader && currentUser.subDivisi === recSubDivisi;
  }};

  const filteredRecords = {list_name}.filter((rec) => {{
    const matchesUser = isApprover(rec.subDivisi) || rec.pejuangId === currentUser.id;"""

    content = re.sub(rf"  const filteredRecords = {list_name}\.filter\(\(rec\) => {{\n    // If pejuang role, show only own records unless admin\n    const matchesUser =\n      currentUser\.role === 'Admin' \|\| rec\.pejuangId === currentUser\.id;", new_filter, content)
    
    with open(filename, "w") as f:
        f.write(content)

update_file("src/components/IzinKeluarView.tsx", "exitPermissions")
update_file("src/components/PengajuanCutiView.tsx", "leaveRequests")
