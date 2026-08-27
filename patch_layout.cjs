const fs = require('fs');
let content = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');

// 1. Add broadcastMessage to props
content = content.replace(
  "appLogoUrl?: string;",
  "appLogoUrl?: string;\n  broadcastMessage?: string;"
);
content = content.replace(
  "appLogoUrl,",
  "appLogoUrl,\n  broadcastMessage,"
);

// 2. Fix Desktop Header Text
content = content.replace(
  `<span className="text-sm font-bold tracking-tight text-slate-800 dark:text-white">Portal Pejuang</span>`,
  `<span className="text-sm font-bold tracking-tight text-slate-800 dark:text-white">Portal Pejuang Al-Bahjah</span>`
);

// 3. Fix Mobile Header
// Find the mobile header section
const mobileHeaderStart = `<h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">`;
content = content.replace(
  mobileHeaderStart + `\n                  {currentUser.name}\n                </h2>`,
  mobileHeaderStart + `\n                  Portal Pejuang Al-Bahjah\n                </h2>`
);

// 4. Add Broadcast Alert Banner
const broadcastHtml = `
          {/* Broadcast Message Banner */}
          {broadcastMessage && (
            <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-bold flex items-center justify-center shadow-md z-50 sticky top-0 md:static animate-in fade-in slide-in-from-top-4 duration-500">
              <span className="flex items-center gap-2">
                <span className="animate-pulse">⚠️</span>
                {broadcastMessage}
              </span>
            </div>
          )}
`;

content = content.replace(
  "{/* Main Content Container */}",
  broadcastHtml + "\n          {/* Main Content Container */}"
);

fs.writeFileSync('src/components/iOSGlassLayout.tsx', content);
