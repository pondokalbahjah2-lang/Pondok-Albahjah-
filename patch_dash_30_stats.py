import re

with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

# Currently we have hadir, sakit, terlambat, izinKeluar from attBulanIni (which is the current month).
# Actually attBulanIni is exactly the current month's attendance!
# Let's just ensure the text says something about 30 days or bulan ini.
# The user specifically said "tambahkan juga Hadir 30 Hari".
# Let's add a stat block for last 30 days present count.

logic_pattern = r"(const hadir = myAttendance\.filter\(\(a\) => a\.date\.startsWith\(currentMonth\) && a\.status === 'Hadir'\)\.length;)"
logic_replacement = r"""\1
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = getLocalDateString(thirtyDaysAgo);
    const hadir30Hari = myAttendance.filter((a) => a.date >= thirtyDaysStr && (a.status === 'Hadir' || a.status === 'Terlambat')).length;
"""
content = re.sub(logic_pattern, logic_replacement, content)

ui_pattern = r"(<div className=\"bg-emerald-50 dark:bg-emerald-900\/20 border border-emerald-100 dark:border-emerald-800\/50 rounded-2xl p-4\">[\s\S]*?<div className=\"text-3xl font-black text-emerald-600 dark:text-emerald-400\">)\{hadir\}(</div>)"
ui_replacement = r"\1{hadir}\2\n            <div className=\"text-[10px] text-emerald-600 mt-1 font-semibold\">\n              {hadir30Hari} Hadir (30 Hari Terakhir)\n            </div>"
content = re.sub(ui_pattern, ui_replacement, content)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
