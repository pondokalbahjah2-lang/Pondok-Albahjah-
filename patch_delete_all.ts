import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /onDeleteAttendanceByMonth=\{\(month\) => \{[\s\S]*?\}\}\n\s*\/>/;

const replacement = `onDeleteAttendanceByMonth={(month) => {
                  const attToKeep = attendance.filter(a => !a.date.startsWith(month));
                  const attToDelete = attendance.filter(a => a.date.startsWith(month));
                  
                  const exToKeep = exitPermissions.filter(e => !e.tanggalKeluar.startsWith(month));
                  const exToDelete = exitPermissions.filter(e => e.tanggalKeluar.startsWith(month));

                  const lvToKeep = leaveRequests.filter(l => !l.tanggalMulai.startsWith(month));
                  const lvToDelete = leaveRequests.filter(l => l.tanggalMulai.startsWith(month));

                  // Optimistic update
                  setAttendance(attToKeep);
                  setExitPermissions(exToKeep);
                  setLeaveRequests(lvToKeep);

                  // Delete from Firestore
                  import('firebase/firestore').then(({ deleteDoc, doc }) => {
                    import('./utils/firebase').then(({ db }) => {
                      attToDelete.forEach(async (a) => await deleteDoc(doc(db, 'attendance', a.id)).catch(console.error));
                      exToDelete.forEach(async (e) => await deleteDoc(doc(db, 'exitPermissions', e.id)).catch(console.error));
                      lvToDelete.forEach(async (l) => await deleteDoc(doc(db, 'leaveRequests', l.id)).catch(console.error));
                    });
                  });
                }}
              />`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
