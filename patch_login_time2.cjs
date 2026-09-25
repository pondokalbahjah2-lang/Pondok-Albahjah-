const fs = require('fs');

const file = 'src/components/LoginView.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Add currentTime state
if (!content.includes('const [currentTime, setCurrentTime] = useState')) {
  content = content.replace(
    /const \[showClauseModal, setShowClauseModal\] = useState\(false\);/,
    `const [showClauseModal, setShowClauseModal] = useState(false);\n  const [currentTime, setCurrentTime] = useState('');`
  );
}

fs.writeFileSync(file, content);
console.log("Patched LoginView.tsx perfectly.");
