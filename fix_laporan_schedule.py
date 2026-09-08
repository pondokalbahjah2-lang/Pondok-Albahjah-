import re

with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

old_logic = "const userSchedule = (schedules || []).find((s: any) => s.targetId === p.id || s.targetId === p.subDivisi);"
new_logic = "const userSchedule = (schedules || []).find((s: any) => s.targetId === p.id || s.targetId === p.subDivisi || (s.targetType === 'Group' && s.pejuangIds?.includes(p.id)));"
content = content.replace(old_logic, new_logic)

old_logic2 = "const userSchedule = (schedules || []).find(s => s.targetId === a.id || s.targetId === a.subDivisi);"
new_logic2 = "const userSchedule = (schedules || []).find(s => s.targetId === a.id || s.targetId === a.subDivisi || (s.targetType === 'Group' && s.pejuangIds?.includes(a.id)));"
content = content.replace(old_logic2, new_logic2)

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
