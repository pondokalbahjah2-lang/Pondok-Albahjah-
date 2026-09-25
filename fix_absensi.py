with open("src/components/AbsensiView.tsx", "r") as f:
    content = f.read()

# Replace schedule check logic
old_schedule_find = """      const userSchedule = schedules.find(
        (s) => s.targetName.includes(currentUser.subDivisi) || s.targetId === currentUser.id
      ) || schedules[0];"""

new_schedule_find_masuk = """    const hariMap = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const currDay = hariMap[new Date().getDay()];
    const userSchedule = schedules.find(
      (s) => s.targetId === currentUser.id || s.targetId === currentUser.subDivisi || (s.targetType === 'Group' && s.pejuangIds?.includes(currentUser.id))
    ) || schedules[0];
    const jamMasuk = userSchedule?.customJamKerja?.[currDay]?.masuk || userSchedule?.jamMasuk || '04:30';"""

new_schedule_find_pulang = """      const hariMap = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const currDay = hariMap[new Date().getDay()];
      const userSchedule = schedules.find(
        (s) => s.targetId === currentUser.id || s.targetId === currentUser.subDivisi || (s.targetType === 'Group' && s.pejuangIds?.includes(currentUser.id))
      ) || schedules[0];
      const jamPulang = userSchedule?.customJamKerja?.[currDay]?.pulang || userSchedule?.jamPulang || '16:00';"""

content = content.replace(
    "    // Check work schedule\n" + old_schedule_find,
    "    // Check work schedule\n" + new_schedule_find_masuk
)

content = content.replace(
    "      // Check work schedule for jam pulang\n" + old_schedule_find,
    "      // Check work schedule for jam pulang\n" + new_schedule_find_pulang
)

content = content.replace("const [schPulangH, schPulangM] = (userSchedule?.jamPulang || '16:00').split(':').map(Number);", "const [schPulangH, schPulangM] = jamPulang.split(':').map(Number);")
content = content.replace("userSchedule?.jamPulang || '16:00'", "jamPulang")

content = content.replace("const [schH, schM] = (userSchedule?.jamMasuk || '04:30').split(':').map(Number);", "const [schH, schM] = jamMasuk.split(':').map(Number);")
content = content.replace("userSchedule?.jamMasuk || '04:30'", "jamMasuk")

with open("src/components/AbsensiView.tsx", "w") as f:
    f.write(content)
