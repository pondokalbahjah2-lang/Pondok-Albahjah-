import fs from 'fs';
let content = fs.readFileSync('src/components/LoginView.tsx', 'utf-8');

// Add appLogoUrl to Props
content = content.replace(/interface LoginViewProps \{/, `interface LoginViewProps {\n  appLogoUrl?: string;`);

// Replace icon rendering in LoginView
const newHeader = `
        <div className="flex flex-col items-center justify-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner overflow-hidden border-2 border-white dark:border-slate-800">
            {props.appLogoUrl ? (
              <img src={props.appLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="w-10 h-10" />
            )}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Portal Pejuang</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Al-Bahjah Cabang Cirebon 1</p>
          </div>
        </div>
`;
content = content.replace(/        <div className="flex flex-col items-center justify-center space-y-4 mb-8">[\s\S]*?<\/div>\n        <\/div>/, newHeader);

fs.writeFileSync('src/components/LoginView.tsx', content);

// Now patch App.tsx to pass appLogoUrl to LoginView and iOSGlassLayout
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(/<LoginView\n        accounts=\{accounts\}/, `<LoginView\n        appLogoUrl={generalSettings.appLogoUrl}\n        accounts={accounts}`);
appContent = appContent.replace(/<iOSGlassLayout\n        currentUser=\{currentUser\}/, `<iOSGlassLayout\n        appLogoUrl={generalSettings.appLogoUrl}\n        currentUser={currentUser}`);
fs.writeFileSync('src/App.tsx', appContent);

console.log("Patched LoginView and App.tsx for Logo");
