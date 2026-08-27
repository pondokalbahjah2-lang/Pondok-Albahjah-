const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add broadcastMessage to types (if not in separate file)
if (fs.existsSync('src/types.ts')) {
  let types = fs.readFileSync('src/types.ts', 'utf8');
  if (!types.includes('broadcastMessage?: string;')) {
    types = types.replace(
      "jenisCutiList?: { id: string; name: string; maxDays: number; }[];",
      "jenisCutiList?: { id: string; name: string; maxDays: number; }[];\n  broadcastMessage?: string;"
    );
    fs.writeFileSync('src/types.ts', types);
  }
}

// 2. Modify onDeleteAttendanceByMonth
content = content.replace(
  "const lvToKeep = leaveRequests.filter(l => !l.tanggalMulai.startsWith(month));",
  "// const lvToKeep = leaveRequests.filter(l => !l.tanggalMulai.startsWith(month));"
);
content = content.replace(
  "const lvToDelete = leaveRequests.filter(l => l.tanggalMulai.startsWith(month));",
  "const lvToDelete: any[] = []; // leaveRequests.filter(l => l.tanggalMulai.startsWith(month));"
);
content = content.replace(
  "const slToKeep = slipUbarList.filter(s => !s.tanggalUpload.startsWith(month));",
  "// const slToKeep = slipUbarList.filter(s => !s.tanggalUpload.startsWith(month));"
);
content = content.replace(
  "const slToDelete = slipUbarList.filter(s => s.tanggalUpload.startsWith(month));",
  "const slToDelete: any[] = []; // slipUbarList.filter(s => s.tanggalUpload.startsWith(month));"
);

content = content.replace(
  "setLeaveRequests(lvToKeep);",
  "// setLeaveRequests(lvToKeep);"
);
content = content.replace(
  "setSlipUbarList(slToKeep);",
  "// setSlipUbarList(slToKeep);"
);

// 3. Pass generalSettings to iOSGlassLayout for broadcast
content = content.replace(
  "<iOSGlassLayout",
  "<iOSGlassLayout\n          broadcastMessage={generalSettings.broadcastMessage}"
);

// Also pass to SettingsView
content = content.replace(
  "onSaveGeneralSettings={handleSaveGeneralSettings}",
  "broadcastMessage={generalSettings.broadcastMessage}\n                onSaveGeneralSettings={handleSaveGeneralSettings}"
);

fs.writeFileSync('src/App.tsx', content);
