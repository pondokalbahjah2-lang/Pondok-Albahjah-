import fs from 'fs';

let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

const targetStr = `            {/* Photo Viewfinder Preview */}
            <div className="space-y-2">
              {attendanceStatus === 'Sakit' && (
                      <div className="relative w-full">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold text-center shadow-md flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                          <span>Atau Upload Surat Sakit (Gambar)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}`;

content = content.replace(/\{\/\* Photo Viewfinder Preview \*\/\}[\s\S]*?\{\/\* Notes \*\/\}/, `{/* Notes */}`);

fs.writeFileSync('src/components/AbsensiView.tsx', content, 'utf-8');
console.log('Fixed AbsensiView.tsx syntax');
