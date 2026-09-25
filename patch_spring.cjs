const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir);

let replacedCount = 0;

files.forEach(file => {
    if (file.endsWith('.tsx')) {
        const filePath = path.join(dir, file);
        let code = fs.readFileSync(filePath, 'utf8');
        
        const regex1 = /transition=\{\{\s*type:\s*['"]spring['"],\s*stiffness:\s*\d+,\s*damping:\s*\d+,\s*mass:\s*[\d\.]+\s*\}\}/g;
        const iosSpring = `transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.6 }}`;
        
        if (regex1.test(code)) {
            code = code.replace(regex1, iosSpring);
            fs.writeFileSync(filePath, code);
            replacedCount++;
        }
    }
});

console.log(`Replaced spring transitions in ${replacedCount} files.`);
