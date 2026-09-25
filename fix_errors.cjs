const fs = require('fs');

// Fix KajianView
let kajianCode = fs.readFileSync('src/components/KajianView.tsx', 'utf8');
kajianCode = kajianCode.replace(/import \{ ([^}]+), AlertTriangle \} from 'lucide-react';/, "import { $1 } from 'lucide-react';");
if (!kajianCode.includes('AlertTriangle')) {
    kajianCode = kajianCode.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, AlertTriangle } from 'lucide-react';");
}
fs.writeFileSync('src/components/KajianView.tsx', kajianCode);

// Fix IzinKeluarView
let izinCode = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');
if (!izinCode.includes('AnimatePresence')) {
  izinCode = "import { motion, AnimatePresence } from 'framer-motion';\n" + izinCode;
}
if (!izinCode.includes('setConfirmIzinAction')) {
    // Add state!
    izinCode = izinCode.replace('const [approvalRecord, setApprovalRecord] = useState<ExitPermissionRecord | null>(null);', 'const [approvalRecord, setApprovalRecord] = useState<ExitPermissionRecord | null>(null);\n  const [confirmIzinAction, setConfirmIzinAction] = useState<{isRejected: boolean, event: any} | null>(null);');
}
fs.writeFileSync('src/components/IzinKeluarView.tsx', izinCode);
console.log('Fixed syntax errors');
