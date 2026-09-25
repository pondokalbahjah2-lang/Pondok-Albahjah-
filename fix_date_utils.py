with open("src/utils/dateUtils.ts", "r") as f:
    content = f.read()

new_logic = """export const getLogicalAttendanceDateStr = (user?: UserAccount, d: Date = new Date()) => {
  if (user) {
    const isNightShift = user.subDivisi.includes('Banat') || 
                         user.subDivisi.includes('SDIQu') || 
                         user.subDivisi.includes('SMPIQu') || 
                         user.subDivisi.includes('SMAIQu');
    
    // If it's a night shift and the time is before 09:00 AM (giving some buffer after 07:00), 
    // it counts as the previous day's shift
    if (isNightShift && d.getHours() < 9) {
      const prevDate = new Date(d);
      prevDate.setDate(prevDate.getDate() - 1);
      return getLocalDateString(prevDate);
    }
  }
  return getLocalDateString(d);
};"""

# Replace the old getLogicalAttendanceDateStr
import re
content = re.sub(r"export const getLogicalAttendanceDateStr = .*?;\n\};\n?", new_logic + "\n", content, flags=re.DOTALL)

with open("src/utils/dateUtils.ts", "w") as f:
    f.write(content)
