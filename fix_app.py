with open("src/App.tsx", "r") as f:
    content = f.read()

start_idx = content.find("        }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/location'));")
end_idx = content.find("    // Sync Cuti Notifications")

if start_idx != -1 and end_idx != -1:
    end_of_loc = start_idx + len("        }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/location'));")
    # replace what's between end_of_loc and end_idx with just newlines
    content = content[:end_of_loc] + "\n\n" + content[end_idx:]

with open("src/App.tsx", "w") as f:
    f.write(content)
