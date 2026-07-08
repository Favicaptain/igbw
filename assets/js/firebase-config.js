import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// PLACEHOLDER CONFIG - Replace with your actual Firebase Console values
 const firebaseConfig = {
    apiKey: "AIzaSyB1wlwlUv-9THRtPzfvb-BXCecF_f69Ncg",
    authDomain: "campreg-2026.firebaseapp.com",
    projectId: "campreg-2026",
    storageBucket: "campreg-2026.firebasestorage.app",
    messagingSenderId: "987543857826",
    appId: "1:987543857826:web:29b57ee7fd736372d745fb"
  };

let app, db, auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("✅ Firebase Initialized Successfully");
} catch (error) {
    console.error("❌ Firebase Initialization Error:", error);
}

export { app, db, auth };
