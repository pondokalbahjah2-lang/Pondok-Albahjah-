const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/**/*.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const regex = /<motion\.div \s*initial=\{\{ opacity: 0, scale: 0\.95, y: 15 \}\}\s*animate=\{\{ opacity: 1, scale: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.95, y: 15 \}\}\s*transition=\{\{ type: "spring", stiffness: 300, damping: 25 \}\}/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, '<div');
    // Also remove the import if we added it, but let's just leave the import for now
    fs.writeFileSync(file, content);
    console.log(`Reverted ${file}`);
  }
}
