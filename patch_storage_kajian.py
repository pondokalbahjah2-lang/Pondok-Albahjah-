import re

with open("src/utils/storage.ts", "r") as f:
    content = f.read()

# Add KajianRecord to imports
import_pattern = r"(import \{[^}]+)( \} from '\.\./types';)"
content = re.sub(import_pattern, r"\1, KajianRecord\2", content)

kajian_methods = """
  getKajianRecords: (): KajianRecord[] => {
    try {
      const data = localStorage.getItem('ab_kajian_records');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },
  saveKajianRecords: (data: KajianRecord[]) => {
    localStorage.setItem('ab_kajian_records', JSON.stringify(data));
  },
"""

# Insert inside AppStorage object
content = re.sub(r"(const AppStorage = \{)", r"\1\n" + kajian_methods, content)

with open("src/utils/storage.ts", "w") as f:
    f.write(content)
