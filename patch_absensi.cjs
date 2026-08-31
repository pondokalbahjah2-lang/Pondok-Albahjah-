const fs = require('fs');
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

const oldLogic = `    const newRecord: AttendanceRecord = {
      id: \`att-\${Date.now()}\`,
      pejuangId: currentUser.id,
      pejuangName: currentUser.name,
      subDivisi: currentUser.subDivisi,
      date: dateStr,
      time: timeStr,
      photoUrl: photoPreview,
      latitude: currentLat || 0,
      longitude: currentLng || 0,
      distanceFromPondok: distanceMeters || 0,
      status: finalStatus,
      isWithinRadius: isWithinRadius,
      notes: notes || \`Absensi melalui sistem web app (\${isWithinRadius ? 'Dalam Radius' : 'Luar Radius'})\`,
    };`;

const newLogic = `    const newRecord: AttendanceRecord = {
      id: \`att-\${Date.now()}\`,
      pejuangId: currentUser.id,
      pejuangName: currentUser.name,
      subDivisi: currentUser.subDivisi,
      date: dateStr,
      time: finalStatus === 'Libur' ? 'Libur' : (finalStatus === 'Sakit' ? 'Sakit' : timeStr),
      timePulang: finalStatus === 'Libur' ? 'Libur' : (finalStatus === 'Sakit' ? 'Sakit' : undefined),
      photoUrl: photoPreview,
      latitude: currentLat || 0,
      longitude: currentLng || 0,
      distanceFromPondok: distanceMeters || 0,
      status: finalStatus,
      isWithinRadius: isWithinRadius,
      notes: notes || \`Absensi melalui sistem web app (\${isWithinRadius ? 'Dalam Radius' : 'Luar Radius'})\`,
    };`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync('src/components/AbsensiView.tsx', content);
  console.log("AbsensiView updated successfully.");
} else {
  console.log("oldLogic not found in AbsensiView.tsx");
}
