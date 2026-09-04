with open("src/App.tsx", "r") as f:
    content = f.read()

target = """                onDeleteAttendanceByMonth={async (month) => {"""

replacement = """                onPurgeOldData={async () => {
                  try {
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                    const limitDateStr = threeMonthsAgo.toISOString().split('T')[0];

                    const attToKeep = attendance.filter(a => a.date >= limitDateStr);
                    const attToDelete = attendance.filter(a => a.date < limitDateStr);
                    
                    const exToKeep = exitPermissions.filter(e => e.tanggalKeluar >= limitDateStr);
                    const exToDelete = exitPermissions.filter(e => e.tanggalKeluar < limitDateStr);
                    
                    const lvToKeep = leaveRequests.filter(l => l.tanggalMulai >= limitDateStr);
                    const lvToDelete = leaveRequests.filter(l => l.tanggalMulai < limitDateStr);
                    
                    const slToKeep = slipUbarList.filter(s => s.tanggalUpload >= limitDateStr);
                    const slToDelete = slipUbarList.filter(s => s.tanggalUpload < limitDateStr);

                    // Fetch old auditLogs
                    const auditLogsSnapshot = await getDocs(query(collection(db, 'auditLogs'), where('timestamp', '<', threeMonthsAgo.toISOString())));
                    const auditLogsToDelete = auditLogsSnapshot.docs.map(d => ({ col: 'auditLogs', id: d.id }));

                    setAttendance(attToKeep);
                    setExitPermissions(exToKeep);
                    setLeaveRequests(lvToKeep);
                    setSlipUbarList(slToKeep);

                    const allToDelete = [
                      ...attToDelete.map(a => ({ col: 'attendance', id: a.id })),
                      ...exToDelete.map(e => ({ col: 'exitPermissions', id: e.id })),
                      ...lvToDelete.map(l => ({ col: 'leaveRequests', id: l.id })),
                      ...slToDelete.map(s => ({ col: 'slipUbar', id: s.id })),
                      ...auditLogsToDelete
                    ];

                    const batches = [];
                    let currentBatch = writeBatch(db);
                    let count = 0;
                    for (const item of allToDelete) {
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

                    await logAudit(
                      'PURGE_OLD_DATA',
                      `Admin purged data older than 3 months. Stats: ${attToDelete.length} attendance, ${exToDelete.length} exits, ${lvToDelete.length} leaves, ${slToDelete.length} slips, ${auditLogsToDelete.length} logs.`,
                      currentUser
                    );
                    alert('Berhasil membersihkan data residu yang usianya lebih dari 3 bulan.');
                  } catch (e) {
                    console.error('Error purging data:', e);
                    handleFirestoreError(e, OperationType.WRITE, 'batchDelete');
                  }
                }}
                onDeleteAttendanceByMonth={async (month) => {"""

with open("src/App.tsx", "w") as f:
    f.write(content.replace(target, replacement))
