const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// The line is:
// .filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase()))
// Let's replace it with:
// .filter(acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.id.toLowerCase().includes(pejuangSearchQuery.toLowerCase()))

content = content.split("acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase())")
                 .join("acc => acc.name.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.username.toLowerCase().includes(pejuangSearchQuery.toLowerCase()) || acc.id.toLowerCase().includes(pejuangSearchQuery.toLowerCase())");

content = content.replace(
  'placeholder="Cari nama atau username..."',
  'placeholder="Cari nama, username, atau ID..."'
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
