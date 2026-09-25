const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const handleAddUserEnd = `      onSaveAccounts([...accounts, newUser]);
      setShowAddUserModal(false);
      setNewUsername('');
      setNewPassword('User123');
      setNewName('');
      alert(\`Berhasil! Pejuang \${newUser.name} telah ditambahkan dan disimpan ke Database.\`);
    }
  };`;

const handleEditUserLogic = `      onSaveAccounts([...accounts, newUser]);
      setShowAddUserModal(false);
      setNewUsername('');
      setNewPassword('User123');
      setNewName('');
      alert(\`Berhasil! Pejuang \${newUser.name} telah ditambahkan dan disimpan ke Database.\`);
    }
  };

  const handleEditUserSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    if (!newUsername.trim() || !newName.trim()) {
      alert('Mohon lengkapi Username dan Nama Pejuang.');
      return;
    }

    const email = newEmail.trim() || \`\${newUsername.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@albahjah.or.id\`;
    
    // In a real production app with Firebase Auth, changing email or password of other users 
    // from the client requires Admin SDK. Here we update the Firestore document which stores a copy.
    
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
  };`;

if (code.includes(handleAddUserEnd)) {
  code = code.replace(handleAddUserEnd, handleEditUserLogic);
} else {
  console.log('handleAddUserEnd not found');
}

const modalBlockEnd = `        </div>
      )}

      {/* Modal Tambah Jadwal Kerja */}`;

const editModalBlock = `        </div>
      )}

      {/* Modal Edit Pejuang */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
                <Edit className="w-4 h-4 text-emerald-600" />
                <span>Edit Data Pejuang</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditUserSave} className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Lengkap Pejuang</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">NIPY</label>
                  <input
                    type="text"
                    value={newNipy}
                    onChange={(e) => setNewNipy(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Kata Sandi (Password)</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Hak Akses (Role)</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'Admin' | 'Pejuang')}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Pejuang">Pejuang</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Sub Divisi</label>
                  <input
                    type="text"
                    required
                    value={newSubDivisi}
                    onChange={(e) => setNewSubDivisi(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Amanah / Tugas Utama</label>
                <input
                  type="text"
                  required
                  value={newAmanah}
                  onChange={(e) => setNewAmanah(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Jadwal Kerja */}`;

if (code.includes(modalBlockEnd)) {
  code = code.replace(modalBlockEnd, editModalBlock);
} else {
  console.log('modalBlockEnd not found');
}

fs.writeFileSync('src/components/SettingsView.tsx', code);
console.log('SettingsView handleEdit logic and modal patched.');
