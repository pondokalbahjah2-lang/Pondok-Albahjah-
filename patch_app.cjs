const fs = require('fs');

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add state
if (!content.includes('showWelcomeManhajiyyah')) {
  content = content.replace(
    /const \[activeTab, setActiveTab\] = useState<string>\('dashboard'\);/,
    `const [activeTab, setActiveTab] = useState<string>('dashboard');\n  const [showWelcomeManhajiyyah, setShowWelcomeManhajiyyah] = useState(false);`
  );
}

// 2. Set showWelcomeManhajiyyah in handleLoginSuccess
content = content.replace(
  /const handleLoginSuccess = \(user: UserAccount\) => {[\s\S]*?logAudit\('LOGIN', 'User logged in successfully', user\);\n  };/,
  `const handleLoginSuccess = (user: UserAccount) => {
    console.log('App: handleLoginSuccess called. Setting currentUser to:', user.id);
    setCurrentUser(user);
    setActiveTab(user.role === 'Admin' ? 'dashboard' : 'absensi');
    setShowWelcomeManhajiyyah(true);
    logAudit('LOGIN', 'User logged in successfully', user);
  };`
);

// 3. Render Modal in App.tsx just before the closing </div> of <MainLayout> ... wait, MainLayout is used to wrap views.
// Let's add it right before the last closing div of the return statement if user is logged in.
// Or just inject it inside the return statement where currentUser is true.
