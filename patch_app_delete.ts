import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `onSaveManhajiyyahClauses={handleSaveManhajiyyahClauses}
                onDeleteAttendanceByMonth={(month) => {
                  const toKeep = attendance.filter(a => !a.date.startsWith(month));
                  const toDelete = attendance.filter(a => a.date.startsWith(month));
                  // Optimistic update
                  setAttendance(toKeep);
                  // Delete from Firestore
                  import('firebase/firestore').then(({ deleteDoc, doc }) => {
                    import('./lib/firebase').then(({ db }) => {
                      toDelete.forEach(async (a) => {
                        try {
                          await deleteDoc(doc(db, 'attendance', a.id));
                        } catch (e) {
                          console.error('Failed to delete', a.id, e);
                        }
                      });
                    });
                  });
                }}`;

content = content.replace("onSaveManhajiyyahClauses={handleSaveManhajiyyahClauses}", replacement);
fs.writeFileSync('src/App.tsx', content);
