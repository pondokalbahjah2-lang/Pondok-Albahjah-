const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

// replace any lucide-react import with a clean one
const lucideImports = ['BookOpen', 'MapPin', 'Search', 'Download', 'Check', 'X', 'AlertTriangle'];
code = code.replace(/import \{[^}]+\} from 'lucide-react';/g, '');
code = "import { " + lucideImports.join(', ') + " } from 'lucide-react';\n" + code;

fs.writeFileSync('src/components/KajianView.tsx', code);
console.log('Fixed Lucide imports Kajian');
