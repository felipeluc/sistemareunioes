import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const userName = localStorage.getItem('usuarioLogado') || 'Consultor';
document.getElementById('userName').textContent = userName;

const reunioesRef = collection(db, 'reunioes');
const consultoresDisponiveis = ["Leticia", "Glaucia", "Marcelo", "Gabriel"];

async function carregarPendentes() {
  const q = query(reunioesRef, where("consultor", "==", userName), where("status", "==", "pendente"));
  const snapshot = await getDocs(q);
  const container = document.getElementById('reunioesPendentes');
  container.innerHTML = '';

  snapshot.forEach(docSnap => {
    const r = docSnap.data();
    const card = document.createElement('div');
    card.className = 'card';
    const selectTransferir = consultoresDisponiveis.map(c =>
      `<option value="${c}">${c}</option>`).join('');
    card.innerHTML = `
      <h3>${r.nomeLoja || 'Sem nome'}</h3>
      <p><strong>Segmento:</strong> ${r.segmento || ''}</p>
      <p><strong>Data:</strong> ${r.data || '---'} | <strong>Hora:</strong> ${r.horario || r.hora || '---'}</p>
      <button class="btn" onclick="aceitarReuniao('${docSnap.id}')">Aceitar</button>
      <select class="transfer-select" onchange="transferirReuniao('${docSnap.id}', this)">
        <option value="">Transferir para...</option>
        ${selectTransferir}
      </select>
      <button class="btn" onclick="abrirCard(this)">Ver Detalhes</button>
      <div class="card-details">
        <p><strong>Cidade:</strong> ${r.cidade || ''}</p>
        <p><strong>Contato:</strong> ${r.contato || ''}</p>
        <p><strong>Canal:</strong> ${r.canal || ''}</p>
        <p><strong>Responsável pela conversa:</strong> ${r.responsavelConversa || ''}</p>
        <p><strong>Origem:</strong> ${r.origem || ''}</p>
        <p><strong>Link:</strong> <a href="${r.link || '#'}" target="_blank">Abrir</a></p>
        <p><strong>Criado em:</strong> ${r.criadoEm?.toDate().toLocaleString() || ''}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

window.abrirCard = (btn) => {
  const card = btn.closest('.card');
  card.classList.toggle('open');
};

window.aceitarReuniao = async (id) => {
  const ref = doc(db, 'reunioes', id);
  await updateDoc(ref, { status: 'agendado' });
  carregarPendentes();
  carregarAgendadas();
};

window.transferirReuniao = async (id, selectElement) => {
  const novoConsultor = selectElement.value;
  if (novoConsultor && novoConsultor !== userName) {
    const ref = doc(db, 'reunioes', id);
    await updateDoc(ref, { consultor: novoConsultor, status: 'transferencia' });
    carregarPendentes();
  }
};

async function carregarAgendadas() {
  const q = query(reunioesRef, where("consultor", "==", userName), where("status", "==", "agendado"));
  const snapshot = await getDocs(q);
  const container = document.getElementById('reunioesAgendadas');
  container.innerHTML = '';

  snapshot.forEach(docSnap => {
    const r = docSnap.data();
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${r.nomeLoja}</h3>
      <p><strong>Data:</strong> ${r.data || '---'} | <strong>Hora:</strong> ${r.horario || r.hora || '---'}</p>
      <p><strong>Segmento:</strong> ${r.segmento}</p>
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

window.alterarStatus = async (id, novoStatus) => {
  const ref = doc(db, 'reunioes', id);
  await updateDoc(ref, { status: novoStatus });
  carregarAgendadas();
  carregarRealizadas();
};

async function carregarRealizadas() {
  const snapshot = await getDocs(query(reunioesRef, where("consultor", "==", userName)));
  const container = document.getElementById('reunioesRealizadas');
  container.innerHTML = '';

  snapshot.forEach(docSnap => {
    const r = docSnap.data();
    if (["fechou", "nao_interesse", "aguardando_pagamento", "aguardando_documentacao"].includes(r.status)) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${r.nomeLoja}</h3>
        <p><strong>Data:</strong> ${r.data || ''}</p>
        <p><strong>Status:</strong> ${r.status}</p>
        <button class="btn" onclick="abrirCard(this)">Ver Detalhes</button>
        <div class="card-details">
          <p><strong>Segmento:</strong> ${r.segmento}</p>
          <p><strong>Cidade:</strong> ${r.cidade}</p>
          <p><strong>Observações:</strong> ${r.observacoes || ''}</p>
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

// Inicializar tudo
carregarPendentes();
carregarAgendadas();
carregarRealizadas();
