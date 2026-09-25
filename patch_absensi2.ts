import fs from 'fs';
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

const submitLogic = `
  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoPreview) {
      alert('Silakan ambil atau unggah foto kehadiran Anda terlebih dahulu.');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isClockedIn && !isClockedOut) {
      // Clock out
      const updatedRecord = {
        ...todayRecord!,
        timePulang: timeStr,
        photoPulangUrl: photoPreview
      };
      
      const updatedAttendance = attendance.map(a => a.id === updatedRecord.id ? updatedRecord : a);
      onSaveAttendance(updatedAttendance);
      setPhotoPreview('');
      setNotes('');
      alert(\`Jam Pulang Berhasil Dicatat: \${timeStr}\`);
      return;
    }

    // Check work schedule
    const userSchedule = schedules.find(
      (s) => s.targetName.includes(currentUser.subDivisi) || s.targetId === currentUser.id
    ) || schedules[0];

    let finalStatus: AttendanceRecord['status'] = attendanceStatus;

    if (attendanceStatus === 'Hadir') {
      const currentHourMin = timeStr.replace(':', '');
      const scheduleHourMin = (userSchedule?.jamMasuk || '04:30').replace(':', '');
      if (parseInt(currentHourMin) > parseInt(scheduleHourMin)) {
        finalStatus = 'Terlambat';
      }
    }

    const newRecord: AttendanceRecord = {
      id: \`att-\${Date.now()}\`,
      pejuangId: currentUser.id,
      pejuangName: currentUser.name,
      subDivisi: currentUser.subDivisi,
      date: dateStr,
      time: timeStr,
      photoUrl: photoPreview,
      latitude: currentLat || locationSettings.latitude,
      longitude: currentLng || locationSettings.longitude,
      distanceFromPondok: distanceMeters || 0,
      status: finalStatus,
      isWithinRadius: isWithinRadius,
      notes: notes || \`Absensi melalui sistem web app (\${isWithinRadius ? 'Dalam Radius' : 'Luar Radius'})\`,
    };

    onSaveAttendance([newRecord, ...attendance]);
    setPhotoPreview('');
    setNotes('');
    alert(\`Absensi Kehadiran Berhasil Ditambahkan dengan Status: \${finalStatus}\`);
  };
`;

content = content.replace(/const handleSubmitAttendance = \(e: React\.FormEvent\) => \{[\s\S]*?alert\(\`Absensi Kehadiran Berhasil Ditambahkan dengan Status: \$\{finalStatus\}\`\);\n  \};/, submitLogic.trim());
fs.writeFileSync('src/components/AbsensiView.tsx', content);
