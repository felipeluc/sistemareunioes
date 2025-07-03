// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8RN8vcrLZGGmwCXx8ng4GaUZDSo_SSfg",
  authDomain: "reunioes-sistema.firebaseapp.com",
  projectId: "reunioes-sistema",
  storageBucket: "reunioes-sistema.firebasestorage.app",
  messagingSenderId: "591533232683",
  appId: "1:591533232683:web:a2aaeddac1d6c4e3a7906e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
