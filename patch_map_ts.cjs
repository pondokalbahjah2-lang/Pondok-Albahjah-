const fs = require('fs');
let content = fs.readFileSync('src/components/LocationMap.tsx', 'utf-8');
content = content.replace(
  "delete L.Icon.Default.prototype._getIconUrl;",
  "delete (L.Icon.Default.prototype as any)._getIconUrl;"
);
fs.writeFileSync('src/components/LocationMap.tsx', content);
console.log("Patched LocationMap TypeScript error");
