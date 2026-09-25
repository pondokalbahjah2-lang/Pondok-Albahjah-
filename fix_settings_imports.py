import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

content = content.replace("  CheckCircle,", "  CheckCircle,\n  Calendar,\n  X,")

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)
