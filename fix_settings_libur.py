import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

# 1. Add state
if "const [schTanggalLibur" not in content:
    content = content.replace(
        "const [customJamKerja, setCustomJamKerja] = useState<Record<string, { masuk: string, pulang: string }>>({});",
        "const [customJamKerja, setCustomJamKerja] = useState<Record<string, { masuk: string, pulang: string }>>({});\n  const [schTanggalLibur, setSchTanggalLibur] = useState<string[]>([]);"
    )

# 2. Add to handleEditSchedule
content = content.replace(
    "setCustomJamKerja(sch.customJamKerja || {});",
    "setCustomJamKerja(sch.customJamKerja || {});\n    setSchTanggalLibur(sch.tanggalLibur || []);"
)

# 3. Add to newSchedule
content = content.replace(
    "customJamKerja,",
    "customJamKerja,\n      tanggalLibur: schTanggalLibur,"
)

# 4. Clear it in handleAddSchedule success
content = content.replace(
    "setEditScheduleId('');",
    "setEditScheduleId('');\n    setSchTanggalLibur([]);"
)

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
