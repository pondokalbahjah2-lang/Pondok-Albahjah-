const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

// Revert weeklyKehadiranData XAxis
content = content.replace(
  'data={weeklyKehadiranData}\n                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}\n              >\n                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />\n                <XAxis dataKey="divisi" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />',
  'data={weeklyKehadiranData}\n                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}\n              >\n                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />\n                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />'
);

// Fix barData XAxis (Kehadiran vs Izin per Divisi)
content = content.replace(
  'data={barData}\n                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}\n              >\n                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />\n                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />',
  'data={barData}\n                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}\n              >\n                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />\n                <XAxis dataKey="divisi" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />'
);

fs.writeFileSync('src/components/DashboardView.tsx', content);
