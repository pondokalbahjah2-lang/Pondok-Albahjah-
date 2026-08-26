import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

content = content.replace(
  /              <\/div>\n          <\/div>\n          \{\/\* Hapus Data Bulanan \*\/\}/,
  "              </div>\n          </div>\n          </div>\n          {/* Hapus Data Bulanan */}"
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
