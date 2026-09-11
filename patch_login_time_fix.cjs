const fs = require('fs');

const file = 'src/components/LoginView.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Replace {currentTime} with actual formatted time from `now`
content = content.replace(
  /\{currentTime\}/g,
  `{now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}:{now.getSeconds().toString().padStart(2, '0')}`
);

// We can also remove `const [currentTime, setCurrentTime] = useState('');` since it's not used.
content = content.replace(/const \[currentTime, setCurrentTime\] = useState\(''\);\n/, '');

fs.writeFileSync(file, content);
console.log("Patched LoginView.tsx perfectly for clock.");
