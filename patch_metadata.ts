import fs from 'fs';

// Update index.html
let indexContent = fs.readFileSync('index.html', 'utf-8');
indexContent = indexContent.replace(/<title>.*?<\/title>/, '<title>Portal Pejuang Al-Bahjah Cabang Cirebon 1</title>');
fs.writeFileSync('index.html', indexContent);

// Update metadata.json
let metaContent = fs.readFileSync('metadata.json', 'utf-8');
let meta = JSON.parse(metaContent);
meta.name = "Portal Pejuang Al-Bahjah Cabang Cirebon 1";
fs.writeFileSync('metadata.json', JSON.stringify(meta, null, 2));

console.log("Updated metadata & index");
