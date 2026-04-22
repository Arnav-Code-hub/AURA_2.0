import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyC3lJ2A7AVZo4WeIfIK1leSkGhsc7ZWihM",
    authDomain: "aura-30aff.firebaseapp.com",
    databaseURL: "https://aura-30aff-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "aura-30aff",
    storageBucket: "aura-30aff.firebasestorage.app",
    messagingSenderId: "1028781380842",
    appId: "1:1028781380842:web:e84953775e8ed8b3643393",
    measurementId: "G-MP6RK1QCVS"
};

// Initialize Firebase (Singleton pattern to avoid re-initialization)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
