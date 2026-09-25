import fs from 'fs';
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

const submitLogic = `
    if (isClockedIn && !isClockedOut) {
      // Check work schedule for jam pulang
      const userSchedule = schedules.find(
        (s) => s.targetName.includes(currentUser.subDivisi) || s.targetId === currentUser.id
      ) || schedules[0];
      
      const currentHourMin = timeStr.replace(':', '');
      const schedulePulangHourMin = (userSchedule?.jamPulang || '16:00').replace(':', '');
      
      let pulangNotes = todayRecord!.notes;
      if (parseInt(currentHourMin) < parseInt(schedulePulangHourMin)) {
        const confirmEarly = window.confirm(\`Jam pulang yang ditetapkan adalah \${userSchedule?.jamPulang || '16:00'}. Anda yakin ingin pulang lebih awal?\`);
        if (!confirmEarly) return;
        pulangNotes = (pulangNotes ? pulangNotes + ' | ' : '') + 'Pulang Lebih Awal';
      }

      // Clock out
      const updatedRecord = {
        ...todayRecord!,
        timePulang: timeStr,
        photoPulangUrl: photoPreview,
        notes: pulangNotes
      };
      
      const updatedAttendance = attendance.map(a => a.id === updatedRecord.id ? updatedRecord : a);
      onSaveAttendance(updatedAttendance);
      setPhotoPreview('');
      setNotes('');
      alert(\`Jam Pulang Berhasil Dicatat: \${timeStr}\`);
      return;
    }
`;

content = content.replace(
  /if \(isClockedIn && !isClockedOut\) \{[\s\S]*?return;\n    \}/,
  submitLogic.trim()
);
fs.writeFileSync('src/components/AbsensiView.tsx', content);
