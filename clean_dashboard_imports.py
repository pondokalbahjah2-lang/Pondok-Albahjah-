with open("src/components/DashboardView.tsx", "r") as f:
    lines = f.readlines()

out = []
for line in lines:
    if line.startswith("import { FileText, Calendar,"):
        line = line.replace("import { FileText, Calendar, ", "import { ")
        line = line.replace("import { FileText, Calendar,", "import { ")
    
    out.append(line)

with open("src/components/DashboardView.tsx", "w") as f:
    f.writelines(out)

