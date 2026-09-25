const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

const anchor = `        </div>
      )}
    </div>
  );
};`;

const newCode = `        </div>
      )}

      {isAdmin && (
        <div className="p-6 mt-8 rounded-3xl bg-slate-900 text-white overflow-hidden shadow-xl border border-slate-700">
            <h3 className="text-lg font-bold mb-4 text-emerald-400">Diagnostic: Kajian Data Payload</h3>
            <p className="text-xs text-slate-400 mb-2">Total records in memory: {kajianRecords.length}</p>
            <div className="bg-black/50 p-4 rounded-xl max-h-96 overflow-y-auto">
                <pre className="text-[10px] font-mono text-emerald-300">
                    {JSON.stringify(kajianRecords.slice(0, 50), null, 2)}
                </pre>
            </div>
            {kajianRecords.length > 50 && <p className="text-xs text-slate-500 mt-2">Showing first 50 records...</p>}
        </div>
      )}
    </div>
  );
};`;

code = code.replace(anchor, newCode);
fs.writeFileSync('src/components/KajianView.tsx', code);
console.log('Patched diagnostic dump into KajianView.tsx');
