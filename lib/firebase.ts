import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXgYEpbvDfylJI9d0e3CPBXBkToppFE0c",
  authDomain: "scrap-centre-auth.firebaseapp.com",
  projectId: "scrap-centre-auth",
  storageBucket: "scrap-centre-auth.firebasestorage.app",
  messagingSenderId: "970659628462",
  appId: "1:970659628462:web:4e61a38918fdedbc13f43f",
  measurementId: "G-S6RC7LV6ST"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
