const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
    /interface DashboardViewProps \{/,
    "import { KajianRecord } from '../types';\ninterface DashboardViewProps {\n  kajianRecords?: KajianRecord[];"
);

code = code.replace(
    /export const DashboardView: React\.FC<DashboardViewProps> = \(\{/,
    "export const DashboardView: React.FC<DashboardViewProps> = ({\n  kajianRecords = [],"
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('Patched DashboardView props');
