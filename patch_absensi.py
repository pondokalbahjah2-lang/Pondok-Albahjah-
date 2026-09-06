import re

with open("src/components/AbsensiView.tsx", "r") as f:
    content = f.read()

# 1. Block early clock out (> 5 mins)
target_pulang = r"(const \[currH, currM\] = timeStr\.replace\('\.', ':'\)\.split\(':'\)\.map\(Number\);\s*const \[schPulangH, schPulangM\] = \(userSchedule\?\.jamPulang \|\| '16:00'\)\.split\(':'\)\.map\(Number\);\s*let pulangNotes = todayRecord!\.notes;\s*)(if \(\(currH \* 60 \+ currM\) < \(schPulangH \* 60 \+ schPulangM\)\) \{[\s\S]*?pulangNotes = \(pulangNotes \? pulangNotes \+ ' \| ' : ''\) \+ 'Pulang Lebih Awal';\s*\})"

new_pulang = r"""\1
      const diffPulangMins = (schPulangH * 60 + schPulangM) - (currH * 60 + currM);
      if (diffPulangMins > 5) {
        alert(`Absen ditolak: Anda hanya dapat absen pulang paling awal 5 menit sebelum jam kepulangan (${userSchedule?.jamPulang || '16:00'}).`);
        return;
      }
      if (diffPulangMins > 0) {
        pulangNotes = (pulangNotes ? pulangNotes + ' | ' : '') + 'Pulang Lebih Awal';
      }
"""
content = re.sub(target_pulang, new_pulang, content)

# 2. Block early clock in (> 1 hr)
target_hadir = r"(let finalStatus: AttendanceRecord\['status'\] = attendanceStatus;\s*if \(attendanceStatus === 'Hadir'\) \{\s*const \[currH, currM\] = timeStr\.replace\('\.', ':'\)\.split\(':'\)\.map\(Number\);\s*const \[schH, schM\] = \(userSchedule\?\.jamMasuk \|\| '04:30'\)\.split\(':'\)\.map\(Number\);)"

new_hadir = r"""\1
      const diffMasukMins = (schH * 60 + schM) - (currH * 60 + currM);
      if (diffMasukMins > 60) {
        alert(`Absen ditolak: Anda hanya dapat absen masuk maksimal 1 jam sebelum shift dimulai (${userSchedule?.jamMasuk || '04:30'}).`);
        return;
      }
"""
content = re.sub(target_hadir, new_hadir, content)

with open("src/components/AbsensiView.tsx", "w") as f:
    f.write(content)
