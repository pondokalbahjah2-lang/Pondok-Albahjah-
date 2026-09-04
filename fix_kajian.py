import re

# Fix App.tsx
with open("src/App.tsx", "r") as f:
    app = f.read()

# The incorrect injection:
bad_code = """  const handleSaveManhajiyyahClauses = async (cls: typeof manhajiyyahClauses) => {
    setManhajiyyahClauses(cls);
  const handleSaveKajian = (newRecords: KajianRecord[]) => {
    setKajianRecords(newRecords);
    AppStorage.saveKajianRecords(newRecords);
  };"""

fixed_code = """  const handleSaveKajian = (newRecords: KajianRecord[]) => {
    setKajianRecords(newRecords);
    AppStorage.saveKajianRecords(newRecords);
  };

  const handleSaveManhajiyyahClauses = async (cls: typeof manhajiyyahClauses) => {
    setManhajiyyahClauses(cls);"""

app = app.replace(bad_code, fixed_code)
with open("src/App.tsx", "w") as f:
    f.write(app)


# Fix iOSGlassLayout.tsx duplicate keys
with open("src/components/iOSGlassLayout.tsx", "r") as f:
    layout = f.read()

# Just filter out all occurrences and add them back properly
import sys

lines = layout.split('\n')
new_lines = []
for line in lines:
    if "id: 'kajian'" in line and "Kajian Buya Yahya" in line:
        continue
    new_lines.append(line)

layout = '\n'.join(new_lines)

# Now add one to the admin menu and one to user menu
admin_target = r"(\{ id: 'kalender', label: 'Kalender Pondok', icon: FileSpreadsheet \},)"
layout = re.sub(admin_target, r"\1\n    { id: 'kajian', label: 'Kajian Buya Yahya', icon: BookOpen },", layout)

with open("src/components/iOSGlassLayout.tsx", "w") as f:
    f.write(layout)
