with open("src/components/AbsensiView.tsx", "r") as f:
    content = f.read()
content = content.replace("grid-cols-2 md:grid-cols-4", "grid-cols-2 md:grid-cols-5")
with open("src/components/AbsensiView.tsx", "w") as f:
    f.write(content)
