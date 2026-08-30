const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  '{act.type === \'izin\' && <CalendarCheck className="w-4 h-4" />}',
  '{act.type === \'izin\' && <CalendarIcon className="w-4 h-4" />}'
);
code = code.replace(
  '{act.type === \'cuti\' && <Calendar className="w-4 h-4" />}',
  '{act.type === \'cuti\' && <CalendarIcon className="w-4 h-4" />}'
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('Fixed icons');
