import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

content = content.replace(
  /      \)}\n    <\/div>\n  \);\n\};/,
  "      )}\n    </div>\n    </div>\n  );\n};"
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
