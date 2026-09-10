with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

# Replace the Libur check logic
old_logic = "} else if (att?.status === 'Libur' || !hariKerja.includes(namaHari)) {"
new_logic = "} else if (att?.status === 'Libur' || !hariKerja.includes(namaHari) || (userSchedule?.tanggalLibur && userSchedule.tanggalLibur.includes(dateStr))) {"
content = content.replace(old_logic, new_logic)

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
