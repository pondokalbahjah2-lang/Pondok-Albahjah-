with open("src/components/AbsensiView.tsx", "r") as f:
    content = f.read()
content = content.replace("{(['Hadir', 'Sakit', 'Libur', 'Pulang'] as const).map((st) => (", "{(['Hadir', 'Sakit', 'Libur', 'Izin tidak masuk', 'Pulang'] as const).map((st) => (")
with open("src/components/AbsensiView.tsx", "w") as f:
    f.write(content)
