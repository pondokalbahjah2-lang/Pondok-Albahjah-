import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

// I need to add DownloadCloud properly
if (!content.includes('DownloadCloud')) {
  content = content.replace("import { Image } from 'lucide-react';", "import { Image, DownloadCloud } from 'lucide-react';");
}

// Add the handlers back manually.
const handlerCode = `
  const handleSaveManhajiyyah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const newClause: ManhajiyyahClause = {
      id: editingManhajiyyahId || \`man-\${Date.now()}\`,
      bab: manBab,
      pasalNumber: manPasalNumber,
      title: manTitle,
      category: manCategory,
      content: manContent
    };
    
    let updated: ManhajiyyahClause[];
    if (editingManhajiyyahId) {
      updated = manhajiyyahClauses.map(c => c.id === editingManhajiyyahId ? newClause : c);
    } else {
      updated = [...manhajiyyahClauses, newClause];
    }
    
    onSaveManhajiyyahClauses(updated);
    setShowManhajiyyahModal(false);
    setEditingManhajiyyahId(null);
    setManBab('');
    setManPasalNumber('');
    setManTitle('');
    setManCategory('');
    setManContent('');
  };
  
  const handleDeleteManhajiyyah = (id: string) => {
    if (!window.confirm("Hapus pasal ini?")) return;
    const updated = manhajiyyahClauses.filter(c => c.id !== id);
    onSaveManhajiyyahClauses(updated);
  };
`;

if (!content.includes('const handleSaveManhajiyyah =')) {
  content = content.replace(/  const toggleHariKerja =/, handlerCode + '\n  const toggleHariKerja =');
}

fs.writeFileSync('src/components/SettingsView.tsx', content);

// Fix mockData
let mockContent = fs.readFileSync('src/data/mockData.ts', 'utf-8');
mockContent = mockContent.replace(/pasalNumber: (".*?"),/g, 'bab: "I", pasalNumber: $1,');
fs.writeFileSync('src/data/mockData.ts', mockContent);

console.log("Fixes applied");
