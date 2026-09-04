import re

with open("src/components/AbsensiView.tsx", "r") as f:
    content = f.read()

# Make sure getLogicalAttendanceDateStr is imported
if "getLogicalAttendanceDateStr" not in content:
    content = content.replace(
        "import { getLocalDateString } from '../utils/dateUtils';",
        "import { getLocalDateString, getLogicalAttendanceDateStr } from '../utils/dateUtils';"
    )

# Replace todayDateStr initialization
pattern = r"const todayDateStr = getLocalDateString\(new Date\(\)\);"
content = re.sub(pattern, "const todayDateStr = getLogicalAttendanceDateStr(currentUser, new Date());", content)

with open("src/components/AbsensiView.tsx", "w") as f:
    f.write(content)
