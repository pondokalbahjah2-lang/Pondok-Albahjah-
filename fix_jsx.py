import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

# Find the widget and the div
pattern = r"(<div className=\"p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-600/20 text-white relative overflow-hidden group mb-6\">[\s\S]*?</div>\s*</div>\s*)<div className=\"space-y-6 mt-6\">\s*(<div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">)"

replacement = r'<div className="space-y-6 mt-6">\n\1\2'

content = re.sub(pattern, replacement, content)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
