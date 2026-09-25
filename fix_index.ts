import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix Attendance
content = content.replace(
  /query\(collection\(db, 'attendance'\), where\('pejuangId', '==', uid\), orderBy\('tanggal', 'desc'\), limit\(100\)\)/,
  "query(collection(db, 'attendance'), where('pejuangId', '==', uid), limit(100))"
);
content = content.replace(
  /const data = snap\.docs\.map\(d => d\.data\(\) as any\);\s*setAttendance\(data\);/,
  "let data = snap.docs.map(d => d.data() as any);\n          if (!isAd) {\n            data = data.sort((a: any, b: any) => new Date(b.date || b.tanggal || 0).getTime() - new Date(a.date || a.tanggal || 0).getTime());\n          }\n          setAttendance(data);"
);

// Fix Exit Permissions
content = content.replace(
  /query\(collection\(db, 'exitPermissions'\), where\('pejuangId', '==', uid\), orderBy\('tanggalKeluar', 'desc'\), limit\(50\)\)/,
  "query(collection(db, 'exitPermissions'), where('pejuangId', '==', uid), limit(50))"
);
content = content.replace(
  /const data = snap\.docs\.map\(d => d\.data\(\) as any\);\s*if \(\!firstExitLoad && \!isAd\)/,
  "let data = snap.docs.map(d => d.data() as any);\n          if (!isAd) {\n            data = data.sort((a: any, b: any) => new Date(b.tanggalKeluar || 0).getTime() - new Date(a.tanggalKeluar || 0).getTime());\n          }\n          if (!firstExitLoad && !isAd)"
);

// Fix Leave Requests
content = content.replace(
  /query\(collection\(db, 'leaveRequests'\), where\('pejuangId', '==', uid\), orderBy\('tanggalPengajuan', 'desc'\), limit\(50\)\)/,
  "query(collection(db, 'leaveRequests'), where('pejuangId', '==', uid), limit(50))"
);
content = content.replace(
  /const data = snap\.docs\.map\(d => d\.data\(\) as any\);\s*if \(\!firstLeaveLoad && \!isAd\)/,
  "let data = snap.docs.map(d => d.data() as any);\n          if (!isAd) {\n            data = data.sort((a: any, b: any) => new Date(b.tanggalPengajuan || 0).getTime() - new Date(a.tanggalPengajuan || 0).getTime());\n          }\n          if (!firstLeaveLoad && !isAd)"
);

fs.writeFileSync('src/App.tsx', content);
