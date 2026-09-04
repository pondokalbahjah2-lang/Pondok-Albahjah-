import re

with open("src/components/CutiView.tsx", "r") as f:
    content = f.read()

content = content.replace('\\"', '"')

with open("src/components/CutiView.tsx", "w") as f:
    f.write(content)
