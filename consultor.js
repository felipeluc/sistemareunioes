// consultor.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const usuario = localStorage.getItem("user") || "Consultor";
document.getElementById("userName").textContent = usuario;

window.showSection = function(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
};

window.carregarReunioesPendentes = async function () {
  const container = document.getElementById("reunioesPendentes");
  const q = query(collection(db, "reunioes"), where("consultor", "==", usuario), where("status", "==", "pendente"));
  const snapshot = await getDocs(q);
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${dados.nomeLoja || "(sem nome)"}</h3>
      <p>Segmento: ${dados.segmento || "-"}</p>
      <p>Horário: ${dados.hora || "-"}</p>
      <button class="btn" onclick="aceitarReuniao('${docSnap.id}')">Aceitar</button>
      <button class="btn">Transferir</button>
      <button class="btn" onclick="abrirDetalhes('${docSnap.id}')">Abrir</button>
    `;
    container.appendChild(card);
  });
};

window.aceitarReuniao = async function(id) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: "agendado" });
  carregarReunioesPendentes();
};

window.abrirDetalhes = async function(id) {
  const ref = doc(db, "reunioes", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const dados = snap.data();
  alert(`Loja: ${dados.nomeLoja}\nSegmento: ${dados.segmento}\nCidade: ${dados.cidade}\nData: ${dados.data} ${dados.hora}\nObservações: ${dados.observacoes}`);
};

window.salvarFechamento = async function () {
  const dados = {
    nomeLojista: document.getElementById("nomeLojista").value,
    contato: document.getElementById("contato").value,
    cidade: document.getElementById("cidade").value,
    estado: document.getElementById("estado").value,
    qtdLojas: +document.getElementById("qtdLojas").value,
    cnpj: document.getElementById("cnpj").value,
    faturamento: +document.getElementById("faturamento").value,
    temCrediario: document.getElementById("temCrediario").value,
    valorCrediario: +document.getElementById("valorCrediario").value,
    origem: document.getElementById("origem").value,
    valorAdesao: +document.getElementById("valorAdesao").value,
    consultor: usuario,
    criadoEm: new Date()
  };
  await addDoc(collection(db, "fechamentos"), dados);
  alert("Fechamento salvo com sucesso!");
};

document.addEventListener("DOMContentLoaded", () => {
  carregarReunioesPendentes();
});
