import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

// The file is corrupted. We need to find `)};` and see what it swallowed.
// Actually, since there's no git, we'll try to manually fix it.
// Let's first look at the file length and where it broke.
console.log(content.split('\n').length);
