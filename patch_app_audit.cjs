const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Import AuditLogView
if (!content.includes('import { AuditLogView }')) {
  content = content.replace(
    "import { SettingsView } from './components/SettingsView';",
    "import { SettingsView } from './components/SettingsView';\nimport { AuditLogView, AuditLogEntry } from './components/AuditLogView';"
  );
}

// 2. Add Audit Log state
if (!content.includes('const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>')) {
  content = content.replace(
    "const [broadcastMessage, setBroadcastMessage] = useState('');",
    "const [broadcastMessage, setBroadcastMessage] = useState('');\n  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([\n    { id: 'al-1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Ubah Pengaturan', adminName: 'Admin Utama', details: 'Mengubah radius toleransi absensi menjadi 300m.' },\n    { id: 'al-2', timestamp: new Date(Date.now() - 86400000).toISOString(), action: 'Tambah Pengguna', adminName: 'Admin Utama', details: 'Menambahkan 3 akun Pejuang baru.' }\n  ]);"
  );
}

// 3. Add to navigation
if (!content.includes('Riwayat Sistem')) {
  content = content.replace(
    "{ id: 'laporan', label: 'Laporan', icon: FileText },",
    "{ id: 'laporan', label: 'Laporan', icon: FileText },\n    { id: 'audit', label: 'Riwayat Sistem', icon: ShieldCheck },"
  );
}

// 4. Render the view
if (!content.includes('<AuditLogView')) {
  const insertIndex = content.indexOf("{activeTab === 'laporan' && (");
  if (insertIndex !== -1) {
    const viewStr = `
        {activeTab === 'audit' && (
          <AuditLogView logs={auditLogs} />
        )}
        `;
    content = content.slice(0, insertIndex) + viewStr + content.slice(insertIndex);
  }
}

fs.writeFileSync('src/App.tsx', content);
