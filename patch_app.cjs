const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `<DashboardView
                currentUser={currentUser}
                accounts={accounts}
                attendance={attendance}
                exitPermissions={exitPermissions}
                leaveRequests={leaveRequests}
                warningLetters={warningLetters}
                onNavigate={setActiveTab}
              />`;

const newLogic = `<DashboardView
                currentUser={currentUser}
                accounts={accounts}
                attendance={attendance}
                exitPermissions={exitPermissions}
                leaveRequests={leaveRequests}
                warningLetters={warningLetters}
                manhajiyyahClauses={manhajiyyahClauses}
                onNavigate={setActiveTab}
              />`;

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx updated.');
} else {
  console.log('oldLogic not found in App.tsx');
}
