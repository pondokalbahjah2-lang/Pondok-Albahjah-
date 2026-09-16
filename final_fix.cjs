const fs = require('fs');

let kajianCode = fs.readFileSync('src/components/KajianView.tsx', 'utf8');
kajianCode = kajianCode.replace(/import \{ motion \} from 'framer-motion';/g, "import { motion, AnimatePresence } from 'framer-motion';");
fs.writeFileSync('src/components/KajianView.tsx', kajianCode);

let izinCode = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');
izinCode = izinCode.replace(/import \{ motion \} from 'framer-motion';/g, "import { motion, AnimatePresence } from 'framer-motion';");
fs.writeFileSync('src/components/IzinKeluarView.tsx', izinCode);

console.log('Fixed imports');
