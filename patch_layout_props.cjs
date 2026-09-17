const fs = require('fs');
let code = fs.readFileSync('src/components/iOSGlassLayout.tsx', 'utf8');

code = code.replace(
  "  children: React.ReactNode;",
  "  children: React.ReactNode;\n  notifications?: any[];\n  onMarkNotificationRead?: (id: string) => void;"
);

code = code.replace(
  "  cutiApprovers = [],\n  children",
  "  cutiApprovers = [],\n  children,\n  notifications = [],\n  onMarkNotificationRead"
);

// Add the Bell icon to the top right header area.
// We need to find the header div.
code = code.replace(
  "import { LayoutDashboard, Calendar, FileText, AlertOctagon, Settings, LogOut, FileSpreadsheet, MapPin, CalendarCheck, Megaphone, BookOpen, Download } from 'lucide-react';",
  "import { LayoutDashboard, Calendar, FileText, AlertOctagon, Settings, LogOut, FileSpreadsheet, MapPin, CalendarCheck, Megaphone, BookOpen, Download, Bell } from 'lucide-react';"
);

fs.writeFileSync('src/components/iOSGlassLayout.tsx', code);
console.log('Patched layout props');
