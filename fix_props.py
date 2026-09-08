with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

if "holidays: HolidayRecord[];" not in content:
    content = content.replace("schedules: WorkSchedule[];", "schedules: WorkSchedule[];\n  holidays?: any[];")
    content = content.replace("schedules,", "schedules,\n  holidays,")
    with open("src/components/SettingsView.tsx", "w") as f:
        f.write(content)

with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

if "holidays?: any[];" not in content:
    content = content.replace("schedules?: any[];", "schedules?: any[];\n  holidays?: any[];")
    content = content.replace("schedules,", "schedules,\n  holidays = [],")
    with open("src/components/LaporanView.tsx", "w") as f:
        f.write(content)
