import fs from 'fs';

let content = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf-8');

content = content.replace('{/* Document List & Download Table */}', '        </div>\n      )}\n      {/* Document List & Download Table */}');

fs.writeFileSync('src/components/SlipUbarView.tsx', content, 'utf-8');
console.log('Fixed Grid Closing tag');
