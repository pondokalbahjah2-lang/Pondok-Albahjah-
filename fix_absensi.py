import re
with open("src/components/AbsensiView.tsx", "r") as f:
    content = f.read()

content = content.replace("const [attendanceStatus, setAttendanceStatus] = useState<'Hadir' | 'Sakit' | 'Libur' | 'Pulang'>('Hadir');", "const [attendanceStatus, setAttendanceStatus] = useState<'Hadir' | 'Sakit' | 'Libur' | 'Pulang' | 'Izin tidak masuk'>('Hadir');")

content = content.replace("if (attendanceStatus !== 'Sakit' && attendanceStatus !== 'Libur' && !isWithinRadius && currentUser.role === 'Pejuang') {", "if (attendanceStatus !== 'Sakit' && attendanceStatus !== 'Libur' && attendanceStatus !== 'Izin tidak masuk' && !isWithinRadius && currentUser.role === 'Pejuang') {")

content = content.replace("if (attendanceStatus !== 'Libur' && attendanceStatus !== 'Sakit') {", "if (attendanceStatus !== 'Libur' && attendanceStatus !== 'Sakit' && attendanceStatus !== 'Izin tidak masuk') {")

content = content.replace("const uncompletedPastRecord = myAttendance.find(a => a.pejuangId === currentUser.id && a.date !== todayDateStr && !a.timePulang && a.status !== 'Sakit' && a.status !== 'Libur' && a.status !== 'Cuti');", "const uncompletedPastRecord = myAttendance.find(a => a.pejuangId === currentUser.id && a.date !== todayDateStr && !a.timePulang && a.status !== 'Sakit' && a.status !== 'Libur' && a.status !== 'Izin tidak masuk' && a.status !== 'Cuti');")

content = content.replace("const isClockedOut = !!(todayRecord && (todayRecord.timePulang || todayRecord.status === 'Sakit' || todayRecord.status === 'Libur' || todayRecord.status === 'Cuti'));", "const isClockedOut = !!(todayRecord && (todayRecord.timePulang || todayRecord.status === 'Sakit' || todayRecord.status === 'Libur' || todayRecord.status === 'Izin tidak masuk' || todayRecord.status === 'Cuti'));")


ui_target = """                {['Hadir', 'Sakit', 'Libur', 'Pulang'].map((st: any) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAttendanceStatus(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      attendanceStatus === st
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'Pulang' ? 'Pulang' : st}
                  </button>
                ))}"""

ui_replacement = """                {['Hadir', 'Sakit', 'Libur', 'Izin tidak masuk', 'Pulang'].map((st: any) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAttendanceStatus(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      attendanceStatus === st
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'Pulang' ? 'Pulang' : st}
                  </button>
                ))}"""
content = content.replace(ui_target, ui_replacement)

ui_status_table = """                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            rec.status === 'Hadir'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                              : rec.status === 'Terlambat'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                              : 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
                          }`}
                        >
                          {rec.status}
                        </span>"""

ui_status_table_replacement = """                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            rec.status === 'Hadir'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                              : rec.status === 'Terlambat'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                              : rec.status === 'Izin tidak masuk'
                              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300'
                              : 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
                          }`}
                        >
                          {rec.status}
                        </span>"""
content = content.replace(ui_status_table, ui_status_table_replacement)


with open("src/components/AbsensiView.tsx", "w") as f:
    f.write(content)
