const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `              <DashboardView
                currentUser={currentUser}
                accounts={accounts}
                attendance={attendance}
                exitPermissions={exitPermissions}
                leaveRequests={leaveRequests}
                warningLetters={warningLetters}
                manhajiyyahClauses={manhajiyyahClauses}
                onNavigate={setActiveTab}
              />`;

const replace = `              <DashboardView
                currentUser={currentUser}
                accounts={accounts}
                attendance={attendance}
                exitPermissions={exitPermissions}
                leaveRequests={leaveRequests}
                warningLetters={warningLetters}
                manhajiyyahClauses={manhajiyyahClauses}
                broadcastMessage={generalSettings.broadcastMessage}
                onNavigate={setActiveTab}
              />`;

if (code.includes(anchor)) {
  code = code.replace(anchor, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx broadcast patched.');
} else {
  console.log('Anchor not found in App.tsx');
}
