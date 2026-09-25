import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

# Add states
state_pattern = r"(const \[newNipy, setNewNipy\] = useState\(''\);)"
state_replacement = r"\1\n  const [newSuratKeputusanUrl, setNewSuratKeputusanUrl] = useState('');\n  const [newPkwtStart, setNewPkwtStart] = useState('');\n  const [newPkwtEnd, setNewPkwtEnd] = useState('');"
content = re.sub(state_pattern, state_replacement, content)

# Reset states in handleAddUser
reset_pattern = r"(setNewNipy\(''\);)"
reset_replacement = r"\1\n    setNewSuratKeputusanUrl('');\n    setNewPkwtStart('');\n    setNewPkwtEnd('');"
content = re.sub(reset_pattern, reset_replacement, content)

# Populate states in edit button
edit_pattern = r"(setNewNipy\(acc\.nipy \|\| ''\);)"
edit_replacement = r"\1\n                          setNewSuratKeputusanUrl(acc.suratKeputusanUrl || '');\n                          setNewPkwtStart(acc.pkwtStart || '');\n                          setNewPkwtEnd(acc.pkwtEnd || '');"
content = re.sub(edit_pattern, edit_replacement, content)

# Include in handleAddUser submit
add_submit = r"(amanah: newAmanah,\n\s*nipy: newNipy,)"
add_submit_rep = r"\1\n      suratKeputusanUrl: newSuratKeputusanUrl,\n      pkwtStart: newPkwtStart,\n      pkwtEnd: newPkwtEnd,"
content = re.sub(add_submit, add_submit_rep, content)

# Include in handleEditUser submit
edit_submit = r"(amanah: newAmanah,\n\s*nipy: newNipy\n\s*\};)"
edit_submit_rep = r"amanah: newAmanah,\n          nipy: newNipy,\n          suratKeputusanUrl: newSuratKeputusanUrl,\n          pkwtStart: newPkwtStart,\n          pkwtEnd: newPkwtEnd\n        };"
content = re.sub(edit_submit, edit_submit_rep, content)

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
