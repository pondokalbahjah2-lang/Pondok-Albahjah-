import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');
content = content.replace(
  "<span>Hapus Data Absensi Berdasarkan Bulan</span>",
  "<span>Hapus Data Kehadiran, Izin, & Cuti per Bulan</span>"
);
content = content.replace(
  "menghapus seluruh data kehadiran pejuang secara permanen untuk bulan yang dipilih",
  "menghapus seluruh data kehadiran, izin keluar, dan cuti secara permanen untuk bulan yang dipilih"
);
content = content.replace(
  "MENGHAPUS SEMUA DATA KEHADIRAN",
  "MENGHAPUS SEMUA DATA KEHADIRAN, IZIN, DAN CUTI"
);
content = content.replace(
  "Data kehadiran untuk bulan",
  "Data kehadiran, izin, dan cuti untuk bulan"
);
fs.writeFileSync('src/components/SettingsView.tsx', content);
