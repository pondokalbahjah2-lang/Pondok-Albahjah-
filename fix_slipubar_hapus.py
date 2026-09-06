import re

with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

# Add Delete to header
content = content.replace('<th className="py-2.5 px-3 text-right">Unduh Dokumen</th>', '<th className="py-2.5 px-3 text-right">Unduh Dokumen</th>\n                {currentUser.role === \'Admin\' && <th className="py-2.5 px-3 text-right">Aksi</th>}')

# Add Delete to body
target_td = """<td className="py-3 px-3 text-right flex justify-end gap-2">
                      {slip.filePassword && ("""
replacement_td = """<td className="py-3 px-3 text-right flex justify-end gap-2">
                      {slip.filePassword && ("""
                      
target_tr_end = """<a href={slip.fileUrl} target="_blank" rel="noreferrer" className="py-1.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-[11px]">
                        <Download className="w-3.5 h-3.5 inline mr-1" /> Buka
                      </a>
                    </td>"""
replacement_tr_end = """<a href={slip.fileUrl} target="_blank" rel="noreferrer" className="py-1.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-[11px]">
                        <Download className="w-3.5 h-3.5 inline mr-1" /> Buka
                      </a>
                    </td>
                    {currentUser.role === 'Admin' && (
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Yakin ingin menghapus dokumen ini?')) {
                              onSaveSlipUbar(slips.filter(s => s.id !== slip.id));
                            }
                          }}
                          className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px]"
                        >
                          Hapus
                        </button>
                      </td>
                    )}"""
content = content.replace(target_tr_end, replacement_tr_end)

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)

