with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

content = content.replace("import { CheckCircle } from 'lucide-react';\n", "", 1)

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)
