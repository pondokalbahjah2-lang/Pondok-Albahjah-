import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

const replacement = `                  if (!deletePassword) {
                    alert('Silakan masukkan password konfirmasi!');
                    return;
                  }

                  try {
                    // Verify password using Firebase Auth
                    if (!auth.currentUser || !auth.currentUser.email) {
                      alert('Sesi login tidak valid. Silakan relogin.');
                      return;
                    }
                    await signInWithEmailAndPassword(auth, auth.currentUser.email, deletePassword);
                  } catch (err: any) {
                    console.error('Password verification failed:', err);
                    alert('Password yang Anda masukkan salah!');
                    return;
                  }`;

content = content.replace(
  /                  if \(!deletePassword\) \{\n                    alert\('Silakan masukkan password konfirmasi!'\);\n                    return;\n                  \}\n                  if \(deletePassword !== currentUser\.password\) \{\n                    alert\('Password yang Anda masukkan salah!'\);\n                    return;\n                  \}/,
  replacement
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
