const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

const oldViewer = `{previewImage?.includes('drive.google.com') ? (
                <iframe 
                  src={previewImage.replace(/\\/view.*$/, '/preview').replace(/\\/edit.*$/, '/preview')} 
                  className="w-full h-[65vh] rounded-xl border-0" 
                  allow="autoplay"
                ></iframe>
              ) : (
                <img src={previewImage || ''} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
              )}`;

const newViewer = `
              {(() => {
                let embedUrl = previewImage || '';
                if (embedUrl.includes('drive.google.com')) {
                  const match = embedUrl.match(/\\/d\\/([a-zA-Z0-9_-]+)/);
                  if (match && match[1]) {
                    embedUrl = \`https://drive.google.com/file/d/\${match[1]}/preview\`;
                  } else if (embedUrl.includes('id=')) {
                    const idMatch = embedUrl.match(/id=([a-zA-Z0-9_-]+)/);
                    if (idMatch && idMatch[1]) {
                      embedUrl = \`https://drive.google.com/file/d/\${idMatch[1]}/preview\`;
                    }
                  }
                  return (
                    <iframe 
                      src={embedUrl} 
                      className="w-full h-[65vh] rounded-xl border-0" 
                      allow="autoplay"
                    ></iframe>
                  );
                }
                return <img src={embedUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl" />;
              })()}
`;

code = code.replace(oldViewer, newViewer);
fs.writeFileSync('src/components/KajianView.tsx', code);
console.log('Patched modal to use robust iframe for GDrive');
