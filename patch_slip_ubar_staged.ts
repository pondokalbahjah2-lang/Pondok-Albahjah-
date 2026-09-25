import fs from 'fs';

let content = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf-8');

// Remove stagedBulkFiles UI modal
content = content.replace(/\{\/\* Staged Bulk Upload Modal \*\/\}[\s\S]*?\}\)/, '');

// There might be trailing </div></div>)} from the modal. Let's just do a clean cut using string split.
const parts = content.split('{/* Staged Bulk Upload Modal */}');
if (parts.length > 1) {
  content = parts[0] + '    </div>\n  );\n};\n';
}

// Remove stagedBulkFiles state and handlers
content = content.replace(/const \[stagedBulkFiles, setStagedBulkFiles\] = useState<StagedBulkUpload\[\]>\(\[\]\);\n/, '');
content = content.replace(/const handleBulkUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?e\.target\.value = '';\n  \};\n/, '');
content = content.replace(/const handleUpdateStagedPejuang = \(id: string, pejuangId: string\) => \{[\s\S]*?\} : s\)\);\n  \};\n/, '');
content = content.replace(/const handleUpdateStagedPassword = \(id: string, pass: string\) => \{[\s\S]*?\} : s\)\);\n  \};\n/, '');
content = content.replace(/const handleUpdateStagedFile = \(id: string, newFile: File\) => \{[\s\S]*?\} : s\)\);\n  \};\n/, '');
content = content.replace(/const handleRemoveStaged = \(id: string\) => \{[\s\S]*?s\.id !== id\)\);\n  \};\n/, '');
content = content.replace(/const handleSaveBulk = async \(\) => \{[\s\S]*?console\.error\(error\);\n    \}\n  \};/, '');

fs.writeFileSync('src/components/SlipUbarView.tsx', content, 'utf-8');
console.log('Removed staged bulk files logic');
