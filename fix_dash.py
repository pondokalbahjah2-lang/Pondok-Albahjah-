import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

# 1. Remove the misplaced widget
stray_pattern = r"      \{/\* Sisa Cuti Widget \*/\}[\s\S]*?(?=      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">)"
content = re.sub(stray_pattern, "", content, count=1)

# 2. Insert it before the correct grid inside PejuangDashboardAnalytics
# The correct grid is after `return (\n    <div className="space-y-6 mt-6">`
target_pattern = r"(<div className=\"space-y-6 mt-6\">\s*<div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">)"

widget_ui = """<div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-600/20 text-white relative overflow-hidden group mb-6">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
          <CalendarDays className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-amber-100 mb-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Sisa Kuota Cuti Tahunan
          </h3>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-black">{getSisaCutiTahunan}</span>
            <span className="text-sm font-semibold text-amber-200 mb-1">dari {maxCuti} Hari</span>
          </div>
          
          <div className="w-full bg-black/20 rounded-full h-3 mb-2 backdrop-blur-sm overflow-hidden">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${cutiPercent}%` }}
            ></div>
          </div>
          <p className="text-[10px] font-medium text-amber-100">
            {12 - getSisaCutiTahunan} hari telah digunakan tahun ini
          </p>
        </div>
      </div>
      """

content = re.sub(target_pattern, widget_ui + r"\1", content)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
