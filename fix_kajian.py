import re

with open("src/components/KajianView.tsx", "r") as f:
    content = f.read()

content = content.replace("{mode === 'Offline' && (\n              <div className=\"p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl\">", "{mode === 'Offline' && (\n              <>\n              <div className=\"p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl\">")

content = content.replace("</div>\n              )}\n            )}", "</div>\n              )}\n              </>\n            )}")

with open("src/components/KajianView.tsx", "w") as f:
    f.write(content)
