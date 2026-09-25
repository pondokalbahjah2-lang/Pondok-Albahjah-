import re

with open("src/components/LaporanView.tsx", "r") as f:
    content = f.read()

# Make sure getLogicalAttendanceDateStr is imported
if "getLogicalAttendanceDateStr" not in content:
    content = content.replace(
        "import { getLocalDateString } from '../utils/dateUtils';",
        "import { getLocalDateString, getLogicalAttendanceDateStr } from '../utils/dateUtils';"
    )

# The logic in LaporanView needs to use the specific user's logical date
# Let's replace `a.date < getLocalDateString()` with `a.date < getLogicalAttendanceDateStr(accounts.find(u => u.id === a.pejuangId))`

pattern = r"a\.date < getLocalDateString\(\)"
replacement = r"a.date < getLogicalAttendanceDateStr(accounts.find(u => u.id === a.pejuangId))"

content = re.sub(pattern, replacement, content)

with open("src/components/LaporanView.tsx", "w") as f:
    f.write(content)
