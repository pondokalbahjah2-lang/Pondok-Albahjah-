const fs = require('fs');

let izinCode = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf8');

// Force inject the state
izinCode = izinCode.replace('const [approvalRecord, setApprovalRecord] = useState', 
  'const [confirmIzinAction, setConfirmIzinAction] = useState<{isRejected: boolean, event: any} | null>(null);\n  const [approvalRecord, setApprovalRecord] = useState');

// Fix form onSubmit handleSubmitApproval -> handleSubmitApprovalClick
izinCode = izinCode.replace(/onSubmit=\{handleSubmitApproval\}/g, 'onSubmit={(e) => e.preventDefault()}');

// Fix missing AlertTriangle
const lucideImports = ['FileText', 'Calendar', 'Clock', 'Search', 'Filter', 'CheckCircle', 'XCircle', 'LogOut', 'LogIn', 'AlertTriangle'];
izinCode = izinCode.replace(/import \{[^}]+\} from 'lucide-react';/g, '');
izinCode = "import { " + lucideImports.join(', ') + " } from 'lucide-react';\n" + izinCode;

fs.writeFileSync('src/components/IzinKeluarView.tsx', izinCode);
console.log('Forced state injection');
