import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

reset_logic = """onClick={() => {
                setEditScheduleId('');
                setSchTargetType('Divisi');
                setSchTargetName('');
                setSchJamMasuk('04:30');
                setSchJamPulang('16:00');
                setSchHariKerja(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);
                setSchPejuangIds([]);
                setSchDivisiIds([]);
                setSchTanggalLibur([]);
                setCustomJamKerja({});
                setShowAddScheduleModal(true);
              }}"""

content = content.replace("onClick={() => setShowAddScheduleModal(true)}", reset_logic)

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
