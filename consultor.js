// consultor.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const usuario = localStorage.getItem("user");

document.getElementById("userName").textContent = usuario || "Consultor";

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'pendentes') carregarPendentes();
  if (id === 'agendadas') carregarAgendadas();
  if (id === 'realizadas') carregarRealizadas();
  if (id === 'fechamentos') carregarFechamentos();
  if (id === 'dashboard') carregarDashboard();
}
window.showSection = showSection;

async function carregarPendentes() {
  const container = document.getElementById("reunioesPendentes");
  container.innerHTML = "Carregando...";
  const q = query(collection(db, "reunioes"), where("consultor", "==", usuario), where("status", "==", "pendente"));
  const snap = await getDocs(q);

  container.innerHTML = "";
  snap.forEach(docSnap => {
    const r = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${r.nome}</h3>
      <p>Segmento: ${r.segmento}</p>
      <p>Horário: ${r.horario}</p>
      <button class="btn" onclick="aceitarReuniao('${docSnap.id}')">Aceitar</button>
      <button class="btn">Transferir</button>
    `;
    container.appendChild(card);
  });
}

window.aceitarReuniao = async function(id) {
  await updateDoc(doc(db, "reunioes", id), { status: "agendada" });
  carregarPendentes();
}

async function carregarAgendadas() {
  const container = document.getElementById("reunioesAgendadas");
  container.innerHTML = "";
  const q = query(collection(db, "reunioes"), where("consultor", "==", usuario), where("status", "==", "agendada"));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const r = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${r.nome}</h3>
      <select class="status-select" onchange="atualizarStatus('${docSnap.id}', this.value)">
        <option value="">Status</option>
        <option value="Fechou">Fechou</option>
        <option value="Não teve interesse">Não teve interesse</option>
        <option value="Aguardando pagamento">Aguardando pagamento</option>
        <option value="Aguardando documentação">Aguardando documentação</option>
      </select>
    `;
    container.appendChild(card);
  });
}

window.atualizarStatus = async function(id, novoStatus) {
  if (!novoStatus) return;
  await updateDoc(doc(db, "reunioes", id), { status: novoStatus });
  carregarAgendadas();
}

async function carregarRealizadas() {
  const container = document.getElementById("reunioesRealizadas");
  container.innerHTML = "";
  const status = document.getElementById("filtroStatusRealizadas").value;
  const q = query(collection(db, "reunioes"), where("consultor", "==", usuario));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const r = docSnap.data();
    if (["Fechou", "Não teve interesse", "Aguardando pagamento", "Aguardando documentação"].includes(r.status)) {
      if (!status || r.status === status) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${r.nome}</h3>
          <p>Status: ${r.status}</p>
          <button class="btn" onclick="editarStatus('${docSnap.id}')">Editar Status</button>
        `;
        container.appendChild(card);
      }
    }
  });
}

window.editarStatus = function(id) {
  const novo = prompt("Novo status:");
  if (novo) updateDoc(doc(db, "reunioes", id), { status: novo }).then(carregarRealizadas);
}

window.salvarFechamento = async function() {
  const data = {
    nomeLojista: document.getElementById("nomeLojista").value,
    contato: document.getElementById("contato").value,
    cidade: document.getElementById("cidade").value,
    estado: document.getElementById("estado").value,
    qtdLojas: parseInt(document.getElementById("qtdLojas").value || 0),
    cnpj: document.getElementById("cnpj").value,
    faturamento: parseFloat(document.getElementById("faturamento").value || 0),
    temCrediario: document.getElementById("temCrediario").value,
    valorCrediario: parseFloat(document.getElementById("valorCrediario").value || 0),
    origem: document.getElementById("origem").value,
    valorAdesao: parseFloat(document.getElementById("valorAdesao").value || 0),
    usuario: usuario,
    dataCriacao: Timestamp.now()
  };
  await addDoc(collection(db, "fechamentos"), data);
  alert("Fechamento salvo!");
  carregarFechamentos();
}

async function carregarFechamentos() {
  const container = document.getElementById("listaFechamentos");
  container.innerHTML = "";
  const q = query(collection(db, "fechamentos"), where("usuario", "==", usuario));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const f = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${f.nomeLojista}</h3>
      <p>Cidade: ${f.cidade} - ${f.estado}</p>
      <p>Valor: R$ ${f.valorAdesao.toFixed(2)}</p>
    `;
    container.appendChild(card);
  });
}

async function carregarDashboard() {
  const info = document.getElementById("infoDashboard");
  info.innerHTML = "Carregando...";
  const q = query(collection(db, "fechamentos"), where("usuario", "==", usuario));
  const snap = await getDocs(q);
  let total = 0, soma = 0;
  const porEstado = {};

  snap.forEach(docSnap => {
    const f = docSnap.data();
    total++;
    soma += f.valorAdesao || 0;
    porEstado[f.estado] = (porEstado[f.estado] || 0) + 1;
  });

  const estadoMais = Object.entries(porEstado).sort((a,b) => b[1]-a[1])[0]?.[0] || "N/A";

  info.innerHTML = `
    <h3>Total de Fechamentos: ${total}</h3>
    <h3>Estado com mais vendas: ${estadoMais}</h3>
    <h3>Valor total de adesão: R$ ${soma.toFixed(2)}</h3>
  `;
}

document.addEventListener("DOMContentLoaded", () => showSection("pendentes"));
