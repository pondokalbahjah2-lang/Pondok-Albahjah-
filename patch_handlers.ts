import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

// The original patching messed up the handlers.
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

if (!content.includes('const handleSaveManhajiyyah = (e: React.FormEvent)')) {
  // Try to find a place to put it
  content = content.replace('  const handleLogoUpload =', handlerCode + '\n  const handleLogoUpload =');
  fs.writeFileSync('src/components/SettingsView.tsx', content);
}
