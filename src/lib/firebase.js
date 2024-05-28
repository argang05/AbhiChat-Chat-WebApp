import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "abhichat-webapp.firebaseapp.com",
  projectId: "abhichat-webapp",
  storageBucket: "abhichat-webapp.appspot.com",
  messagingSenderId: "804891483018",
  appId: "1:804891483018:web:ae0148f538a9b2c5430673"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();