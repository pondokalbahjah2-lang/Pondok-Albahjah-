import re

with open("src/App.tsx", "r") as f:
    app = f.read()

target = r"(<SuratTeguranView\s*currentUser=\{currentUser\}\s*accounts=\{accounts\}\s*warningLetters=\{warningLetters\}\s*onSaveWarningLetters=\{handleSaveWarningLetters\})"
app = re.sub(target, r"\1\n                onUpdateAccount={(updatedAcc) => {\n                  const newAccounts = accounts.map(a => a.id === updatedAcc.id ? updatedAcc : a);\n                  setAccounts(newAccounts);\n                  AppStorage.saveAccounts(newAccounts);\n                }}", app)

with open("src/App.tsx", "w") as f:
    f.write(app)

with open("src/components/SuratTeguranView.tsx", "r") as f:
    sp = f.read()

sp = sp.replace("interface SuratTeguranViewProps {\n  currentUser: UserAccount;\n  accounts: UserAccount[];\n  warningLetters: WarningLetterRecord[];\n  onSaveWarningLetters: (records: WarningLetterRecord[]) => void;\n}", "interface SuratTeguranViewProps {\n  currentUser: UserAccount;\n  accounts: UserAccount[];\n  warningLetters: WarningLetterRecord[];\n  onSaveWarningLetters: (records: WarningLetterRecord[]) => void;\n  onUpdateAccount?: (acc: UserAccount) => void;\n}")

sp = sp.replace("export const SuratTeguranView: React.FC<SuratTeguranViewProps> = ({ currentUser, accounts, warningLetters, onSaveWarningLetters }) => {", "export const SuratTeguranView: React.FC<SuratTeguranViewProps> = ({ currentUser, accounts, warningLetters, onSaveWarningLetters, onUpdateAccount }) => {")

with open("src/components/SuratTeguranView.tsx", "w") as f:
    f.write(sp)

