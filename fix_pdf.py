with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

content = content.replace("['Sakit', totalSakit],", "['Sakit', totalSakit],\n      ['Izin Tidak Masuk', userAtt.filter((a) => a.status === 'Izin tidak masuk').length],")

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
