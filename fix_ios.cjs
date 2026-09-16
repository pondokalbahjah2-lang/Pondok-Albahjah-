const fs = require('fs');
let content = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');

const regex = /<motion\.div \s*initial=\{\{ opacity: 0, scale: 0\.95, y: 15 \}\}\s*animate=\{\{ opacity: 1, scale: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.95, y: 15 \}\}\s*transition=\{\{ type: "spring", stiffness: 350, damping: 25, mass: 0\.8 \}\}/g;

content = content.replace(regex, '<div');
content = content.replace('</motion.div>', '</div>');
fs.writeFileSync('src/components/iOSGlassLayout.tsx', content);
console.log('Fixed iosGlass');
