import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const footerHtml = `
        </AnimatePresence>
        
        {/* Footer Created By Abdu Salam */}
        <div className="w-full mt-auto pt-6 pb-4">
          <div className="max-w-md mx-auto text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 py-3 shadow-lg">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center space-x-2">
              <span>Created By</span>
              <span className="text-blue-600 dark:text-blue-400 font-black tracking-normal text-xs sm:text-sm">Abdu Salam</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Al-Bahjah Cirebon 1</span>
            </p>
          </div>
        </div>
        
      </IOSGlassLayout>
`;

content = content.replace(
  /        <\/AnimatePresence>\n      <\/IOSGlassLayout>/,
  footerHtml
);

fs.writeFileSync('src/App.tsx', content);
