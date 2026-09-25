const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
    /const PejuangDashboardAnalytics: React\.FC<\{/,
    "const PejuangDashboardAnalytics: React.FC<{\n  kajianRecords?: KajianRecord[];"
);

code = code.replace(
    /}> = \(\{ currentUser, attendance, leaveRequests, exitPermissions \}\) => \{/,
    "}> = ({ currentUser, attendance, leaveRequests, exitPermissions, kajianRecords = [] }) => {"
);

// We also need to update the caller inside DashboardView to pass `kajianRecords={kajianRecords}`.
// Let's find where `<PejuangDashboardAnalytics` is called.
code = code.replace(
    /<PejuangDashboardAnalytics\s*currentUser=\{currentUser\}\s*attendance=\{attendance\}\s*leaveRequests=\{leaveRequests\}\s*exitPermissions=\{exitPermissions\}\s*\/>/g,
    "<PejuangDashboardAnalytics currentUser={currentUser} attendance={attendance} leaveRequests={leaveRequests} exitPermissions={exitPermissions} kajianRecords={kajianRecords} />"
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('Patched PejuangDashboardAnalytics props');
