import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `onDeleteAttendanceByMonth={async (month) => {
                  const attToKeep = attendance.filter(a => !a.date.startsWith(month));
                  const attToDelete = attendance.filter(a => a.date.startsWith(month));
                  
                  const exToKeep = exitPermissions.filter(e => !e.tanggalKeluar.startsWith(month));
                  const exToDelete = exitPermissions.filter(e => e.tanggalKeluar.startsWith(month));

                  const lvToKeep = leaveRequests.filter(l => !l.tanggalMulai.startsWith(month));
                  const lvToDelete = leaveRequests.filter(l => l.tanggalMulai.startsWith(month));
                  
                  const slToKeep = slipUbarList.filter(s => !s.tanggalUpload.startsWith(month));
                  const slToDelete = slipUbarList.filter(s => s.tanggalUpload.startsWith(month));

                  // Optimistic update
                  setAttendance(attToKeep);
                  setExitPermissions(exToKeep);
                  setLeaveRequests(lvToKeep);
                  setSlipUbarList(slToKeep);

                  // Delete from Firestore in batches (max 500 per batch)
                  try {
                    const allToDelete = [
                      ...attToDelete.map(a => ({ col: 'attendance', id: a.id })),
                      ...exToDelete.map(e => ({ col: 'exitPermissions', id: e.id })),
                      ...lvToDelete.map(l => ({ col: 'leaveRequests', id: l.id })),
                      ...slToDelete.map(s => ({ col: 'slipUbar', id: s.id }))
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
                      \`Admin deleted records for \${month}. Stats: \${attToDelete.length} attendance, \${exToDelete.length} exits, \${lvToDelete.length} leaves, \${slToDelete.length} slip ubar.\`, 
                      currentUser
                    );
                  } catch (e) {
                    console.error('Error deleting batch:', e);
                    handleFirestoreError(e, OperationType.WRITE, 'batchDelete');
                  }
                }}`;

content = content.replace(/onDeleteAttendanceByMonth=\{async \(month\) => \{[\s\S]*?\}\}\n\s*\/>/, replacement + '\n              />');
fs.writeFileSync('src/App.tsx', content);
