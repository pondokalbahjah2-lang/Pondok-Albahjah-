with open("src/types.ts", "r") as f:
    content = f.read()

# Add HolidayRecord
if "interface HolidayRecord" not in content:
    content += "\nexport interface HolidayRecord {\n  id: string;\n  tanggal: string;\n  keterangan: string;\n}\n"

# Update WorkSchedule
old_ws = """export interface WorkSchedule {
  id: string;
  targetType: 'Divisi' | 'Individu';
  targetId: string; // SubDivisi name or Pejuang ID
  targetName: string;
  jamMasuk: string; // e.g. "07:00"
  jamPulang: string; // e.g. "16:00"
  hariKerja: string[]; // e.g. ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
}"""

new_ws = """export interface WorkSchedule {
  id: string;
  targetType: 'Divisi' | 'Individu' | 'Group';
  targetId: string; // SubDivisi name or Pejuang ID or "Group"
  targetName: string;
  jamMasuk: string; // e.g. "07:00"
  jamPulang: string; // e.g. "16:00"
  hariKerja: string[]; // e.g. ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  customJamKerja?: Record<string, { masuk: string, pulang: string }>;
  pejuangIds?: string[];
  divisiIds?: string[];
}"""

content = content.replace(old_ws, new_ws)

with open("src/types.ts", "w") as f:
    f.write(content)
