const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

// Replace the <img> tag in the modal with an iframe that supports GDrive
const imgTag = '<img src={previewImage} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl" />';

const newViewer = `
              {previewImage?.includes('drive.google.com') ? (
                <iframe 
                  src={previewImage.replace(/\\/view.*$/, '/preview').replace(/\\/edit.*$/, '/preview')} 
                  className="w-full h-[65vh] rounded-xl border-0" 
                  allow="autoplay"
                ></iframe>
              ) : (
                <img src={previewImage || ''} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
              )}
`;

code = code.replace(imgTag, newViewer);
fs.writeFileSync('src/components/KajianView.tsx', code);
console.log('Patched modal to use iframe for GDrive');
