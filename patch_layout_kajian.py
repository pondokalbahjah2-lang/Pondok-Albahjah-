import re

with open("src/components/iOSGlassLayout.tsx", "r") as f:
    content = f.read()

# Add BookOpen to lucide imports
import_pattern = r"(import \{\s*[\s\S]*?)(\s*\} from 'lucide-react';)"
content = re.sub(import_pattern, r"\1, BookOpen\2", content)

# Add to admin menu
admin_menu = r"(\{ id: 'kalender', label: 'Kalender Pondok', icon: FileSpreadsheet \},)"
content = re.sub(admin_menu, r"\1\n    { id: 'kajian', label: 'Kajian Buya Yahya', icon: BookOpen },", content, count=1)

# Add to pejuang menu
pejuang_menu = r"(\{ id: 'kalender', label: 'Kalender Pondok', icon: FileSpreadsheet \},)"
content = re.sub(pejuang_menu, r"\1\n    { id: 'kajian', label: 'Kajian Buya Yahya', icon: BookOpen },", content, count=1)

with open("src/components/iOSGlassLayout.tsx", "w") as f:
    f.write(content)
