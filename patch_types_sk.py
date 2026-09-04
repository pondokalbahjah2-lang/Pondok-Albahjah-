import re

with open("src/types.ts", "r") as f:
    content = f.read()

# Add SK and PKWT fields to UserAccount
user_account_pattern = r"(passwordLastUpdated\?: string;)"
user_account_replacement = r"\1\n  suratKeputusanUrl?: string;\n  pkwtStart?: string;\n  pkwtEnd?: string;"
content = re.sub(user_account_pattern, user_account_replacement, content)

with open("src/types.ts", "w") as f:
    f.write(content)
