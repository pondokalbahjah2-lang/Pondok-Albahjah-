with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("unsubHolidays();\n      unsubCutiNotif();\n      unsubIzinNotif();", "")

with open("src/App.tsx", "w") as f:
    f.write(content)
