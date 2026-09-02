import fs from 'fs';

let content = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf-8');

const originalAnchor = `<a
                        href={slip.fileUrl}
                        download={slip.fileName}
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Dokumen</span>
                      </a>`;

const newAnchor = `<a
                        href={slip.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Buka GDrive</span>
                      </a>`;

content = content.replace(originalAnchor, newAnchor);

// Also verify if there is any other 'Unduh' or 'Download' that needs fixing
fs.writeFileSync('src/components/SlipUbarView.tsx', content, 'utf-8');
console.log('Fixed anchor');
