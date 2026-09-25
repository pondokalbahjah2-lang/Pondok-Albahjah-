import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  const snap = await getDocs(collection(db, "users"));
  snap.forEach(d => {
    const data = d.data();
    if (data.id !== d.id) {
      console.log(`Mismatch: doc.id = ${d.id}, data.id = ${data.id}`);
    }
  });
  console.log("Done");
  process.exit(0);
}
check();
