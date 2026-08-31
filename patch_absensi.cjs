const fs = require('fs');
let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

// 1. Change prop type
code = code.replace(
  'onSaveAttendance: (records: AttendanceRecord[]) => void;',
  'onSaveAttendance: (records: AttendanceRecord[]) => Promise<void> | void;'
);

// 2. Add loading state
code = code.replace(
  'const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);',
  'const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);\n  const [isSubmitting, setIsSubmitting] = useState(false);'
);

// 3. Make handleSubmitAttendance async
code = code.replace(
  'const handleSubmitAttendance = (e: React.FormEvent) => {',
  'const handleSubmitAttendance = async (e: React.FormEvent) => {'
);

// 4. Update the save logic for Pulang
const pulangBlock = `      const updatedAttendance = attendance.map(a => a.id === updatedRecord.id ? updatedRecord : a);
      
      try {
        setIsSubmitting(true);
        await onSaveAttendance(updatedAttendance);
        setPhotoPreview('');
        setNotes('');
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        alert(\`Jam Pulang Berhasil Dicatat: \${timeStr}\`);
      } catch (err) {
        alert('Terjadi kesalahan saat menyimpan absensi pulang.');
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
      return;`;

code = code.replace(
  `      const updatedAttendance = attendance.map(a => a.id === updatedRecord.id ? updatedRecord : a);
      onSaveAttendance(updatedAttendance);
      setPhotoPreview('');
      setNotes('');
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      alert(\`Jam Pulang Berhasil Dicatat: \${timeStr}\`);
      return;`,
  pulangBlock
);

// 5. Update the save logic for Masuk
const masukBlock = `    const newRecord: AttendanceRecord = {
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
    };

    try {
      setIsSubmitting(true);
      await onSaveAttendance([newRecord, ...attendance]);
      setPhotoPreview('');
      setNotes('');
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      alert(\`Absensi Kehadiran Berhasil Ditambahkan dengan Status: \${finalStatus}\`);
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan absensi masuk.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };`;

code = code.replace(/    const newRecord: AttendanceRecord = \{[\s\S]*?alert\(\`Absensi Kehadiran Berhasil Ditambahkan dengan Status: \$\{finalStatus\}\`\);\n  \};/, masukBlock);

// 6. Update submit button
code = code.replace(
  '<button\n            type="submit"\n            disabled={!attendanceStatus}',
  '<button\n            type="submit"\n            disabled={!attendanceStatus || isSubmitting}'
);

code = code.replace(
  '            <span>Konfirmasi & Simpan</span>\n          </button>',
  `            <span>{isSubmitting ? 'Menyimpan...' : 'Konfirmasi & Simpan'}</span>
          </button>`
);

fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('AbsensiView patched successfully');
