with open("src/App.tsx", "r") as f:
    content = f.read()

# Fix unsubHolidays error
if "let unsubHolidays: any;" not in content:
    content = content.replace("    const unsubHolidays = onSnapshot", "    let unsubHolidays: any;\n    unsubHolidays = onSnapshot")

with open("src/App.tsx", "w") as f:
    f.write(content)

with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

# Fix CheckCircle
content = content.replace("import { CheckCircle } from 'lucide-react';\nimport { CheckCircle } from 'lucide-react';", "import { CheckCircle } from 'lucide-react';")
if content.count("import { CheckCircle } from 'lucide-react';") > 1:
    content = content.replace("import { CheckCircle } from 'lucide-react';\n", "", 1)
    
with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)

