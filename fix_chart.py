with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

# Fix Izin naming in chart
content = content.replace("{ name: 'Izin Tdk Masuk', Total: izinTdkMasuk, fill: '#3b82f6' }", "{ name: 'Izin', Total: izinTdkMasuk, fill: '#3b82f6' }")

# Add holiday logic to overall chart
old_logic = """        else if (att?.status === 'Izin tidak masuk') izinTdkMasuk++;
        else if (att?.status === 'Libur') libur++;"""

new_logic = """        else if (att?.status === 'Izin tidak masuk') izinTdkMasuk++;
        else if (att?.status === 'Libur' || (holidays && holidays.some(h => h.tanggal === dateStr))) libur++;"""

content = content.replace(old_logic, new_logic)

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
