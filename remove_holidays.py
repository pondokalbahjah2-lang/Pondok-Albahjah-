import re

# 1. App.tsx
with open("src/App.tsx", "r") as f:
    app_content = f.read()

app_content = re.sub(r"import\s*\{\s*[^}]*HolidayRecord[^}]*\}\s*from\s*'./types';\n?", "import { UserAccount, AttendanceRecord, ExitPermissionRecord, LeaveRequestRecord, WarningLetterRecord, SlipUbarRecord, WorkSchedule, LocationSettings, ManhajiyyahClause, KajianRecord, GeneralSettings } from './types';\n", app_content)
app_content = re.sub(r"const\s+\[holidays,\s*setHolidays\]\s*=\s*useState<HolidayRecord\[\]>\(\[\]\);\n?", "", app_content)
app_content = re.sub(r"let\s+unsubHolidays\s*=\s*\(\)\s*=>\s*\{\};\n?", "", app_content)
app_content = re.sub(r"unsubHolidays\s*=\s*onSnapshot\(collection\(db,\s*'holidays'\),[^;]+;\n?", "", app_content)
app_content = re.sub(r"unsubHolidays\(\);\n?", "", app_content)
app_content = app_content.replace("holidays={holidays}", "")

with open("src/App.tsx", "w") as f:
    f.write(app_content)

# 2. SettingsView.tsx
with open("src/components/SettingsView.tsx", "r") as f:
    settings_content = f.read()

settings_content = re.sub(r"holidays\?: any\[\];\n?", "", settings_content)
settings_content = re.sub(r"holidays,\n?", "", settings_content)

# Remove the UI block for Hari Libur
hari_libur_pattern = r'<div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">.*?Pengaturan Hari Libur \(Tanggal Merah\).*?</div>\s*</div>\s*</div>'
# We will just find the index and remove it because regex on HTML can be tricky.
start_idx = settings_content.find('<div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">')
if start_idx != -1 and "Pengaturan Hari Libur" in settings_content[start_idx:start_idx+500]:
    end_idx = settings_content.find('      {/* Tab Content 3: Data Pejuang */}', start_idx)
    if end_idx != -1:
        settings_content = settings_content[:start_idx] + settings_content[end_idx:]

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(settings_content)

# 3. LaporanView.tsx
with open("src/components/LaporanView.tsx", "r") as f:
    laporan_content = f.read()

laporan_content = re.sub(r"holidays\?: any\[\];\n?", "", laporan_content)
laporan_content = re.sub(r"holidays\s*=\s*\[\],\n?", "", laporan_content)
# Revert the logic
laporan_content = laporan_content.replace(" || (holidays && holidays.some(h => h.tanggal === dateStr))", "")

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(laporan_content)

