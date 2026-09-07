with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

content = content.replace("    let hadir = 0;\n    let terlambat = 0;\n    let sakit = 0;", "    let hadir = 0;\n    let terlambat = 0;\n    let sakit = 0;\n    let izin = 0;")

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
