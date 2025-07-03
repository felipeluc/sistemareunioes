// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyA8RN8vcrLZGGmwCXx8ng4GaUZDSo_SSfg",
  authDomain: "reunioes-sistema.firebaseapp.com",
  projectId: "reunioes-sistema",
  storageBucket: "reunioes-sistema.firebasestorage.app",
  messagingSenderId: "591533232683",
  appId: "1:591533232683:web:a2aaeddac1d6c4e3a7906e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
