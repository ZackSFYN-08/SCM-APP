import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvtbNFXK2M6ca2yUqNVajaXF5EwMCRDPQ",
  authDomain: "scm-app-d94b6.firebaseapp.com",
  databaseURL: "https://scm-app-d94b6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scm-app-d94b6",
  storageBucket: "scm-app-d94b6.firebasestorage.app",
  messagingSenderId: "771120639026",
  appId: "1:771120639026:web:f2990999a8ae73f079a02b",
  measurementId: "G-9GWYJ3KGTY"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);