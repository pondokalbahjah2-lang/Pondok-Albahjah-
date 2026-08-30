const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `                manhajiyyahClauses={manhajiyyahClauses}
                broadcastMessage={generalSettings.broadcastMessage}
                onNavigate={setActiveTab}`;

const replacement = `                manhajiyyahClauses={manhajiyyahClauses}
                broadcastMessage={generalSettings.broadcastMessage}
                jenisCutiList={generalSettings.jenisCutiList}
                onNavigate={setActiveTab}`;

if (code.includes(anchor)) {
  code = code.replace(anchor, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx patched.');
} else {
  console.log('anchor not found.');
}
