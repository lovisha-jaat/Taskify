
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDMCnNl52oHoCKCfcNjhBcDdTh28I3b5aY",
    authDomain: "taskify-8c526.firebaseapp.com",
    projectId: "taskify-8c526",
    storageBucket: "taskify-8c526.firebasestorage.app",
    messagingSenderId: "591665427240",
    appId: "1:591665427240:web:1baa2f52067385ead7161d",
    measurementId: "G-PRLLV81Z7Y"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
