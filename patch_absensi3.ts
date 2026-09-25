import fs from 'fs';
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

content = content.replace(
  /<span>Form Presensi Hari Ini<\/span>/,
  `<span>{isClockedOut ? 'Presensi Hari Ini Selesai' : isClockedIn ? 'Form Jam Pulang Hari Ini' : 'Form Presensi Hari Ini'}</span>`
);

content = content.replace(
  /<label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1\.5">\s*Pilih Status Kehadiran\s*<\/label>\s*<div className="grid grid-cols-3 gap-1\.5">\s*\{\(\['Hadir', 'Sakit', 'Libur'\] as const\)\.map\(\(st\) => \([\s\S]*?\}\)\)\}\s*<\/div>/,
  `{!isClockedIn && (
              <>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Pilih Status Kehadiran
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Hadir', 'Sakit', 'Libur'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAttendanceStatus(st)}
                      className={\`py-2 px-3 rounded-xl text-xs font-bold transition-all \${
                        attendanceStatus === st
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }\`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {isClockedIn && !isClockedOut && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  Anda sudah melakukan presensi jam masuk pada <strong>{todayRecord?.time}</strong>.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Silakan ambil swafoto untuk mencatat Jam Pulang Anda.
                </p>
              </div>
            )}
            
            {isClockedOut && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  Presensi Selesai!
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Jam Masuk: <strong>{todayRecord?.time}</strong> | Jam Pulang: <strong>{todayRecord?.timePulang}</strong>
                </p>
              </div>
            )}`
);

content = content.replace(
  /<button\s*type="submit"\s*disabled=\{!photoPreview\}\s*className="w-full[\s\S]*?Simpan Presensi Kehadiran\s*<\/button>/,
  `{!isClockedOut && (
                <button
                  type="submit"
                  disabled={!photoPreview}
                  className={\`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-xl transition-all flex items-center justify-center space-x-2 \${
                    photoPreview
                      ? isClockedIn 
                        ? 'bg-gradient-to-r from-orange-600 to-rose-600 hover:shadow-orange-500/25'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25'
                      : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                  }\`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isClockedIn ? 'Simpan Jam Pulang' : 'Simpan Presensi Kehadiran'}</span>
                </button>
              )}`
);

fs.writeFileSync('src/components/AbsensiView.tsx', content);
