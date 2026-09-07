with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

target = """        } else if (att?.status === 'Izin tidak masuk') {
          valMasuk = 'Izin';
          valPulang = 'Izin';
          totalIzin++;
        } else if (att?.status === 'Izin tidak masuk') {
          valM = 'I'; valP = 'I'; totalIzin++;
        } else if (att?.status === 'Sakit') {"""

replacement = """        } else if (att?.status === 'Izin tidak masuk') {
          valM = 'I'; valP = 'I'; totalIzin++;
        } else if (att?.status === 'Sakit') {"""

content = content.replace(target, replacement)

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
