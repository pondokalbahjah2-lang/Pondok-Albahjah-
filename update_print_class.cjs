const fs = require('fs');
let code = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf8');

code = code.replace(
  '<div className="hidden print:flex fixed inset-0 z-[9999] bg-white text-black p-8 flex-col items-center justify-start">',
  '<div className="hidden print:flex print-area fixed inset-0 z-[9999] bg-white text-black p-8 flex-col items-center justify-start">'
);

fs.writeFileSync('src/components/SlipUbarView.tsx', code);
console.log('Updated print class');
