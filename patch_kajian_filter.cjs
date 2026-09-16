const fs = require('fs');

let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

const oldFilter = `  const filteredRecords = kajianRecords.filter(r => {
    if (r.date < filterStartDate || r.date > filterEndDate) return false;
    if (searchQuery && !r.pejuangName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });`;

const newFilter = `  const filteredRecords = kajianRecords.filter(r => {
    const rDate = r.date || '';
    if (rDate < filterStartDate || rDate > filterEndDate) return false;
    if (searchQuery && !(r.pejuangName || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });`;

code = code.replace(oldFilter, newFilter);

fs.writeFileSync('src/components/KajianView.tsx', code);
console.log('Patched Kajian filter for safety');
