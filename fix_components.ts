import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

// I need to properly implement Manhajiyyah save functions and add DownloadCloud import
if (!content.includes('import { DownloadCloud')) {
  content = content.replace("import { Settings, UserPlus, Users, X, Database, MapPin, CalendarClock, Briefcase, BookOpen, Image } from 'lucide-react';", "import { Settings, UserPlus, Users, X, Database, MapPin, CalendarClock, Briefcase, BookOpen, Image, DownloadCloud } from 'lucide-react';");
  content = content.replace("import { Settings, UserPlus, Users, MapPin, CalendarClock, Briefcase, BookOpen, Image } from 'lucide-react';", "import { Settings, UserPlus, Users, MapPin, CalendarClock, Briefcase, BookOpen, Image, DownloadCloud } from 'lucide-react';");
}

// Ensure handleSaveManhajiyyah exists
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
  content = content.replace('  const handleBackupData = () => {', handlerCode + '\n  const handleBackupData = () => {');
}

fs.writeFileSync('src/components/SettingsView.tsx', content);

// Fix mockData.ts TS error (Type 'number' is not assignable to type 'string')
let mockContent = fs.readFileSync('src/data/mockData.ts', 'utf-8');
mockContent = mockContent.replace(/pasalNumber: (\d+),/g, 'pasalNumber: "$1",');
fs.writeFileSync('src/data/mockData.ts', mockContent);

console.log("Fixes applied");
