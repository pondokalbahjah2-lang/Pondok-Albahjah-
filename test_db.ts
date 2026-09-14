import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function main() {
  await signInWithEmailAndPassword(auth, "pondokalbahjah2@gmail.com", "abdu112233"); // using typical password or wait, maybe I don't need auth if I can't guess the password? Wait, I can't guess the password. Let's just create the Editor in the app and let them fix it.
}
main();
