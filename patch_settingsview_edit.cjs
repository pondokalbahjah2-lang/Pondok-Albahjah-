const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const modalStatesOld = `  // New account form modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('User123');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Pejuang'>('Pejuang');
  const [newSubDivisi, setNewSubDivisi] = useState('Manajemen Kepondokan');
  const [newAmanah, setNewAmanah] = useState('Staff');`;

const modalStatesNew = `  // New account form modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  
  // Edit account modal states
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('User123');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Pejuang'>('Pejuang');
  const [newSubDivisi, setNewSubDivisi] = useState('Manajemen Kepondokan');
  const [newAmanah, setNewAmanah] = useState('Staff');
  const [newNipy, setNewNipy] = useState('');`;

if (code.includes(modalStatesOld)) {
  code = code.replace(modalStatesOld, modalStatesNew);
} else {
  console.log('modalStatesOld not found');
}

const tableHeaderOld = `<th className="py-2.5 px-3">Amanah</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>`;
const tableHeaderNew = `<th className="py-2.5 px-3">Amanah</th>
                  <th className="py-2.5 px-3">NIPY</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>`;

if (code.includes(tableHeaderOld)) {
  code = code.replace(tableHeaderOld, tableHeaderNew);
} else {
  console.log('tableHeaderOld not found');
}

const tableBodyOld = `                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {acc.amanah}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(acc.id)}
                        className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>`;

const tableBodyNew = `                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {acc.amanah}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                      {acc.nipy || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setEditingUserId(acc.id);
                          setNewUsername(acc.username);
                          setNewEmail(acc.email || '');
                          setNewPassword(acc.password || '');
                          setNewName(acc.name);
                          setNewRole(acc.role);
                          setNewSubDivisi(acc.subDivisi);
                          setNewAmanah(acc.amanah);
                          setNewNipy(acc.nipy || '');
                          setShowEditUserModal(true);
                        }}
                        className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 mr-2"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(acc.id)}
                        className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>`;

if (code.includes(tableBodyOld)) {
  code = code.replace(tableBodyOld, tableBodyNew);
} else {
  console.log('tableBodyOld not found');
}

fs.writeFileSync('src/components/SettingsView.tsx', code);
console.log('SettingsView basic patched');
