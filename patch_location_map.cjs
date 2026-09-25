const fs = require('fs');
let content = fs.readFileSync('src/components/LocationMap.tsx', 'utf8');

content = content.replace(
  'radius: number',
  'radius: number,\n  height?: string'
);

content = content.replace(
  'radius \n}:',
  'radius,\n  height = "h-40"\n}:'
);

content = content.replace(
  '<div className="w-full h-40 rounded-xl overflow-hidden',
  '<div className={`w-full ${height} rounded-xl overflow-hidden'
);
content = content.replace(
  '<div className="w-full h-40 rounded-xl overflow-hidden',
  '<div className={`w-full ${height} rounded-xl overflow-hidden'
);

fs.writeFileSync('src/components/LocationMap.tsx', content);
