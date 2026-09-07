import re
with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

content = content.replace("else if (status === 'Sakit') totalSakit++;", "else if (status === 'Sakit') totalSakit++;\n      else if (status === 'Izin tidak masuk') totalIzinKeluar++;")

content = content.replace("else if (a.status === 'Terlambat') terlambat++;\n          else if (a.status === 'Sakit') sakit++;", "else if (a.status === 'Terlambat') terlambat++;\n          else if (a.status === 'Sakit') sakit++;\n          else if (a.status === 'Izin tidak masuk') izin++;")

content = content.replace("const sakitList = todayAttendance.filter(a => a.status === 'Sakit');", "const sakitList = todayAttendance.filter(a => a.status === 'Sakit');\n    const izinList = todayAttendance.filter(a => a.status === 'Izin tidak masuk');")

content = content.replace("const pejuangSakit = pejuangTanpaKehadiran.filter(p => sakitList.some(s => s.pejuangId === p.id));", "const pejuangSakit = pejuangTanpaKehadiran.filter(p => sakitList.some(s => s.pejuangId === p.id));\n  const pejuangIzinTidakMasuk = pejuangTanpaKehadiran.filter(p => izinList.some(i => i.pejuangId === p.id));")

content = content.replace("const pejuangTanpaKeterangan = pejuangTanpaKehadiran.filter(p => !pejuangCutiHariIni.some(c => c.pejuangId === p.id) && !pejuangSakit.some(s => s.id === p.id) && !pejuangLibur.some(l => l.id === p.id));", "const pejuangTanpaKeterangan = pejuangTanpaKehadiran.filter(p => !pejuangCutiHariIni.some(c => c.pejuangId === p.id) && !pejuangSakit.some(s => s.id === p.id) && !pejuangIzinTidakMasuk.some(i => i.id === p.id) && !pejuangLibur.some(l => l.id === p.id));")

content = content.replace("else if (record.status === 'Sakit') { statusVal = 1; fill = '#3b82f6'; }", "else if (record.status === 'Sakit') { statusVal = 1; fill = '#3b82f6'; }\n        else if (record.status === 'Izin tidak masuk') { statusVal = 1; fill = '#8b5cf6'; }")

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
