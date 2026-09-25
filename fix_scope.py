with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("    let unsubUsers = () => {};", "    let unsubHolidays = () => {};\n    let unsubCutiNotif = () => {};\n    let unsubIzinNotif = () => {};\n    let unsubUsers = () => {};")

# Also, the first useEffect might have undefined variables in its cleanup if they were moved.
# Let's check the first useEffect's cleanup.
cleanup_start = content.find("unsubGeneral();")
if cleanup_start != -1:
    cleanup_end = content.find("};", cleanup_start)
    first_cleanup = content[cleanup_start:cleanup_end]
    new_first_cleanup = first_cleanup.replace("unsubHolidays();", "").replace("unsubCutiNotif();", "").replace("unsubIzinNotif();", "").replace("unsubManhaj();", "")
    content = content[:cleanup_start] + new_first_cleanup + content[cleanup_end:]
    
with open("src/App.tsx", "w") as f:
    f.write(content)
