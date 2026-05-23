import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1s5YWL7XZr2kD8qH-To4lWpxk1KxMOCA",
  authDomain: "hihi-hihi.firebaseapp.com",
  projectId: "hihi-hihi",
  storageBucket: "hihi-hihi.firebasestorage.app",
  messagingSenderId: "178862255485",
  appId: "1:178862255485:web:b103a376c117628e8e7014",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
