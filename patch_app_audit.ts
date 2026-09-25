import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `onDeleteAttendanceByMonth={async (month) => {
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

                  // Delete from Firestore in batches (max 500 per batch)
                  try {
                    const allToDelete = [
                      ...attToDelete.map(a => ({ col: 'attendance', id: a.id })),
                      ...exToDelete.map(e => ({ col: 'exitPermissions', id: e.id })),
                      ...lvToDelete.map(l => ({ col: 'leaveRequests', id: l.id }))
                    ];

                    const batches = [];
                    let currentBatch = writeBatch(db);
                    let count = 0;

                    for (const item of allToDelete) {
                      console.log(\`[Audit] Queueing deletion for \${item.col} document with ID \${item.id}\`);
                      // Check if doc exists before deleting if we were doing single deletes, but writeBatch.delete is safe even if doc doesn't exist
                      currentBatch.delete(doc(db, item.col, item.id));
                      count++;
                      if (count === 500) {
                        batches.push(currentBatch.commit());
                        currentBatch = writeBatch(db);
                        count = 0;
                      }
                    }
                    if (count > 0) {
                      batches.push(currentBatch.commit());
                    }

                    await Promise.all(batches);
                    
                    console.log(\`[Audit] Batch deletion completed for month \${month}.\`);
                    
                    // Add an audit log entry for this major action
                    await logAudit(
                      'DELETE_MONTHLY_RECORDS', 
                      \`Admin deleted records for \${month}. Stats: \${attToDelete.length} attendance, \${exToDelete.length} exits, \${lvToDelete.length} leaves.\`, 
                      currentUser
                    );
                  } catch (e) {
                    console.error('Error deleting batch:', e);
                    handleFirestoreError(e, OperationType.WRITE, 'batchDelete');
                  }
                }}`;

content = content.replace(/onDeleteAttendanceByMonth=\{async \(month\) => \{[\s\S]*?\}\}\n\s*\/>/, replacement + '\n              />');

// Let's also add audit logs to schedules and manhajiyyah clauses deletions
content = content.replace(
  /for \(const a of deleted\) await deleteDoc\(doc\(db, 'schedules', a\.id\)\);\n\s*\} catch/,
  `for (const a of deleted) {
          console.log(\`[Audit] Deleting schedule document with ID \${a.id}\`);
          await deleteDoc(doc(db, 'schedules', a.id));
        }
        if (deleted.length > 0 || addedOrUpdated.length > 0) {
          await logAudit('UPDATE_SCHEDULES', \`Admin updated/deleted schedules. Added/Updated: \${addedOrUpdated.length}, Deleted: \${deleted.length}\`, currentUser);
        }
      } catch`
);

content = content.replace(
  /for \(const a of deleted\) await deleteDoc\(doc\(db, 'manhajiyyahClauses', a\.id\)\);\n\s*\} catch/,
  `for (const a of deleted) {
          console.log(\`[Audit] Deleting manhajiyyah clause document with ID \${a.id}\`);
          await deleteDoc(doc(db, 'manhajiyyahClauses', a.id));
        }
        if (deleted.length > 0 || addedOrUpdated.length > 0) {
          await logAudit('UPDATE_CLAUSES', \`Admin updated/deleted clauses. Added/Updated: \${addedOrUpdated.length}, Deleted: \${deleted.length}\`, currentUser);
        }
      } catch`
);

fs.writeFileSync('src/App.tsx', content);
