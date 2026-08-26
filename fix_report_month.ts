import fs from 'fs';
let content = fs.readFileSync('src/components/LaporanView.tsx', 'utf-8');
content = content.replace(
  "const [selectedPejuangId, setSelectedPejuangId] = useState<string>(",
  "const [reportMonth, setReportMonth] = useState(new Date().toISOString().substring(0, 7));\n  const [selectedPejuangId, setSelectedPejuangId] = useState<string>("
);
fs.writeFileSync('src/components/LaporanView.tsx', content);
