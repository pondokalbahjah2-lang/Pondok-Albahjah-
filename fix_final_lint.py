import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Make sure unsubs are declared at the top of the useEffect
content = content.replace("    // Sync General Settings", "    let unsubHolidays = () => {};\n    let unsubCutiNotif = () => {};\n    let unsubIzinNotif = () => {};\n    // Sync General Settings")
content = content.replace("let unsubHolidays = () => {};\n    unsubHolidays = onSnapshot", "unsubHolidays = onSnapshot")
content = content.replace("const unsubCutiNotif = onSnapshot", "unsubCutiNotif = onSnapshot")
content = content.replace("const unsubIzinNotif = onSnapshot", "unsubIzinNotif = onSnapshot")

with open("src/App.tsx", "w") as f:
    f.write(content)

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

if "Calendar" not in content[:500]:
    content = content.replace("import { Plus } from 'lucide-react';", "import { Plus, Calendar, X } from 'lucide-react';")

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)

with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

content = re.sub(r"import\s+\{\s*CheckCircle\s*\}\s+from\s+'lucide-react';\n?", "", content)
content = "import { CheckCircle } from 'lucide-react';\n" + content

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)

