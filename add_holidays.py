import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add import
if "HolidayRecord" not in content:
    content = content.replace("GeneralSettings }", "GeneralSettings, HolidayRecord }")

# Add state
state_line = "  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);\n"
if state_line not in content:
    content = content.replace("  const [showDesyncBanner, setShowDesyncBanner] = useState(false);", state_line + "  const [showDesyncBanner, setShowDesyncBanner] = useState(false);")

# Add sync logic
sync_logic = """
    const unsubHolidays = onSnapshot(collection(db, 'holidays'), (snap) => {
      const h: HolidayRecord[] = [];
      snap.forEach((docSnap) => h.push(docSnap.data() as HolidayRecord));
      setHolidays(h);
    }, (err) => console.log('Holidays sync err'));
"""
if "unsubHolidays" not in content:
    content = content.replace("    // Sync Manhajiyyah Clauses", sync_logic + "\n    // Sync Manhajiyyah Clauses")

# Add cleanup
if "unsubHolidays" in sync_logic and "unsubHolidays()" not in content:
    content = content.replace("unsubManhaj();", "unsubManhaj();\n      unsubHolidays();")

# Pass to SettingsView
settings_view = "<SettingsView"
if "holidays={holidays}" not in content:
    # Need to pass holidays and setHolidays or a save handler.
    # Actually, saving directly in SettingsView using Firebase is better.
    content = content.replace("schedules={schedules}", "schedules={schedules}\nholidays={holidays}")

# Pass to LaporanView
laporan_view = "<LaporanView"
if "holidays={holidays}" not in content and laporan_view in content:
    content = content.replace("schedules={schedules}", "schedules={schedules}\nholidays={holidays}")

with open("src/App.tsx", "w") as f:
    f.write(content)
