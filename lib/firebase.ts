import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLY0tWOM1rhHoDrfqC-B0t5pKvTdcWbrE",
  authDomain: "spry-guru-488905-v4.firebaseapp.com",
  projectId: "spry-guru-488905-v4",
  storageBucket: "spry-guru-488905-v4.firebasestorage.app",
  messagingSenderId: "378673513065",
  appId: "1:378673513065:web:5874d88a5b92f7b719d8f8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
