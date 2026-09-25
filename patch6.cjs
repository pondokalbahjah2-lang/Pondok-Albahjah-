const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const targetRecord = `  isWithinRadius: boolean;
  notes?: string;`;

const replacementRecord = `  isWithinRadius: boolean;
  notes?: string;
  suratSakitUrl?: string;`;

code = code.replace(targetRecord, replacementRecord);
fs.writeFileSync('src/types.ts', code);
console.log('patched types.ts');
