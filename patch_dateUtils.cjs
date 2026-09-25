const fs = require('fs');
let content = fs.readFileSync('src/utils/dateUtils.ts', 'utf-8');

const target = `    const isNightShift = user.subDivisi.includes('Banat') || 
                         user.subDivisi.includes('SDIQu') || 
                         user.subDivisi.includes('SMPIQu') || 
                         user.subDivisi.includes('SMAIQu');`;

const newTarget = `    const sub = (user.subDivisi || '').toLowerCase();
    const isNightShift = sub.includes('banat') || 
                         sub.includes('sdiqu') || 
                         sub.includes('smpiqu') || 
                         sub.includes('smaiqu');`;

content = content.replace(target, newTarget);
fs.writeFileSync('src/utils/dateUtils.ts', content);
console.log('patched getLogicalAttendanceDateStr');
