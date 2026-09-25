import fs from 'fs';

let content = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf-8');

content = content.replace(
  /<a\s+href=\{slip\.fileUrl\}\s+download=\{slip\.fileName\}[^>]*>\s*<Download className="w-3\.5 h-3\.5" \/>\s*<span>Unduh Dokumen<\/span>\s*<\/a>/,
  `<a
      href={slip.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Buka Link</span>
    </a>`
);

fs.writeFileSync('src/components/SlipUbarView.tsx', content, 'utf-8');
console.log('Fixed anchor with regex');
