import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

# Change Maks 9 to Maks 20
content = content.replace("Maks 9", "Maks 20")

# The limit check logic must also be changed. Let's see where 9 is in the code.
# I will use regex to find where 9 is checked for approvers.
