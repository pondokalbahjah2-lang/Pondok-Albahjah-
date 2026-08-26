import fs from 'fs';

let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

const regex = /authenticatorSelection:\s*\{\s*userVerification:\s*'preferred'\s*\}/g;
content = content.replace(regex, "authenticatorSelection: { userVerification: 'preferred' }");

// Wait, let's just use string replace for the whole authenticatorSelection block to be safe
content = content.replace(
  /authenticatorSelection: \{\s*userVerification: 'preferred'\s*\}/,
  "authenticatorSelection: { userVerification: 'preferred' }"
);

// If there's an older block still there with authenticatorAttachment: 'platform' let's remove it
content = content.replace(
  /authenticatorSelection: \{\s*authenticatorAttachment: 'platform',\s*userVerification: 'required'\s*\}/g,
  "authenticatorSelection: { userVerification: 'preferred' }"
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
