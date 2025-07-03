// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8RN8vcrLZGGmwCXx8ng4GaUZDSo_SSfg",
  authDomain: "reunioes-sistema.firebaseapp.com",
  projectId: "reunioes-sistema",
  storageBucket: "reunioes-sistema.appspot.com",
  messagingSenderId: "591533232683",
  appId: "1:591533232683:web:a2aaeddac1d6c4e3a7906e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };