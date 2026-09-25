const fs = require('fs');

const file = 'src/components/LoginView.tsx';
let content = fs.readFileSync(file, 'utf-8');

// I need to find where setCurrentTime is and add an interval for it.
const effectRegex = /useEffect\(\(\) => \{[\s\S]*?setHijriDate\([\s\S]*?\}\s*\}, \[\]\);/;
const match = content.match(effectRegex);

if (match) {
  let newEffect = match[0].replace(
    /const now = new Date\(\);\n\s*const hours = now\.getHours\(\)\.toString\(\)\.padStart\(2, '0'\);\n\s*const mins = now\.getMinutes\(\)\.toString\(\)\.padStart\(2, '0'\);\n\s*const secs = now\.getSeconds\(\)\.toString\(\)\.padStart\(2, '0'\);\n\s*setCurrentTime\(\`\$\{hours\}:\$\{mins\}:\$\{secs\}\`\);/,
    `const updateTime = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const mins = now.getMinutes().toString().padStart(2, '0');
        const secs = now.getSeconds().toString().padStart(2, '0');
        setCurrentTime(\`\${hours}:\${mins}:\${secs}\`);
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);`
  );
  
  newEffect = newEffect.replace(
    /\}\s*\}, \[\]\);/,
    `  return () => clearInterval(interval);\n    }\n  }, []);`
  );
  
  content = content.replace(effectRegex, newEffect);
  fs.writeFileSync(file, content);
  console.log("Patched LoginView.tsx to update time every second.");
} else {
  console.log("Could not find useEffect in LoginView.");
}

