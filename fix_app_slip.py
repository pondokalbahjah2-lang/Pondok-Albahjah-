with open("src/App.tsx", "r") as f:
    content = f.read()

delete_all_fn = """  const handleDeleteAllSlipUbar = async () => {
    setSlipUbarList([]);
    if (currentUser?.role === 'Admin') {
      try {
        const snapshot = await getDocs(collection(db, 'slipUbar'));
        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        await logAudit('DELETE_ALL_SLIP', 'Admin deleted all slip ubar documents', currentUser);
      } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'slipUbar'); }
    }
  };"""

idx = content.find("const handleSaveSlipUbar")
content = content[:idx] + delete_all_fn + "\n\n  " + content[idx:]

content = content.replace("onSaveSlipUbar={handleSaveSlipUbar}", "onSaveSlipUbar={handleSaveSlipUbar}\n                onDeleteAllSlipUbar={handleDeleteAllSlipUbar}")

with open("src/App.tsx", "w") as f:
    f.write(content)
