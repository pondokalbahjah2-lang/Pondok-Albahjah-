const fs = require('fs');

const file = 'src/components/LoginView.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Digital Clock logic
if (!content.includes('currentTime')) {
  content = content.replace(
    /const \[masehiDateStr, setMasehiDateStr\] = useState\(''\);/,
    `const [masehiDateStr, setMasehiDateStr] = useState('');\n  const [currentTime, setCurrentTime] = useState('');`
  );
  
  content = content.replace(
    /const now = new Date\(\);\n\s*setHijriDate\(/,
    `const now = new Date();\n      const hours = now.getHours().toString().padStart(2, '0');\n      const mins = now.getMinutes().toString().padStart(2, '0');\n      const secs = now.getSeconds().toString().padStart(2, '0');\n      setCurrentTime(\`\${hours}:\${mins}:\${secs}\`);\n\n      setHijriDate(`
  );
}

// 2. Insert digital clock in the banner, between hijri and masehi
content = content.replace(
  /<div className="mt-4 max-w-lg mx-auto p-3\.5 rounded-2xl bg-white\/10 backdrop-blur-2xl border border-white\/15 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">\n\s*<div className="flex items-center space-x-2 text-emerald-300 font-bold">\n\s*<Calendar className="w-4 h-4 text-emerald-400" \/>\n\s*<span>{hijriDate\.formatted}<\/span>\n\s*<\/div>\n\s*<div className="text-slate-300 font-medium">{masehiDateStr}<\/div>\n\s*<\/div>/,
  `<div className="mt-4 max-w-lg mx-auto p-3.5 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/15 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-emerald-300 font-bold">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{hijriDate.formatted}</span>
            </div>
            <div className="text-xl font-black tracking-widest text-white drop-shadow-md tabular-nums">{currentTime}</div>
            <div className="text-slate-300 font-medium">{masehiDateStr}</div>
          </div>`
);

// 3. Reorder Manhajiyyah Card & Adjust its styling for landscape
// Let's find the Manhajiyyah block and move it.
// To reliably move it, I'll extract it and put it before the login form.
const manhajiyyahRegex = /\{\/\* Daily Rotating Manhajiyyah Clause Card \*\/\}\s*<div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900\/40 via-amber-900\/30 to-slate-900\/40 backdrop-blur-3xl border border-emerald-500\/30 shadow-2xl flex flex-col justify-between">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const match = content.match(manhajiyyahRegex);

if (match) {
  const manhajiyyahBlock = match[0];
  // Remove it from its current position
  content = content.replace(manhajiyyahBlock, '');

  // Modify the extracted block to be more landscape
  let newManhajiyyahBlock = manhajiyyahBlock.replace(
    /className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900\/40 via-amber-900\/30 to-slate-900\/40 backdrop-blur-3xl border border-emerald-500\/30 shadow-2xl flex flex-col justify-between"/,
    'className="w-full max-w-2xl p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-900/40 via-amber-900/30 to-slate-900/40 backdrop-blur-3xl border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-center gap-4 text-left"'
  );
  
  newManhajiyyahBlock = newManhajiyyahBlock.replace(
    /<div>\s*<div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-400 uppercase tracking-wider mb-2">/,
    '<div className="flex-1">\n              <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-400 uppercase tracking-wider mb-2">'
  );
  
  newManhajiyyahBlock = newManhajiyyahBlock.replace(
    /<div className="mt-6">/,
    '<div className="mt-4 sm:mt-0 sm:w-1/3 flex-shrink-0">'
  );

  // Re-insert between the Date Banner and the Login Card
  content = content.replace(
    /\{\/\* Main Grid: Login Card \+ Pasal Manhajiyyah Card \*\/\}\s*<div className="flex flex-col gap-6 items-center w-full">/,
    `{/* Main Grid: Login Card + Pasal Manhajiyyah Card */}
        <div className="flex flex-col gap-6 items-center w-full">
          ${newManhajiyyahBlock.replace(/<\/div>\s*<\/div>\s*$/, '</div>')}
`
  );
}

// 4. Remove small logo in the login form (the shield or img next to "Masuk Sistem")
content = content.replace(
  /<div className="w-10 h-10 rounded-2xl bg-emerald-500\/20 border border-emerald-400\/30 flex items-center justify-center text-emerald-400 overflow-hidden">[\s\S]*?<\/div>/,
  ''
);

// 5. Remove "Masuk dengan Biometrik" button block
content = content.replace(
  /\{accounts\.some\(a => a\.webAuthnCredentialId\) && \([\s\S]*?<\/button>\s*\)\}/,
  ''
);

// 6. Make sure "Atau" is removed since we removed the biometrics button
content = content.replace(
  /<div className="relative flex items-center py-2">\s*<div className="flex-grow border-t border-white\/10"><\/div>\s*<span className="flex-shrink-0 mx-4 text-white\/40 text-\[10px\] uppercase font-bold tracking-widest">\s*Atau\s*<\/span>\s*<div className="flex-grow border-t border-white\/10"><\/div>\s*<\/div>/,
  ''
);

fs.writeFileSync(file, content);
console.log("Patched LoginView.tsx perfectly.");
