const fs = require('fs');
let code = fs.readFileSync('src/utils/dateUtils.ts', 'utf8');
code = code.replace(
  'export const getLogicalAttendanceDateStr = (user?: UserAccount, d: Date = new Date()) => {\n  return getLocalDateString(d);\n};',
  `export const getLogicalAttendanceDateStr = (user?: UserAccount, d: Date = new Date()) => {
  if (user) {
    const subdiv = (user.subDivisi || '').toLowerCase();
    const isSpecial = ['sdiqu', 'smpiqu', 'smaiqu', 'kepondokan banat'].some(s => subdiv.includes(s));
    const h = d.getHours();
    const m = d.getMinutes();
    
    // If it's between midnight and 08:00 AM, treat it as the previous day's shift
    if (isSpecial && (h < 8 || (h === 8 && m === 0))) {
      const yesterday = new Date(d);
      yesterday.setDate(yesterday.getDate() - 1);
      return getLocalDateString(yesterday);
    }
  }
  return getLocalDateString(d);
};`
);
fs.writeFileSync('src/utils/dateUtils.ts', code);
console.log('Patched dateUtils.ts');
