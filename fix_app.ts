import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('import { AnimatePresence, motion }')) {
  content = content.replace(
    /import \{ RefreshCcw, AlertTriangle, X \} from 'lucide-react';/,
    "import { RefreshCcw, AlertTriangle, X } from 'lucide-react';\nimport { AnimatePresence, motion } from 'motion/react';"
  );
  fs.writeFileSync('src/App.tsx', content);
}
