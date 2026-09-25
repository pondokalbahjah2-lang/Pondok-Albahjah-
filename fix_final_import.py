with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

content = content.replace("import { \n  X,", "import { \n  FileText,\n  Calendar,\n  X,")
with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
