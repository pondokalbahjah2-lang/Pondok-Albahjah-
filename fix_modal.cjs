const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingModal.tsx', 'utf8');

code = code.replace(
  "description: \\`Halo \\${userName}, selamat datang di Portal Manajemen Pejuang Al-Bahjah. Mari kita lihat fitur-fitur utamanya!\\`,",
  "description: `Halo ${userName}, selamat datang di Portal Manajemen Pejuang Al-Bahjah. Mari kita lihat fitur-fitur utamanya!`, "
);

code = code.replace(
  "className={\\`w-2 h-2 rounded-full transition-colors duration-300 \\${i === step ? 'bg-emerald-500 w-4' : 'bg-slate-200 dark:bg-slate-700'}\\`} ",
  "className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === step ? 'bg-emerald-500 w-4' : 'bg-slate-200 dark:bg-slate-700'}`}"
);

fs.writeFileSync('src/components/OnboardingModal.tsx', code);
console.log('Fixed syntax errors');
