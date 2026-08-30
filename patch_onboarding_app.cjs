const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Import OnboardingModal
code = code.replace(
  "import { SettingsView } from './components/SettingsView';",
  "import { SettingsView } from './components/SettingsView';\nimport { OnboardingModal } from './components/OnboardingModal';"
);

// 2. Add showOnboarding state
code = code.replace(
  "const [showDesyncBanner, setShowDesyncBanner] = useState(false);",
  "const [showDesyncBanner, setShowDesyncBanner] = useState(false);\n  const [showOnboarding, setShowOnboarding] = useState(false);"
);

// 3. Trigger onboarding on login if not seen
code = code.replace(
  "logAudit('LOGIN', 'User logged in successfully', user);",
  `logAudit('LOGIN', 'User logged in successfully', user);
    
    // Check onboarding
    if (user.role === 'Pejuang') {
      const hasSeen = AppStorage.getItem(\`onboarding_seen_\${user.id}\`);
      if (!hasSeen) {
        setShowOnboarding(true);
      }
    }`
);

// 4. Render OnboardingModal
const renderAnchor = `{/* Desync Banner */}`;
const renderReplacement = `{/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && currentUser && (
          <OnboardingModal 
            userName={currentUser.name} 
            onClose={() => {
              setShowOnboarding(false);
              AppStorage.setItem(\`onboarding_seen_\${currentUser.id}\`, 'true');
            }} 
          />
        )}
      </AnimatePresence>

      {/* Desync Banner */}`;

code = code.replace(renderAnchor, renderReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched with OnboardingModal');
