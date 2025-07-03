import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc, addDoc, query, where, Timestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-lite.js';

const userName = localStorage.getItem('usuarioLogado') || 'Consultor';
document.getElementById('userName').textContent = userName;

const showSection = (id) => {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
};

const reunioesRef = collection(db, 'reunioes');
const consultoresDisponiveis = ["Leticia", "Glaucia", "Marcelo", "Gabriel"];

async function carregarPendentes() {
  const snapshot = await getDocs(query(reunioesRef, where("consultor", "==", userName), where("status", "==", "pendente")));
  const container = document.getElementById('reunioesPendentes');
  container.innerHTML = '';
  snapshot.forEach(docSnap => {
    const r = docSnap.data();
    const card = document.createElement('div');
    card.className = 'card';
    const selectTransferir = consultoresDisponiveis.map(c => `<option value="${c}">${c}</option>`).join('');
    card.innerHTML = `
      <h3>${r.nomeLoja || 'Sem nome'}</h3>
      <p><strong>Segmento:</strong> ${r.segmento}</p>
      <p><strong>Data:</strong> ${r.data}</p>
      <p><strong>Horário:</strong> ${r.hora}</p>
      <button class="btn" onclick="aceitarReuniao('${docSnap.id}')">Aceitar</button>
      <select class="transfer-select" onchange="transferirReuniao('${docSnap.id}', this)">
        <option value="">Transferir para...</option>
        ${selectTransferir}
      </select>
      <button class="btn" onclick="abrirCard(this)">Ver Detalhes</button>
      <div class="card-details">
        <p><strong>Cidade:</strong> ${r.cidade || ''}</p>
        <p><strong>Estado:</strong> ${r.estado || ''}</p>
        <p><strong>Contato:</strong> ${r.contato || ''}</p>
        <p><strong>Link:</strong> <a href="${r.linkReuniao}" target="_blank">Acessar reunião</a></p>
        <p><strong>Responsável Conversa:</strong> ${r.responsavelConversa || ''}</p>
        <p><strong>Prospecção:</strong> ${r.prospeccao || ''}</p>
        <p><strong>Canal:</strong> ${r.canal || ''}</p>
        <p><strong>Qtd Lojas:</strong> ${r.qtdLojas || ''}</p>
        <p><strong>CNPJ:</strong> ${r.cnpj || ''}</p>
        <p><strong>Criado em:</strong> ${new Date(r.criadoEm?.seconds * 1000).toLocaleString()}</p>
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
    await updateDoc(ref, { consultor: novoConsultor });
    carregarPendentes();
  }
};

async function carregarAgendadas() {
  const snapshot = await getDocs(query(reunioesRef, where("consultor", "==", userName), where("status", "==", "agendado")));
  const container = document.getElementById('reunioesAgendadas');
  container.innerHTML = '';
  snapshot.forEach(docSnap => {
    const r = docSnap.data();
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${r.nomeLoja}</h3>
      <p><strong>Segmento:</strong> ${r.segmento}</p>
      <p><strong>Data:</strong> ${r.data}</p>
      <p><strong>Horário:</strong> ${r.hora}</p>
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
        <p><strong>Data:</strong> ${r.data}</p>
        <p><strong>Status:</strong> ${r.status}</p>
        <button class="btn" onclick="abrirCard(this)">Ver Detalhes</button>
        <div class="card-details">
          <p><strong>Segmento:</strong> ${r.segmento}</p>
          <p><strong>Cidade:</strong> ${r.cidade}</p>
          <p><strong>Observações:</strong> ${r.observacoes}</p>
        </div>
      `;
      container.appendChild(card);
    }
  });
}

window.salvarFechamento = async () => {
  const data = {
    nomeLojista: document.getElementById('nomeLojista').value,
    contato: document.getElementById('contato').value,
    cidade: document.getElementById('cidade').value,
    estado: document.getElementById('estado').value,
    qtdLojas: +document.getElementById('qtdLojas').value,
    cnpj: document.getElementById('cnpj').value,
    faturamento: +document.getElementById('faturamento').value,
    temCrediario: document.getElementById('temCrediario').value,
    valorCrediario: +document.getElementById('valorCrediario').value,
    origem: document.getElementById('origem').value,
    valorAdesao: +document.getElementById('valorAdesao').value,
    criadoEm: Timestamp.now(),
    consultor: userName
  };
  await addDoc(collection(db, 'fechamentos'), data);
  alert("Fechamento salvo!");
};

window.carregarDashboard = async () => {
  const inicio = new Date(document.getElementById('dataInicio').value);
  const fim = new Date(document.getElementById('dataFim').value);
  fim.setHours(23,59,59);
  const snapshot = await getDocs(query(collection(db, 'fechamentos')));
  let total = 0;
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    if (d.criadoEm?.seconds * 1000 >= inicio.getTime() && d.criadoEm?.seconds * 1000 <= fim.getTime()) {
      if (d.consultor === userName) total++;
    }
  });
  document.getElementById('infoDashboard').innerHTML = `<p><strong>Fechamentos no período:</strong> ${total}</p>`;
};

carregarPendentes();
carregarAgendadas();
carregarRealizadas();
