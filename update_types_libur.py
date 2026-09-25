with open("src/types.ts", "r") as f:
    content = f.read()

content = content.replace("  divisiIds?: string[];", "  divisiIds?: string[];\n  tanggalLibur?: string[];")

with open("src/types.ts", "w") as f:
    f.write(content)
