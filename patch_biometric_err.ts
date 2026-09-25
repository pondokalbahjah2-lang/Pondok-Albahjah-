import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

content = content.replace(
  /alert\('Gagal mendaftarkan biometrik: ' \+ e\.message\);/g,
  "alert('Gagal mendaftarkan biometrik: ' + e.message + '\\n\\nJika Anda membuka aplikasi ini di dalam browser internal atau iframe, silakan buka langsung di tab baru (Safari/Chrome).');"
);

fs.writeFileSync('src/components/SettingsView.tsx', content);

let contentLogin = fs.readFileSync('src/components/LoginView.tsx', 'utf-8');
contentLogin = contentLogin.replace(
  /setErrorMsg\('Permintaan biometrik dibatalkan oleh pengguna\.'\);/g,
  "setErrorMsg('Permintaan biometrik dibatalkan atau tidak diizinkan. Jika Anda membuka dari iframe, silakan buka aplikasi di tab baru (Safari/Chrome).');"
);
fs.writeFileSync('src/components/LoginView.tsx', contentLogin);
