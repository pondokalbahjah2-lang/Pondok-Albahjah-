with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

# Add holidays check
content = content.replace("} else if (att?.status === 'Libur' || !hariKerja.includes(namaHari)) {", "} else if (att?.status === 'Libur' || !hariKerja.includes(namaHari) || (holidays && holidays.some(h => h.tanggal === dateStr))) {")

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
