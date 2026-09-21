import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
const secondaryApp = initializeApp(firebaseConfig, "Secondary");

export const db = initializeFirestore(
  app,
  { 
    ignoreUndefinedProperties: true,
  },
  firebaseConfig.firestoreDatabaseId
);
export const auth = initializeAuth(app, {
  persistence: [
    browserLocalPersistence,
    browserSessionPersistence,
    inMemoryPersistence,
  ],
});
export const secondaryAuth = initializeAuth(secondaryApp, {
  persistence: [inMemoryPersistence],
});
export const messaging = (() => {
  try {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window) {
      return getMessaging(app);
    }
  } catch (e) {
    console.warn("Firebase messaging is not supported in this environment:", e);
  }
  return null;
})();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  if (operationType === OperationType.WRITE || operationType === OperationType.CREATE || operationType === OperationType.UPDATE || operationType === OperationType.DELETE) {
    // Only alert for user-initiated write actions, not background reads/listeners
    if (!errInfo.error.includes("offline") && !errInfo.error.includes("unavailable")) {
      alert("Gagal menyimpan ke database: " + errInfo.error);
    }
  }
}
