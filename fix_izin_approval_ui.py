import re

with open("src/components/IzinKeluarView.tsx", "r") as f:
    content = f.read()

buttons_ui = """              <div className="flex space-x-2 mt-4">
                <button
                  type="button"
                  onClick={(e) => handleSubmitApproval(e, true)}
                  className="w-1/3 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Tolak
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmitApproval(e, false)}
                  className="w-2/3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Setujui & Simpan
                </button>
              </div>"""

content = re.sub(r"              <button\n                type=\"submit\"\n                className=\"w-full py-3 mt-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all\"\n              >\n                Setujui & Simpan\n              </button>", buttons_ui, content)

with open("src/components/IzinKeluarView.tsx", "w") as f:
    f.write(content)

