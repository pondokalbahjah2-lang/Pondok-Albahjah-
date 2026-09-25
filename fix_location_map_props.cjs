const fs = require('fs');
let content = fs.readFileSync('src/components/LocationMap.tsx', 'utf8');

// Use regex to replace the second instance
content = content.replace(/radius: number\s*}\)/, 'radius: number,\n  height?: string\n})');

fs.writeFileSync('src/components/LocationMap.tsx', content);
