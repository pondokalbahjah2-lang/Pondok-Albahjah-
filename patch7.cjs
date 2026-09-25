const fs = require('fs');
let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

const targetStr = `                <button
                  type="submit"`;

const replacement = `                {attendanceStatus === 'Sakit' && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Link GDrive Foto Surat Sakit (Opsional)
                    </label>
                    <input
                      type="url"
                      value={suratSakitUrl}
                      onChange={(e) => setSuratSakitUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                )}
                <button
                  type="submit"`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('patched form properly');
