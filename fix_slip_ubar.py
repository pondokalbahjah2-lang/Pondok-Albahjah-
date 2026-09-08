with open("src/components/SlipUbarView.tsx", "r") as f:
    content = f.read()

target = """                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">"""

replacement = """                </select>
                {selectedPejuangId && (
                  <div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Target file: Slip_Ubar_{pejuangAccounts.find(p => p.id === selectedPejuangId)?.name.replace(/\\s+/g, '_')}_{periode.replace(/\\s+/g, '')}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">"""

content = content.replace(target, replacement)
content = "import { CheckCircle } from 'lucide-react';\n" + content.replace("import { CheckCircle } from 'lucide-react';\n", "")

with open("src/components/SlipUbarView.tsx", "w") as f:
    f.write(content)
