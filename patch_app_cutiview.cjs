const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `<CutiView
                currentUser={currentUser}
                accounts={accounts}
                leaveRequests={leaveRequests}
                onSaveLeaveRequests={handleSaveLeaveRequests}
                suratCutiTemplateUrl={generalSettings.suratCutiTemplateUrl}
                kepalaPondokName={generalSettings.kepalaPondokName}
                appLogoUrl={generalSettings.appLogoUrl}
                cutiApprovers={generalSettings.cutiApprovers}
                jenisCutiList={generalSettings.jenisCutiList}
              />`;

const newCode = `<CutiView
                currentUser={currentUser}
                accounts={accounts}
                leaveRequests={leaveRequests}
                onSaveLeaveRequests={handleSaveLeaveRequests}
                suratCutiTemplateUrl={generalSettings.suratCutiTemplateUrl}
                kepalaPondokName={generalSettings.kepalaPondokName}
                appLogoUrl={generalSettings.appLogoUrl}
                cutiApprovers={generalSettings.cutiApprovers}
                jenisCutiList={generalSettings.jenisCutiList}
                onSaveAccounts={handleSaveAccounts}
              />`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx patched for CutiView');
} else {
  console.log('oldCode not found in App.tsx');
}
