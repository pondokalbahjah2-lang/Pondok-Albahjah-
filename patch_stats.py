import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

pattern = re.compile(
    r"const todayStats = React\.useMemo\(\(\) => \{.*?"
    r"return \{ total: totalPejuang, hadir, terlambat, sakit, libur, belumAbsen \};\n"
    r"  \}, \[accounts, attendance\]\);",
    re.DOTALL
)

replacement = """const todayStats = React.useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    const pejuangs = accounts.filter(a => a.role === 'Pejuang');
    const totalPejuang = pejuangs.length;
    
    const todayAttendance = attendance.filter(a => a.date === todayStr);
    const hadirList = todayAttendance.filter(a => a.status === 'Hadir');
    const terlambatList = todayAttendance.filter(a => a.status === 'Terlambat');
    const sakitList = todayAttendance.filter(a => a.status === 'Sakit');
    const liburList = todayAttendance.filter(a => a.status === 'Libur');

    const attendeesIds = new Set(todayAttendance.map(a => a.pejuangId));
    const belumAbsenList = pejuangs.filter(p => !attendeesIds.has(p.id));
    
    return {
      total: totalPejuang,
      hadir: hadirList.length,
      terlambat: terlambatList.length,
      sakit: sakitList.length,
      libur: liburList.length,
      belumAbsen: belumAbsenList.length,
      lists: {
        hadir: hadirList,
        terlambat: terlambatList,
        sakit: sakitList,
        libur: liburList,
        belumAbsen: belumAbsenList
      }
    };
  }, [attendance, accounts]);"""

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(pattern.sub(replacement, content))
