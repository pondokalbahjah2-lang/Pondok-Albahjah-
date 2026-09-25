const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/components/**/*.tsx');
let count = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let before = content;
  content = content.replace(/<\/motion\.div>\s*<\/div>\s*\)\}/g, (match) => {
    return match;
  });
  if (before !== content) {
    fs.writeFileSync(file, content);
  }
}
