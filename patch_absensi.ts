import fs from 'fs';
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

// 1. Update startCamera
const startCameraRegex = /  const startCamera = async \(\) => \{\n    try \{\n      const mediaStream/;
const startCameraReplacement = `  const startCamera = async () => {
    if (!currentLat || !currentLng) {
      handleGetLocation();
    }
    try {
      const mediaStream`;
content = content.replace(startCameraRegex, startCameraReplacement);

// 2. Update map URLs in capturePhoto and handleQuickCheckIn
// We know from previous patches we used tile.openstreetmap.org. Let's replace it with ArcGIS.
content = content.replace(/https:\/\/tile\.openstreetmap\.org\/\$\{zoom\}\/\$\{x\}\/\$\{y\}\.png/g, 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zoom}/${y}/${x}');

// 3. Update handleSubmitAttendance to require location and remove fallback
const submitLocationRegex = /    if \(!photoPreview\) \{\n      alert\('Silakan ambil atau unggah foto kehadiran Anda terlebih dahulu\.'\);\n      return;\n    \}/;
const submitLocationReplacement = `    if (!photoPreview) {
      alert('Silakan ambil atau unggah foto kehadiran Anda terlebih dahulu.');
      return;
    }
    
    if (!currentLat || !currentLng) {
      alert('Tunggu hingga lokasi GPS Anda ditemukan (klik Cek Lokasi GPS) sebelum mengirim absensi.');
      return;
    }`;
content = content.replace(submitLocationRegex, submitLocationReplacement);

const newRecordRegex = /      latitude: currentLat \|\| locationSettings\.latitude,\n      longitude: currentLng \|\| locationSettings\.longitude,/g;
const newRecordReplacement = `      latitude: currentLat,
      longitude: currentLng,`;
content = content.replace(newRecordRegex, newRecordReplacement);

fs.writeFileSync('src/components/AbsensiView.tsx', content);
console.log("Patched successfully");
