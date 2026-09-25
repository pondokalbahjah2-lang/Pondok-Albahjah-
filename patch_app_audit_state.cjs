const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 2. Add Audit Log state
if (!content.includes('const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>')) {
  content = content.replace(
    "const [schedules, setSchedules] = useState<WorkSchedule[]>([]);",
    "const [schedules, setSchedules] = useState<WorkSchedule[]>([]);\n  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);"
  );
}

fs.writeFileSync('src/App.tsx', content);
