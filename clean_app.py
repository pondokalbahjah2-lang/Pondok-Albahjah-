import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Remove the duplicated blocks starting from line 312:
duplicate_start_idx = content.find("unsubHolidays = onSnapshot(collection(db, 'holidays')", 1000) # second occurrence
if duplicate_start_idx != -1:
    duplicate_end_idx = content.find("let firstManhajLoad = true;", duplicate_start_idx)
    if duplicate_end_idx != -1:
        # replace the duplicate block
        content = content[:duplicate_start_idx] + content[duplicate_end_idx:]

with open("src/App.tsx", "w") as f:
    f.write(content)
