
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA8RN8vcrLZGGmwCXx8ng4GaUZDSo_SSfg",
  authDomain: "reunioes-sistema.firebaseapp.com",
  projectId: "reunioes-sistema",
  storageBucket: "reunioes-sistema.firebasestorage.app",
  messagingSenderId: "591533232683",
  appId: "1:591533232683:web:a2aaeddac1d6c4e3a7906e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Recupera o nome do usuário
const usuarioAtual = localStorage.getItem("user") || "Consultor";
document.getElementById("userName").textContent = usuarioAtual;

// Reuniões pendentes do consultor
const q = query(collection(db, "reunioes"), where("consultor", "==", usuarioAtual));
onSnapshot(q, (snapshot) => {
  const pendentesContainer = document.getElementById("listaPendentes");
  pendentesContainer.innerHTML = "";
  snapshot.forEach(doc => {
    const dados = doc.data();
    if (dados.status === "pendente") {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${dados.nome}</h3>
        <p>Cidade: ${dados.cidade} - ${dados.estado}</p>
        <p>Segmento: ${dados.segmento}</p>
        <button class="btn">Aceitar</button>
        <button class="btn">Transferir</button>
      `;
      pendentesContainer.appendChild(card);
    }
  });
});

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
window.showSection = showSection;
