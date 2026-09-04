import re

with open("src/components/SuratTeguranView.tsx", "r") as f:
    content = f.read()

# Add gdriveLink state
state_pattern = r"(const \[fileName, setFileName\] = useState\(''\);)"
content = re.sub(state_pattern, r"\1\n  const [gdriveLink, setGdriveLink] = useState('');", content)

# Handle in form submit
submit_pattern = r"(fileUrl: )'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'(,)"
content = re.sub(submit_pattern, r"\1gdriveLink || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'\2", content)

# Reset state
reset_pattern = r"(setFileName\(''\);)"
content = re.sub(reset_pattern, r"\1\n    setGdriveLink('');", content)

# UI addition
ui_pattern = r"(<div>\s*<label className=\"block text-xs font-semibold text-slate-300 mb-1\">\s*Nama Lampiran Berkas File PDF[\s\S]*?</div>)"
new_ui = r"""\1
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link Google Drive Berkas Surat Peringatan
                </label>
                <input
                  type="url"
                  required
                  value={gdriveLink}
                  onChange={(e) => setGdriveLink(e.target.value)}
                  placeholder="Link Google Drive..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>"""
content = re.sub(ui_pattern, new_ui, content)

with open("src/components/SuratTeguranView.tsx", "w") as f:
    f.write(content)
