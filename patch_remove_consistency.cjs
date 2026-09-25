const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const regex1 = /\/\/ Current User Weekly Attendance Consistency Trend[\s\S]*?\}, \[attendance, currentUser\.id\]\);/;
content = content.replace(regex1, '');

const regex2 = /\{\/\* Current User Weekly Attendance Consistency Trend \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(regex2, '');

fs.writeFileSync('src/components/DashboardView.tsx', content);
