import re

with open("src/components/AbsensiView.tsx", "r") as f:
    content = f.read()

replacement = """    // Check work schedule
    const userSchedule = schedules.find(
      (s) => s.targetName.includes(currentUser.subDivisi) || s.targetId === currentUser.id
    ) || schedules[0];
    
    const hariMap = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const currDay = hariMap[new Date().getDay()];
    const jamMasuk = userSchedule?.customJamKerja?.[currDay]?.masuk || userSchedule?.jamMasuk || "08:00";

    let finalStatus: AttendanceRecord['status'] = attendanceStatus;"""

content = re.sub(
    r"    // Check work schedule\n    const userSchedule = schedules\.find\(\n      \(s\) => s\.targetName\.includes\(currentUser\.subDivisi\) \|\| s\.targetId === currentUser\.id\n    \) \|\| schedules\[0\];\n\n    let finalStatus: AttendanceRecord\['status'\] = attendanceStatus;",
    replacement,
    content
)

with open("src/components/AbsensiView.tsx", "w") as f:
    f.write(content)
