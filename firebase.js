// Importar Firebase via CDN (modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Suas credenciais reais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA8RN8vcrLZGGmwCXx8ng4GaUZDSo_SSfg",
  authDomain: "reunioes-sistema.firebaseapp.com",
  projectId: "reunioes-sistema",
  storageBucket: "reunioes-sistema.firebasestorage.app",
  messagingSenderId: "591533232683",
  appId: "1:591533232683:web:a2aaeddac1d6c4e3a7906e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportar para usar nos outros arquivos
export { db, collection, addDoc, getDocs, query, where, updateDoc, doc };
