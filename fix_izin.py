import re

files_to_fix = [
    "src/components/AbsensiView.tsx",
    "src/components/LaporanView.tsx",
    "src/components/DashboardView.tsx",
    "src/types.ts"
]

for file_path in files_to_fix:
    with open(file_path, "r") as f:
        content = f.read()
    
    # We will replace all occurrences of 'Izin tidak masuk' with 'Izin'
    content = content.replace("'Izin tidak masuk'", "'Izin'")
    # Also replace display labels
    content = content.replace("Izin Tidak Masuk", "Izin")
    content = content.replace("Izin Tdk Masuk", "Izin")
    
    with open(file_path, "w") as f:
        f.write(content)
