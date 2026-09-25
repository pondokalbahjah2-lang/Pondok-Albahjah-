import fs from 'fs';
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

// Add appLogoUrl to Props
content = content.replace(/interface SidebarProps \{/, `interface SidebarProps {\n  appLogoUrl?: string;`);

// Replace icon rendering in Sidebar
const newHeader = `
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
            {appLogoUrl ? (
              <img src={appLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-8 h-8" />
            )}
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
            Portal Pejuang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Al-Bahjah Cirebon 1</p>
        </div>
      </div>
`;
content = content.replace(/      <div className="p-6">[\s\S]*?<\/div>\n      <\/div>/, newHeader);

// Ensure the props destructured actually gets appLogoUrl
content = content.replace(/const Sidebar: React\.FC<SidebarProps> = \(\{/, `const Sidebar: React.FC<SidebarProps> = ({ appLogoUrl,`);

fs.writeFileSync('src/components/Sidebar.tsx', content);
console.log("Patched Sidebar.tsx");
