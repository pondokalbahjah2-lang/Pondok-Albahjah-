import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add KajianRecord to imports
import_pattern = r"(ManhajiyyahClause,)"
content = re.sub(import_pattern, r"\1 KajianRecord,", content)

# Add state
state_pattern = r"(const \[manhajiyyahClauses, setManhajiyyahClauses\] = useState<ManhajiyyahClause\[\]>\(\[\]\);)"
content = re.sub(state_pattern, r"\1\n  const [kajianRecords, setKajianRecords] = useState<KajianRecord[]>([]);", content)

# Add save handler
handler = """
  const handleSaveKajian = (newRecords: KajianRecord[]) => {
    setKajianRecords(newRecords);
    AppStorage.saveKajianRecords(newRecords);
  };
"""
content = re.sub(r"(const handleSaveManhajiyyahClauses =[\s\S]*?;)", r"\1" + handler, content)

# Load data on auth
load_data = r"(setManhajiyyahClauses\(AppStorage\.getManhajiyyahClauses\(\)\);)"
content = re.sub(load_data, r"\1\n      setKajianRecords(AppStorage.getKajianRecords());", content)

with open("src/App.tsx", "w") as f:
    f.write(content)
