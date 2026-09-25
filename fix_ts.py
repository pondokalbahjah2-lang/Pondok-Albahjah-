import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("let unsubHolidays: any;\n    unsubHolidays = onSnapshot", "let unsubHolidays = () => {};\n    unsubHolidays = onSnapshot")
with open("src/App.tsx", "w") as f:
    f.write(content)

with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

content = re.sub(r"import\s+\{\s*CheckCircle\s*\}\s+from\s+'lucide-react';\n?", "", content)
content = "import { CheckCircle } from 'lucide-react';\n" + content

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)
