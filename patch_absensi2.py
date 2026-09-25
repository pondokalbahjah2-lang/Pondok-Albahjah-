import re

with open("src/components/AbsensiView.tsx", "r") as f:
    content = f.read()

replacement = """      const jamPulang = userSchedule?.customJamKerja?.[currDay]?.pulang || userSchedule?.jamPulang || "16:00";"""

content = re.sub(
    r"      const jamPulang = userSchedule\?\.customJamKerja\?\.\[currDay\]\?\.pulang \|\| jamPulang;",
    replacement,
    content
)

with open("src/components/AbsensiView.tsx", "w") as f:
    f.write(content)
