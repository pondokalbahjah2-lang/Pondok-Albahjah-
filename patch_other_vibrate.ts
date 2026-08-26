import fs from 'fs';

let cutiContent = fs.readFileSync('src/components/CutiView.tsx', 'utf-8');
cutiContent = cutiContent.replace(
  /onSaveLeaveRequests\(\[newRecord, \.\.\.leaveRequests\]\);/,
  "if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);\n    onSaveLeaveRequests([newRecord, ...leaveRequests]);"
);
fs.writeFileSync('src/components/CutiView.tsx', cutiContent);

let ubarContent = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf-8');
ubarContent = ubarContent.replace(
  /onSaveSlipUbar\(\[newRecord, \.\.\.slipUbarList\]\);/,
  "if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);\n    onSaveSlipUbar([newRecord, ...slipUbarList]);"
);
fs.writeFileSync('src/components/SlipUbarView.tsx', ubarContent);

