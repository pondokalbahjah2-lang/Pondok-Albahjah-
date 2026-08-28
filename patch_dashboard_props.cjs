const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// Add WarningLetterRecord to types import
content = content.replace(
  '  LeaveRequestRecord,\n} from \'../types\';',
  '  LeaveRequestRecord,\n  WarningLetterRecord,\n} from \'../types\';'
);

// Add warningLetters to interface
content = content.replace(
  '  leaveRequests: LeaveRequestRecord[];\n  onNavigate: (tab: string) => void;\n}',
  '  leaveRequests: LeaveRequestRecord[];\n  warningLetters: WarningLetterRecord[];\n  onNavigate: (tab: string) => void;\n}'
);

// Add warningLetters to component destructuring
content = content.replace(
  '  leaveRequests,\n  onNavigate,\n}) => {',
  '  leaveRequests,\n  warningLetters,\n  onNavigate,\n}) => {'
);

fs.writeFileSync('src/components/DashboardView.tsx', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  '                leaveRequests={leaveRequests}\n                onNavigate={setActiveTab}\n              />',
  '                leaveRequests={leaveRequests}\n                warningLetters={warningLetters}\n                onNavigate={setActiveTab}\n              />'
);
fs.writeFileSync('src/App.tsx', appContent);
