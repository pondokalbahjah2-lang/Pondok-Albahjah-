const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const anchor = 'const handleAddUser = async (e: React.FormEvent) => {';

const newLogic = `
  const handleEditUserSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    if (!newUsername.trim() || !newName.trim()) {
      alert('Mohon lengkapi Username dan Nama Pejuang.');
      return;
    }

    const email = newEmail.trim() || \`\${newUsername.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@albahjah.or.id\`;
    
    const updatedAccounts = accounts.map(a => {
      if (a.id === editingUserId) {
        return {
          ...a,
          username: newUsername.trim(),
          password: newPassword,
          name: newName.trim(),
          role: newRole,
          subDivisi: newSubDivisi,
          amanah: newAmanah,
          nipy: newNipy,
          email: email
        };
      }
      return a;
    });

    onSaveAccounts(updatedAccounts);
    setShowEditUserModal(false);
    setEditingUserId(null);
    alert('Data Pejuang berhasil diperbarui.');
  };

  const handleAddUser = async (e: React.FormEvent) => {`;

if (code.includes(anchor)) {
  code = code.replace(anchor, newLogic);
  fs.writeFileSync('src/components/SettingsView.tsx', code);
  console.log('handleEditUserSave added.');
} else {
  console.log('anchor not found.');
}
