const fs = require('fs');

const file = 'src/components/LoginView.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Remove "Sistem Kepondokan Al-Bahjah Cirebon 1" label
content = content.replace(
  /<div className="inline-flex items-center space-x-2 px-4 py-1\.5 rounded-full bg-white\/10 backdrop-blur-xl border border-white\/20 text-xs font-semibold text-emerald-300 shadow-xl">[\s\S]*?<\/div>/,
  ''
);

// 2. Make logo larger (from w-16 h-16 sm:w-20 sm:h-20 to w-20 h-20 sm:w-28 sm:h-28)
content = content.replace(
  /className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl/g,
  'className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl'
);

// 3. Layout changes: Center everything and move Manhajiyyah below Login
content = content.replace(
  /<div className="w-full max-w-4xl relative z-10 my-auto py-6">/,
  '<div className="w-full max-w-md relative z-10 my-auto py-6 mx-auto">'
);

content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">/,
  '<div className="flex flex-col gap-6 items-center w-full">'
);

// also let's change w-full in the children of that flex if necessary, but w-full is fine.

// 4. Add "Lupa Password?" link
content = content.replace(
  /<label className="block text-xs font-semibold text-slate-200 mb-1\.5">\s*Kata Sandi \(Password\)\s*<\/label>/,
  `<div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-200">
                      Kata Sandi (Password)
                    </label>
                    <button type="button" onClick={() => alert("Silakan hubungi admin untuk melakukan validasi lupa password dan mengatur ulang kata sandi Anda.")} className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">Lupa Password?</button>
                  </div>`
);

// 5. Add runaway state and motion to "Masuk Ke Sistem" button
// Add import if missing
if (!content.includes("import { motion } from 'framer-motion';")) {
  content = content.replace(
    /import React, { useState, useEffect } from 'react';/,
    `import React, { useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';`
  );
}

// add state
content = content.replace(
  /const \[isLoading, setIsLoading\] = useState\(false\);/,
  `const [isLoading, setIsLoading] = useState(false);\n  const [runawayX, setRunawayX] = useState(0);\n  const [runawayY, setRunawayY] = useState(0);\n\n  const handleButtonHover = () => {\n    if (!username || !password) {\n      setRunawayX(Math.random() * 200 - 100);\n      setRunawayY(Math.random() * 80 - 40);\n    } else {\n      setRunawayX(0);\n      setRunawayY(0);\n    }\n  };`
);

// replace button
content = content.replace(
  /<button\n\s*type="submit"\n\s*disabled={isLoading}\n\s*className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500\/25 transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"\n\s*>\n\s*<span>{isLoading \? 'Memproses\.\.\.' : 'Masuk Ke Sistem'}<\/span>\n\s*{!isLoading && <ArrowRight className="w-4 h-4" \/>}\n\s*<\/button>/g,
  `<div className="relative w-full" onMouseEnter={handleButtonHover}>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      animate={{ x: runawayX, y: runawayY }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-colors duration-200 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed z-10"
                    >
                      <span>{isLoading ? 'Memproses...' : 'Masuk Ke Sistem'}</span>
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </motion.button>
                  </div>`
);

// fix "w-full max-w-4xl" which I tried to replace earlier. Let's make sure it replaced.
// wait, I can just write it.

fs.writeFileSync(file, content);
console.log("Patched LoginView.tsx successfully.");
