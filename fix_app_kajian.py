with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("<KajianView \n                currentUser={currentUser}", "<KajianView \n                currentUser={currentUser}\n                locationSettings={locationSettings}")

with open("src/App.tsx", "w") as f:
    f.write(content)
