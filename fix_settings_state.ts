import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

content = content.replace(
  /onSaveManhajiyyahClauses,\n\}\) => \{/,
  "onSaveManhajiyyahClauses,\n  onDeleteAttendanceByMonth,\n}) => {\n  const [deleteMonth, setDeleteMonth] = useState('');\n  const [deletePassword, setDeletePassword] = useState('');"
);

content = content.replace(
  /onSaveManhajiyyahClauses: \(clauses: ManhajiyyahClause\[\]\) => void;\n\}/,
  "onSaveManhajiyyahClauses: (clauses: ManhajiyyahClause[]) => void;\n  onDeleteAttendanceByMonth?: (month: string) => void;\n}"
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
