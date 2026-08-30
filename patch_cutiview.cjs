const fs = require('fs');
let code = fs.readFileSync('src/components/CutiView.tsx', 'utf8');

code = code.replace(
  '  jenisCutiList?: { id: string; name: string; maxDays: number; }[];',
  '  jenisCutiList?: { id: string; name: string; maxDays: number; }[];\n  onSaveAccounts?: (accounts: UserAccount[]) => void;'
);

const componentOld = `export const CutiView: React.FC<CutiViewProps> = ({
  currentUser,
  accounts,
  leaveRequests,
  onSaveLeaveRequests,
  suratCutiTemplateUrl,
  kepalaPondokName,
  appLogoUrl,
  cutiApprovers,
  jenisCutiList = DEFAULT_JENIS_CUTI,
}) => {`;

const componentNew = `export const CutiView: React.FC<CutiViewProps> = ({
  currentUser,
  accounts,
  leaveRequests,
  onSaveLeaveRequests,
  suratCutiTemplateUrl,
  kepalaPondokName,
  appLogoUrl,
  cutiApprovers,
  jenisCutiList = DEFAULT_JENIS_CUTI,
  onSaveAccounts,
}) => {`;

if (code.includes(componentOld)) {
  code = code.replace(componentOld, componentNew);
} else {
  console.log('componentOld not found');
}

const saveLogicOld = `    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    onSaveLeaveRequests([newRecord, ...leaveRequests]);`;

const saveLogicNew = `    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    onSaveLeaveRequests([newRecord, ...leaveRequests]);
    
    // Auto-update NIPY
    if (nipy && targetUser.nipy !== nipy) {
      if (onSaveAccounts) {
        const updatedAccounts = accounts.map(a => a.id === targetUser.id ? { ...a, nipy } : a);
        onSaveAccounts(updatedAccounts);
      }
    }`;

if (code.includes(saveLogicOld)) {
  code = code.replace(saveLogicOld, saveLogicNew);
} else {
  console.log('saveLogicOld not found');
}

fs.writeFileSync('src/components/CutiView.tsx', code);
console.log('CutiView patched');
