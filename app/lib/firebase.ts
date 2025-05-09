// Firebase configuration
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your Firebase configuration
// Replace with your actual Firebase config when deploying
const firebaseConfig = {
  apiKey: "AIzaSyCOUJcwSqZrisPcjKuON-wTjgxLfuffWl8",
  authDomain: "advertiser-genius.firebaseapp.com",
  projectId: "advertiser-genius",
  storageBucket: "advertiser-genius.firebasestorage.app",
  messagingSenderId: "766215368979",
  appId: "1:766215368979:web:acd2f836ee3f8102576ae6",
  measurementId: "G-WX8MLWWS2F"
};


// Initialize Firebase
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

if (typeof window !== "undefined" && !getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
} else if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
} else {
  firebaseApp = getApps()[0];
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
}

export { auth, firestore, storage };
