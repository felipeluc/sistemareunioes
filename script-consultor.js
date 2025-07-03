
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const nomeConsultor = localStorage.getItem("user") || "Consultor";

document.addEventListener("DOMContentLoaded", async () => {
  carregarPendentes();
  carregarAgendadas();
  carregarRealizadas();
  carregarFechamentos();
  carregarDashboard();
});

async function carregarPendentes() {
  const container = document.querySelector("#pendentes .card");
  container.innerHTML = "";
  const q = query(collection(db, "reunioes"), where("status", "==", "pendente"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.consultor || data.consultor === nomeConsultor) {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = \`
        <h3>\${data.loja}</h3>
        <p>\${data.info || ""}</p>
        <button class="btn" onclick="aceitarReuniao('\${docSnap.id}')">Aceitar</button>
        <button class="btn" onclick="transferirReuniao('\${docSnap.id}')">Transferir</button>
      \`;
      container.appendChild(div);
    }
  });
}

async function aceitarReuniao(id) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    consultor: nomeConsultor,
    status: "agendada",
    dataAgendada: Timestamp.fromDate(new Date())
  });
  alert("Reunião aceita!");
  location.reload();
}

async function transferirReuniao(id) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    consultor: null,
    status: "pendente"
  });
  alert("Reunião transferida!");
  location.reload();
}

async function carregarAgendadas() {
  const container = document.querySelector("#agendadas .card");
  container.innerHTML = "";
  const q = query(collection(db, "reunioes"), where("consultor", "==", nomeConsultor), where("status", "==", "agendada"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = \`
      <h3>\${data.loja}</h3>
      <select class="status-select" onchange="salvarStatus('\${docSnap.id}', this.value)">
        <option value="">Status</option>
        <option value="Fechou">Fechou</option>
        <option value="Não teve interesse">Não teve interesse</option>
        <option value="Aguardando pagamento">Aguardando pagamento</option>
        <option value="Aguardando documentação">Aguardando documentação</option>
      </select>
    \`;
    container.appendChild(div);
  });
}

async function salvarStatus(id, status) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status });
  alert("Status atualizado!");
  location.reload();
}

async function carregarRealizadas() {
  const container = document.querySelector("#realizadas .card");
  container.innerHTML = "";
  const q = query(collection(db, "reunioes"), where("consultor", "==", nomeConsultor));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.status && data.status !== "agendada" && data.status !== "pendente") {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = \`
        <h3>\${data.loja}</h3>
        <p>Status: \${data.status}</p>
        <button class="btn" onclick="editarStatus('\${docSnap.id}')">Editar Status</button>
      \`;
      container.appendChild(div);
    }
  });
}

function editarStatus(id) {
  const novoStatus = prompt("Novo status:");
  if (novoStatus) salvarStatus(id, novoStatus);
}

async function carregarFechamentos() {
  const container = document.querySelector("#fechamentos");
  const cardArea = container.querySelector(".card");
  cardArea.innerHTML = "";
  const q = query(collection(db, "fechamentos"), where("consultor", "==", nomeConsultor));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = \`
      <h3>\${data.loja}</h3>
      <p>Data: \${data.data}</p>
      <p>Estado: \${data.estado}</p>
      <p>Adesão: R$ \${data.adesao}</p>
    \`;
    cardArea.appendChild(div);
  });
}

async function carregarDashboard() {
  const q = query(collection(db, "fechamentos"), where("consultor", "==", nomeConsultor));
  const querySnapshot = await getDocs(q);
  let total = 0;
  let totalValor = 0;
  let estados = {};
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    total++;
    totalValor += Number(data.adesao || 0);
    estados[data.estado] = (estados[data.estado] || 0) + 1;
  });
  const estadoTop = Object.entries(estados).sort((a,b)=>b[1]-a[1])[0]?.[0] || "N/A";
  const dashboard = document.querySelector("#dashboard .card");
  dashboard.innerHTML = \`
    <h3>Total de Fechamentos: \${total}</h3>
    <h3>Estado com mais vendas: \${estadoTop}</h3>
    <h3>Valor total de adesão: R$ \${totalValor.toLocaleString()}</h3>
  \`;
}

window.aceitarReuniao = aceitarReuniao;
window.transferirReuniao = transferirReuniao;
window.salvarStatus = salvarStatus;
window.editarStatus = editarStatus;
