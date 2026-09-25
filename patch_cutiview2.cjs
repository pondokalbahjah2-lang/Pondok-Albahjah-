const fs = require('fs');
let code = fs.readFileSync('src/components/CutiView.tsx', 'utf8');

const componentOld = `export const CutiView: React.FC<CutiViewProps> = ({
  currentUser,
  accounts,
  leaveRequests,
  onSaveLeaveRequests,
  suratCutiTemplateUrl,
  kepalaPondokName,
  appLogoUrl,
  cutiApprovers = [],
  jenisCutiList = DEFAULT_JENIS_CUTI
}) => {`;

const componentNew = `export const CutiView: React.FC<CutiViewProps> = ({
  currentUser,
  accounts,
  leaveRequests,
  onSaveLeaveRequests,
  suratCutiTemplateUrl,
  kepalaPondokName,
  appLogoUrl,
  cutiApprovers = [],
  jenisCutiList = DEFAULT_JENIS_CUTI,
  onSaveAccounts,
}) => {`;

if (code.includes(componentOld)) {
  code = code.replace(componentOld, componentNew);
} else {
  console.log('componentOld not found');
}

fs.writeFileSync('src/components/CutiView.tsx', code);
console.log('CutiView patched');
