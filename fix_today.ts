import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  const snapshot = await getDocs(collection(db, "attendance"));
  let updated = 0;
  for (const d of snapshot.docs) {
    const data = d.data();
    if (data.date === '2026-09-11' && data.status === 'Hadir') {
      // Let's check time - if it's early morning, it shouldn't be counted as today?
      // Wait, the logic error made today's records (11th) get recorded as 11th if they were after 9AM or whatever?
      // "banyak pejuang absen hari ini malah tercatat absen di tanggal 11" 
      // Today is the 11th. So it was recorded as 11th. But the user thinks it SHOULD have been 12th? No, local time is 2026-09-11 17:45. "Absen hari ini malah tercatat absen di tanggal 11" wait, today IS 11.
      // Ah. If they do morning shift on 12th? No, local time is 11th 17:45.
      // Wait, maybe the user meant "tercatat absen di tanggal 10" ?
      // "absen hari ini malah tercatat absen di tanggal 11" - maybe today is 12th in Indonesia? 
      // Current time is 2026-09-11T17:45:23-07:00 (Pacific Time). In Indonesia (UTC+7), it is currently 14 hours ahead, so it is 07:45 AM on September 12th.
      // Ah!!! Yes! It is 07:45 AM on September 12th in Indonesia. 
      // Because `d.getHours() < 9` logic, a check-in at 07:45 AM was being shifted back to September 11th!
      // So the records that are on Sept 11th with time ~06:00 - 08:59 should actually be on Sept 12th!
      
      const [h, m] = data.time.split(':').map(Number);
      // Wait, local time is 07:45. Let's fix the ones with time between 05:00 and 08:59 that were recorded as 2026-09-11.
      // Actually they might be recorded as '2026-09-10' if they were yesterday.
      // Let's print them first.
      console.log(d.id, data.date, data.time, data.pejuangName);
    }
  }
}
main().catch(console.error);
