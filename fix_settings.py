import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

# Add states for edit schedule and custom jam kerja
if "const [editScheduleId, setEditScheduleId]" not in content:
    content = content.replace(
        "const [schHariKerja, setSchHariKerja] = useState<string[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);",
        "const [schHariKerja, setSchHariKerja] = useState<string[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);\n  const [editScheduleId, setEditScheduleId] = useState('');\n  const [customJamKerja, setCustomJamKerja] = useState<Record<string, { masuk: string, pulang: string }>>({});"
    )

# Add edit schedule logic
if "const handleEditSchedule" not in content:
    edit_func = """
  const handleEditSchedule = (sch: WorkSchedule) => {
    setEditScheduleId(sch.id);
    setSchTargetType(sch.targetType);
    setSchTargetName(sch.targetName);
    setSchJamMasuk(sch.jamMasuk);
    setSchJamPulang(sch.jamPulang);
    setSchHariKerja(sch.hariKerja || []);
    setCustomJamKerja(sch.customJamKerja || {});
    setShowAddScheduleModal(true);
  };
"""
    content = content.replace("const handleAddSchedule = (e: React.FormEvent) => {", edit_func + "\n  const handleAddSchedule = (e: React.FormEvent) => {")

# Update handleAddSchedule to handle edit and customJamKerja
handle_add_old = """
    const newSchedule: WorkSchedule = {
      id: `sch-${Date.now()}`,
      targetType: schTargetType,
      targetId: schTargetType === 'Individu' ? (targetPejuang?.id || finalTargetName) : finalTargetName,
      targetName: finalTargetName,
      jamMasuk: schJamMasuk,
      jamPulang: schJamPulang,
      hariKerja: schHariKerja
    };
    onSaveSchedules([...schedules, newSchedule]);
    setShowAddScheduleModal(false);
"""
handle_add_new = """
    const newSchedule: WorkSchedule = {
      id: editScheduleId || `sch-${Date.now()}`,
      targetType: schTargetType,
      targetId: schTargetType === 'Individu' ? (targetPejuang?.id || finalTargetName) : finalTargetName,
      targetName: finalTargetName,
      jamMasuk: schJamMasuk,
      jamPulang: schJamPulang,
      hariKerja: schHariKerja,
      customJamKerja
    };
    if (editScheduleId) {
      onSaveSchedules(schedules.map(s => s.id === editScheduleId ? newSchedule : s));
    } else {
      onSaveSchedules([...schedules, newSchedule]);
    }
    setShowAddScheduleModal(false);
    setEditScheduleId('');
"""
content = content.replace(handle_add_old, handle_add_new)

# Make sure edit button is in the UI
if "onClick={() => handleEditSchedule(sch)}" not in content:
    content = content.replace(
        "className=\"p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold transition-colors\"",
        "className=\"p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold transition-colors\""
    )
    # Actually need to add an Edit button next to Delete
    edit_button = """                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => handleEditSchedule(sch)} className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold transition-colors"><CheckCircle className="w-4 h-4" /></button>
                    <button onClick={() => { if(window.confirm('Hapus jadwal ini?')) onSaveSchedules(schedules.filter(s => s.id !== sch.id)) }} className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold transition-colors"><X className="w-4 h-4" /></button>
                  </div>"""
    # Let's replace the delete button
    del_button_regex = r'<button\s*onClick=\{\(\) => \{\s*if\s*\(window\.confirm\(\'Hapus jadwal ini\?\'\)\)\s*onSaveSchedules\(schedules\.filter\(\(s\) => s\.id !== sch\.id\)\);\s*\}\}\s*className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold transition-colors"\s*>\s*<X className="w-4 h-4" />\s*</button>'
    content = re.sub(del_button_regex, edit_button, content)


with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
