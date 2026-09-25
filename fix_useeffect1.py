import re
with open("src/App.tsx", "r") as f:
    content = f.read()

# Restore unsubManhaj in first useEffect
content = content.replace("unsubGeneral();\n                };", "unsubGeneral();\n      unsubManhaj();\n                };")

# Remove unused vars in first useEffect
content = content.replace("let unsubHolidays = () => {};\n    let unsubCutiNotif = () => {};\n    let unsubIzinNotif = () => {};\n    // Sync General Settings", "// Sync General Settings")

with open("src/App.tsx", "w") as f:
    f.write(content)
