import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, terminate } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  const snapshot = await getDocs(collection(db, "absensi"));
  const docs = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
  
  const today = docs.filter(d => (d as any).date === '2026-09-11');
  console.log("Records on 11th:", today.length);
  console.dir(today, {depth: null});
  
  const yesterday = docs.filter(d => (d as any).date === '2026-09-10');
  console.log("Records on 10th:", yesterday.length);
  
  await terminate(db);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
