import re
with open("src/App.tsx", "r") as f:
    content = f.read()

cleanup_start = content.find("unsubSchedules(); unsubLoc(); unsubManhaj();")
if cleanup_start != -1:
    content = content.replace("unsubSchedules(); unsubLoc(); unsubManhaj();", "unsubSchedules(); unsubLoc(); unsubManhaj();\n      unsubHolidays(); unsubCutiNotif(); unsubIzinNotif();")

with open("src/App.tsx", "w") as f:
    f.write(content)
