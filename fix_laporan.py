with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

content = content.replace("else if (att?.status === 'Sakit') sakit++;", "else if (att?.status === 'Sakit') sakit++;\n        else if (att?.status === 'Izin tidak masuk') izin++;")
content = content.replace("else if (att?.status === 'Sakit') {", "else if (att?.status === 'Izin tidak masuk') {\n          valMasuk = 'Izin';\n          valPulang = 'Izin';\n          totalIzin++;\n        } else if (att?.status === 'Sakit') {")
content = content.replace("} else if (att?.status === 'Sakit') {\n          valM = 'S'; valP = 'S'; totalSakit++;", "} else if (att?.status === 'Izin tidak masuk') {\n          valM = 'I'; valP = 'I'; totalIzin++;\n        } else if (att?.status === 'Sakit') {\n          valM = 'S'; valP = 'S'; totalSakit++;")

content = content.replace("a.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' :\n                          a.status === 'Terlambat' ? 'bg-orange-100 text-orange-700' :", "a.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' :\n                          a.status === 'Terlambat' ? 'bg-orange-100 text-orange-700' :\n                          a.status === 'Izin tidak masuk' ? 'bg-blue-100 text-blue-700' :")

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
