import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { 
  initializeFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  where,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress noisy connectivity warnings in the console
setLogLevel('error');

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Error handler for Firestore
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    // Use getDoc which respects cache and is less likely to trigger timeout logs
    await getDoc(doc(db, 'test', 'connection'));
    console.log("✅ Firestore initialized (Cache/Network).");
  } catch (error) {
    if(error instanceof Error) {
      if (error.message.includes('the client is offline') || error.message.includes('Backend didn\'t respond')) {
        console.warn("⚠️ Firestore is in offline mode or taking longer than expected to connect. This is often due to network latency in the preview environment. The client will automatically sync once the connection is stable.");
      } else if (error.message.includes('Missing or insufficient permissions')) {
        console.error("❌ Firestore Permission Denied: Please check your security rules.");
      } else {
        console.error("❌ Firestore Connection Error:", error.message);
      }
    }
  }
}
// Test connection after a short delay
setTimeout(() => {
  testConnection();
}, 2000);

export { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  getDocs,
  where,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL
};
