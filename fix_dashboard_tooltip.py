import re
with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

target = """          <div className="w-full bg-black/20 rounded-full h-3 mb-2 backdrop-blur-sm overflow-hidden">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${cutiPercent}%` }}
            ></div>
          </div>"""

replacement = """          <div 
            className="w-full bg-black/20 rounded-full h-3 mb-2 backdrop-blur-sm overflow-hidden group/tooltip relative cursor-help"
            title={`${12 - getSisaCutiTahunan} hari terpakai dari total 12 hari`}
          >
            <div 
              className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${cutiPercent}%` }}
            ></div>
          </div>"""

content = content.replace(target, replacement)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
