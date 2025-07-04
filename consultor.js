import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const userName = localStorage.getItem("usuarioLogado") || "Consultor";
document.getElementById("userName").textContent = userName;

const reunioesRef = collection(db, 'reunioes');
const consultoresDisponiveis = ["Leticia", "Glaucia", "Marcelo", "Gabriel"];

async function carregarPendentes() {
  const q = query(reunioesRef, where("consultor", "==", userName), where("status", "==", "pendente"));
  const snapshot = await getDocs(q);
  const container = document.getElementById("reunioesPendentes");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const r = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";

    const selectTransferir = consultoresDisponiveis.map(c => `<option value="${c}">${c}</option>`).join('');

    card.innerHTML = `
      <h3>${r.nomeLoja || "Sem nome"}</h3>
      <p><strong>Segmento:</strong> ${r.segmento}</p>
      <p><strong>Data:</strong> ${r.data || "-"}</p>
      <p><strong>Horário:</strong> ${r.hora || r.horario || "-"}</p>
      <button class="btn" onclick="aceitarReuniao('${docSnap.id}')">Aceitar</button>
      <select class="transfer-select" onchange="transferirReuniao('${docSnap.id}', this)">
        <option value="">Transferir para...</option>
        ${selectTransferir}
      </select>
      <button class="btn" onclick="abrirCard(this)">Ver Detalhes</button>
      <div class="card-details">
        <p><strong>Cidade:</strong> ${r.cidade || ""}</p>
        <p><strong>Observações:</strong> ${r.observacoes || ""}</p>
        <p><strong>Criado em:</strong> ${r.criadoEm?.toDate().toLocaleString() || ""}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

async function carregarAgendadas() {
  const q = query(reunioesRef, where("consultor", "==", userName), where("status", "==", "agendado"));
  const snapshot = await getDocs(q);
  const container = document.getElementById("reunioesAgendadas");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const r = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${r.nomeLoja}</h3>
      <p><strong>Segmento:</strong> ${r.segmento}</p>
      <p><strong>Data:</strong> ${r.data || "-"}</p>
      <p><strong>Horário:</strong> ${r.hora || r.horario || "-"}</p>
      <select onchange="alterarStatus('${docSnap.id}', this.value)" class="status-select">
        <option value="">Atualizar status</option>
        <option value="fechou">Fechou</option>
        <option value="nao_interesse">Não teve interesse</option>
        <option value="aguardando_pagamento">Aguardando pagamento</option>
        <option value="aguardando_documentacao">Aguardando documentação</option>
      </select>
    `;
    container.appendChild(card);
  });
}

async function carregarRealizadas() {
  const q = query(reunioesRef, where("consultor", "==", userName));
  const snapshot = await getDocs(q);
  const container = document.getElementById("reunioesRealizadas");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const r = docSnap.data();
    if (["fechou", "nao_interesse", "aguardando_pagamento", "aguardando_documentacao"].includes(r.status)) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${r.nomeLoja}</h3>
        <p><strong>Data:</strong> ${r.data || "-"}</p>
        <p><strong>Status:</strong> ${r.status}</p>
        <button class="btn" onclick="abrirCard(this)">Ver Detalhes</button>
        <div class="card-details">
          <p><strong>Segmento:</strong> ${r.segmento}</p>
          <p><strong>Cidade:</strong> ${r.cidade}</p>
          <p><strong>Observações:</strong> ${r.observacoes || ""}</p>
          <select onchange="alterarStatus('${docSnap.id}', this.value)" class="status-select">
            <option value="">Editar status</option>
            <option value="fechou">Fechou</option>
            <option value="nao_interesse">Não teve interesse</option>
            <option value="aguardando_pagamento">Aguardando pagamento</option>
            <option value="aguardando_documentacao">Aguardando documentação</option>
          </select>
        </div>
      `;
      container.appendChild(card);
    }
  });
}

window.abrirCard = (btn) => {
  const card = btn.closest(".card");
  card.classList.toggle("open");
};

window.aceitarReuniao = async (id) => {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: "agendado" });
  await carregarPendentes();
  await carregarAgendadas();
};

window.transferirReuniao = async (id, selectElement) => {
  const novoConsultor = selectElement.value;
  if (novoConsultor && novoConsultor !== userName) {
    const ref = doc(db, "reunioes", id);
    await updateDoc(ref, { consultor: novoConsultor, status: "transferencia" });
    await carregarPendentes();
  }
};

window.alterarStatus = async (id, novoStatus) => {
  if (!novoStatus) return;
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: novoStatus });
  await carregarAgendadas();
  await carregarRealizadas();
};

// Carregar tudo ao abrir
carregarPendentes();
carregarAgendadas();
carregarRealizadas();
