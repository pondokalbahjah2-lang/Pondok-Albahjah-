import fs from 'fs';

let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

// Replace the strict biometric registration options with more relaxed ones
content = content.replace(/rp: \{ name: 'Al-Bahjah App', id: window\.location\.hostname \}/g, "rp: { name: 'Al-Bahjah App' }");
content = content.replace(/authenticatorAttachment: 'platform',?\n\s*userVerification: 'required'/g, "userVerification: 'preferred'");

fs.writeFileSync('src/components/SettingsView.tsx', content);
