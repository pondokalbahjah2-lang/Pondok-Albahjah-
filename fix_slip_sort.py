with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()
content = content.replace("const pejuangAccounts = accounts.filter((a) => a.role === 'Pejuang');", "const pejuangAccounts = accounts.filter((a) => a.role === 'Pejuang').sort((a, b) => a.name.localeCompare(b.name));")
with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)
