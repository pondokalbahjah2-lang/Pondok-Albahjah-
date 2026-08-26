import fs from 'fs';
let content = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf-8');

// Add appLogoUrl to Props
content = content.replace(/interface iOSGlassLayoutProps \{/, `interface iOSGlassLayoutProps {\n  appLogoUrl?: string;`);

// Replace icon rendering in Sidebar/Header
const newHeader = `
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden shadow-inner">
              {props.appLogoUrl ? (
                <img src={props.appLogoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight truncate max-w-[200px]">
                Portal Pejuang
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">
                Al-Bahjah Cirebon 1
              </p>
            </div>
          </div>
`;
content = content.replace(/          <div className="flex items-center space-x-3">[\s\S]*?<\/div>\n          <\/div>/, newHeader);

fs.writeFileSync('src/components/iOSGlassLayout.tsx', content);
console.log("Patched iOSGlassLayout.tsx");
