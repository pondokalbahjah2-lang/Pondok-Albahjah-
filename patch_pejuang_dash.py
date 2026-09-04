import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

# Add getSisaCutiTahunan logic for Pejuang
get_sisa = """
  // Leave quota calculation
  const getSisaCutiTahunan = React.useMemo(() => {
    const currentYearStr = new Date().getFullYear().toString();
    const used = leaveRequests
      .filter(l => l.pejuangId === currentUser.id && l.jenisCuti === 'Cuti Tahunan' && (l.status === 'Disetujui' || l.status === 'Selesai' || l.status === 'Sedang Cuti') && l.tanggalMulai.startsWith(currentYearStr))
      .reduce((acc, curr) => acc + curr.totalHari, 0);
    return Math.max(0, 12 - used);
  }, [leaveRequests, currentUser.id]);

  const maxCuti = 12;
  const cutiPercent = Math.min(100, Math.round((getSisaCutiTahunan / maxCuti) * 100));
"""

# Find where to inject in PejuangDashboardAnalytics
# It starts with: const PejuangDashboardAnalytics = ...
#  const last7DaysData = React.useMemo(() => {

pattern = r"(const last7DaysData = React\.useMemo\(\(\) => \{)"

content = re.sub(pattern, get_sisa + r"\n  \1", content, count=1)

widget_ui = """
      {/* Sisa Cuti Widget */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-600/20 text-white relative overflow-hidden group">
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

# Insert widget before the grid of charts
grid_pattern = r"(<div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">)"
content = re.sub(grid_pattern, widget_ui + r"\n      \1", content, count=1)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
