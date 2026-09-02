import fs from 'fs';

let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

// Remove photo requirement validation
content = content.replace(/if \(!photoPreview && attendanceStatus !== 'Libur'\) \{[\s\S]*?return;\n    \}/, '');

// Don't save photo to newRecord
content = content.replace(/photoUrl: photoPreview,/, 'photoUrl: "", // Removed photo');
content = content.replace(/photoPulangUrl: photoPreview,/, 'photoPulangUrl: "", // Removed photo');

// Also for Sakit, hide file upload or keep it but don't require it? The replace above removes the photoPreview check entirely.
// Let's also hide the entire photo viewfinder UI to prevent confusion.
// Find the block from "Foto Kehadiran" to the closing div of "Aktifkan kamera..."
// Since the UI is large, let's just replace the viewfinder with a message or hide it.
content = content.replace(
  /<label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">\s*Foto Kehadiran \(Wajib Swafoto\)\s*<\/label>[\s\S]*?{attendanceStatus === 'Sakit' && \(/,
  `{attendanceStatus === 'Sakit' && (`
);

// We still have the "Sakit" file upload. The user said "hapus fitur foto absen".
// Let's just remove the camera UI entirely.

fs.writeFileSync('src/components/AbsensiView.tsx', content, 'utf-8');
console.log('Patched AbsensiView.tsx successfully');
