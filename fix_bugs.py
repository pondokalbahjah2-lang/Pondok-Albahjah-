import re

# 1. Fix duplicate key in iOSGlassLayout
with open("src/components/iOSGlassLayout.tsx", "r") as f:
    layout = f.read()

# Remove the duplicated `{ id: 'kajian', label: 'Kajian Buya Yahya', icon: BookOpen },`
# and ensure it's in userNavigationItems as well.
layout = layout.replace("    { id: 'kajian', label: 'Kajian Buya Yahya', icon: BookOpen },\n    { id: 'kajian', label: 'Kajian Buya Yahya', icon: BookOpen },", "    { id: 'kajian', label: 'Kajian Buya Yahya', icon: BookOpen },")

# Insert it into userNavigationItems before laporan/settings (specifically after kalender)
user_nav_target = r"(\{ id: 'kalender', label: 'Kalender Pondok', icon: FileSpreadsheet \},)"
if "{ id: 'kajian'" not in layout.split("userNavigationItems")[1]:
    layout = re.sub(user_nav_target, r"\1\n    { id: 'kajian', label: 'Kajian Buya Yahya', icon: BookOpen },", layout)

with open("src/components/iOSGlassLayout.tsx", "w") as f:
    f.write(layout)

# 2. Fix DashboardView Error
with open("src/components/DashboardView.tsx", "r") as f:
    dash = f.read()

# Remove the 30 Days Chart from where it was placed (first grid)
chart_ui_pattern = r"\s*\{/\* 30 Days Chart \*/\}[\s\S]*?(?=\s*\{/\* Bar Chart: Weekly Attendance Trends \(Current Month\) \*/\})"
dash = re.sub(chart_ui_pattern, "\n        ", dash)

# And place it correctly in PejuangDashboardAnalytics, right after its grid definition.
# Wait, I need to find PejuangDashboardAnalytics' grid.
# PejuangDashboardAnalytics has `return (\n    <div className="space-y-6 mt-6">\n      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">` but the widget is also there.
# Let's see how PejuangDashboardAnalytics looks.
