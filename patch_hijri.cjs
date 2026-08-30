const fs = require('fs');
let code = fs.readFileSync('src/utils/hijriCalendar.ts', 'utf8');
code = code.replace(
  /.format\(date\);/,
  ".format(date).replace('Minggu', 'Ahad');"
);
fs.writeFileSync('src/utils/hijriCalendar.ts', code);
