import re

with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

old_logic = "const userSchedule = (schedules || []).find((s: any) => s.targetId === p.id || s.targetId === p.subDivisi || (s.targetType === 'Group' && s.pejuangIds?.includes(p.id)));"
new_logic = "const userSchedule = (schedules || []).find((s: any) => s.targetId === p.id || s.targetId === p.subDivisi || (s.targetType === 'Group' && (s.pejuangIds?.includes(p.id) || s.divisiIds?.includes(p.subDivisi))));"
content = content.replace(old_logic, new_logic)

old_logic2 = "const userSchedule = (schedules || []).find(s => s.targetId === a.id || s.targetId === a.subDivisi || (s.targetType === 'Group' && s.pejuangIds?.includes(a.id)));"
new_logic2 = "const userSchedule = (schedules || []).find(s => s.targetId === a.id || s.targetId === a.subDivisi || (s.targetType === 'Group' && (s.pejuangIds?.includes(a.id) || s.divisiIds?.includes(a.subDivisi))));"
content = content.replace(old_logic2, new_logic2)

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)

# And AbsensiView
with open("src/components/AbsensiView.tsx", "r") as f:
    absensi_content = f.read()

old_logic_absensi = "const userSchedule = schedules.find(\n      (s) => s.targetId === currentUser.id || s.targetId === currentUser.subDivisi || (s.targetType === 'Group' && s.pejuangIds?.includes(currentUser.id))\n    ) || schedules[0];"
new_logic_absensi = "const userSchedule = schedules.find(\n      (s) => s.targetId === currentUser.id || s.targetId === currentUser.subDivisi || (s.targetType === 'Group' && (s.pejuangIds?.includes(currentUser.id) || s.divisiIds?.includes(currentUser.subDivisi)))\n    ) || schedules[0];"
absensi_content = absensi_content.replace(old_logic_absensi, new_logic_absensi)

with open("src/components/AbsensiView.tsx", "w") as f:
    f.write(absensi_content)

