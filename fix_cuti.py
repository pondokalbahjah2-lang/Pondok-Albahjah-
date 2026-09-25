with open("src/components/CutiView.tsx", "r") as f:
    content = f.read()

# Fix tanggalSelesai calculation
old_calc_tahunan = """        const start = new Date(tanggalMulai);
        start.setDate(start.getDate() + (durasiCutiTahunan - 1));
        setTanggalSelesai(getLocalDateString(start));"""
new_calc_tahunan = """        const start = new Date(tanggalMulai);
        start.setDate(start.getDate() + durasiCutiTahunan);
        setTanggalSelesai(getLocalDateString(start));"""

old_calc_other = """        const max = selectedJenis?.maxDays || 1;
        const start = new Date(tanggalMulai);
        start.setDate(start.getDate() + (max - 1));
        setTanggalSelesai(getLocalDateString(start));"""
new_calc_other = """        const max = selectedJenis?.maxDays || 1;
        const start = new Date(tanggalMulai);
        start.setDate(start.getDate() + max);
        setTanggalSelesai(getLocalDateString(start));"""

content = content.replace(old_calc_tahunan, new_calc_tahunan)
content = content.replace(old_calc_other, new_calc_other)

# Update totalHari calculation
old_total = """    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const totalHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;"""

new_total = """    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const totalHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Karena end adalah tanggal kembali"""

content = content.replace(old_total, new_total)

with open("src/components/CutiView.tsx", "w") as f:
    f.write(content)
