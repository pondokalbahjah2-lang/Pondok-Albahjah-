import re

with open("src/components/KajianView.tsx", "r") as f:
    content = f.read()

# 1. Add imports
if "LocationMap" not in content:
    content = content.replace("import { BookOpen, MapPin, Search, Download, AlertTriangle } from 'lucide-react';", "import { BookOpen, MapPin, Search, Download, AlertTriangle } from 'lucide-react';\nimport { LocationMap } from './LocationMap';")

# 2. Find where the button is and add the map after it
target = r"(<button\s*type=\"button\"\s*onClick=\{getLocation\}[\s\S]*?</button>\s*</div>)"

new_ui = """\\1
              {currentLat && currentLng && (
                <div className="mt-2 relative z-0 h-48 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <LocationMap 
                    userLat={currentLat}
                    userLng={currentLng}
                    pondokLat={-6.758801}
                    pondokLng={108.472935}
                    radius={100}
                  />
                </div>
              )}"""

content = re.sub(target, new_ui, content)

with open("src/components/KajianView.tsx", "w") as f:
    f.write(content)
