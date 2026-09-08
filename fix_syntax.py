with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

content = content.replace("onSaveSchedules([...schedules,\n  holidays, newSchedule]);", "onSaveSchedules([...schedules, newSchedule]);")
content = content.replace("onSaveSchedules([...schedules,  holidays, newSchedule]);", "onSaveSchedules([...schedules, newSchedule]);")

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
