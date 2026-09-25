with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

content = content.replace("const [customJamKerja,\n      tanggalLibur: schTanggalLibur, setCustomJamKerja]", "const [customJamKerja, setCustomJamKerja]")
content = content.replace("const [customJamKerja,\n      tanggalLibur: schTanggalLibur,\n      divisiIds: schTargetType === 'Group' ? schDivisiIds : undefined setCustomJamKerja]", "const [customJamKerja, setCustomJamKerja]")

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
