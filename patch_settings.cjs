const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const oldLogic = `  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      alert('Mohon lengkapi Username dan Nama Pejuang.');
      return;
    }`;

const newLogic = `  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      alert('Mohon lengkapi Username dan Nama Pejuang.');
      return;
    }
    
    // Check for duplicates
    if (accounts.some(a => a.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert('Username ini sudah terdaftar. Silakan gunakan username lain.');
      return;
    }
    if (accounts.some(a => a.name.toLowerCase() === newName.trim().toLowerCase())) {
      alert('Nama Pejuang ini sudah terdaftar. Jangan sampai ada nama pejuang yang double.');
      return;
    }`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync('src/components/SettingsView.tsx', content);
  console.log("SettingsView updated successfully.");
} else {
  console.log("oldLogic not found in SettingsView.tsx");
}
