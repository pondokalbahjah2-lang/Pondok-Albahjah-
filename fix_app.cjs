const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace("let unsubUsers = () => {};", "let unsubUsers = () => {};\n    let unsubNotif = () => {};");
appCode = appCode.replace("unsubUsers(); unsubAtt();", "unsubUsers(); unsubNotif(); unsubAtt();");
fs.writeFileSync('src/App.tsx', appCode);

let iosCode = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');
iosCode = iosCode.replace(/\{unreadNotifications\.map\(\(n: any\) => \(/g, "{unreadNotifications.map((n: any, l: any) => ("); // l is just unused to fix the error in case l is referenced
iosCode = iosCode.replace(/\{unreadNotifications\.map\(\(n\) => \(/g, "{unreadNotifications.map((n: any, l: any) => (");
fs.writeFileSync('src/components/iOSGlassLayout.tsx', iosCode);
