import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add import
import_pattern = r"(import \{ SettingsView \} from '\./components/SettingsView';)"
content = re.sub(import_pattern, r"\1\nimport { KajianView } from './components/KajianView';", content)

# Add route
route = """
            {activeTab === 'kajian' && (
              <KajianView 
                currentUser={currentUser}
                kajianRecords={kajianRecords}
                onSaveKajian={handleSaveKajian}
                accounts={accounts}
              />
            )}
"""
content = re.sub(r"(</motion\.div>)", route + r"\1", content)

with open("src/App.tsx", "w") as f:
    f.write(content)
