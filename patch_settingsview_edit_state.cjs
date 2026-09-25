const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const stateMatch = code.match(/(const \[showAddUserModal[\s\S]*?const \[newAmanah, setNewAmanah\] = useState\('.*?'\);)/);
if (stateMatch) {
  const newStates = stateMatch[0] + '\n  const [showEditUserModal, setShowEditUserModal] = useState(false);\n  const [editingUserId, setEditingUserId] = useState<string | null>(null);\n  const [newNipy, setNewNipy] = useState(\'\');';
  code = code.replace(stateMatch[0], newStates);
  fs.writeFileSync('src/components/SettingsView.tsx', code);
  console.log('States patched.');
} else {
  console.log('State match not found');
}

