const fs = require('fs');

const content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const fragmentStart = content.indexOf('{currentUser.role === \'Admin\' && (\n        <>');
if (fragmentStart === -1) {
  console.log("Fragment start not found");
  process.exit();
}

const fragmentEnd = content.indexOf('</>\n    )}');
if (fragmentEnd === -1) {
  console.log("Fragment end not found");
  process.exit();
}

const fragmentContent = content.substring(fragmentStart, fragmentEnd);

let divCount = 0;
let lineNum = content.substring(0, fragmentStart).split('\n').length;
const lines = fragmentContent.split('\n');

for (const line of lines) {
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  divCount += opens - closes;
  // console.log(`Line ${lineNum}: ${opens} opens, ${closes} closes, total ${divCount}`);
  lineNum++;
}

console.log(`Unclosed divs inside fragment: ${divCount}`);
