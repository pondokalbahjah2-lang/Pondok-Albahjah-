with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

group_type = """                    <option value="Divisi">Berdasarkan Divisi</option>
                    <option value="Individu">Perorangan (Individu)</option>
                    <option value="Group">Group (Beberapa Pejuang/Divisi)</option>"""

content = content.replace("""                    <option value="Divisi">Berdasarkan Divisi</option>
                    <option value="Individu">Perorangan (Individu)</option>""", group_type)

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
