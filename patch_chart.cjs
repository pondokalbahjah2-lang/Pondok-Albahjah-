const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

// Fix XAxis dataKey for "Kehadiran vs Izin per Divisi"
const targetStr = `                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />`;
const replacementStr = `                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="divisi" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync('src/components/DashboardView.tsx', content);
