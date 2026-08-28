const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const popupState = `  const [activeWarning, setActiveWarning] = useState<WarningLetterRecord | null>(null);

  React.useEffect(() => {
    if (currentUser.role === 'Pejuang') {
      const myWarnings = warningLetters.filter(w => w.pejuangId === currentUser.id);
      if (myWarnings.length > 0) {
        // Sort descending
        myWarnings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latest = myWarnings[0];
        const isDismissed = localStorage.getItem(\`dismissedWarning_\${latest.id}\`);
        if (!isDismissed) {
          setActiveWarning(latest);
        }
      }
    }
  }, [warningLetters, currentUser]);

  const dismissWarning = () => {
    if (activeWarning) {
      localStorage.setItem(\`dismissedWarning_\${activeWarning.id}\`, 'true');
      setActiveWarning(null);
    }
  };
`;

content = content.replace(
  "const [searchQuery, setSearchQuery] = useState('');",
  "const [searchQuery, setSearchQuery] = useState('');\n" + popupState
);

fs.writeFileSync('src/components/DashboardView.tsx', content);
