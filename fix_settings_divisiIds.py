import re
with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

# Add state
if "const [schDivisiIds" not in content:
    content = content.replace(
        "const [schPejuangIds, setSchPejuangIds] = useState<string[]>([]);",
        "const [schPejuangIds, setSchPejuangIds] = useState<string[]>([]);\n  const [schDivisiIds, setSchDivisiIds] = useState<string[]>([]);"
    )

# Add to handleEditSchedule
content = content.replace(
    "setSchPejuangIds(sch.pejuangIds || []);",
    "setSchPejuangIds(sch.pejuangIds || []);\n    setSchDivisiIds(sch.divisiIds || []);"
)

# Add to newSchedule
content = content.replace(
    "pejuangIds: schTargetType === 'Group' ? schPejuangIds : undefined",
    "pejuangIds: schTargetType === 'Group' ? schPejuangIds : undefined,\n      divisiIds: schTargetType === 'Group' ? schDivisiIds : undefined"
)

# Clear in handleAddSchedule success
content = content.replace(
    "setSchPejuangIds([]);",
    "setSchPejuangIds([]);\n    setSchDivisiIds([]);"
)

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
