// script-angela.js
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from './firebase-config.js';

const form = document.getElementById("formAgendamento");
const listaTransferencias = document.getElementById("listaTransferencias");
const graficoReunioes = document.getElementById("graficoReunioes");
const graficoLojas = document.getElementById("graficoLojas");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    consultor: form.consultor.value,
    horario: form.hora.value,
    nomeLoja: form.nomeLoja.value,
    cidade: form.cidade.value,
    link: form.linkReuniao.value,
    estado: form.estado.value,
    qtdLojas: parseInt(form.qtdLojas.value),
    cnpj: form.cnpj.value,
    segmento: form.segmento.value,
    origem: form.prospeccao.value,
    canal: form.canal.value,
    contato: form.contato.value,
    responsavelConversa: form.responsavelConversa.value,
    status: "pendente",
    criadoEm: Timestamp.now()
  };

  try {
    await addDoc(collection(db, "reunioes"), data);
    alert("Reunião agendada com sucesso!");
    form.reset();
    atualizarDashboard();
  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Erro ao agendar reunião");
  }
});

async function carregarTransferencias() {
  listaTransferencias.innerHTML = "<p>Carregando...</p>";
  const q = query(collection(db, "reunioes"), where("status", "==", "transferencia"));
  const snapshot = await getDocs(q);

  let html = "";
  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    html += `<div style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 12px;">
      <strong>${dados.nomeLoja}</strong><br/>
      ${dados.cidade} - ${dados.estado}<br/>
      <small>${dados.horario}</small><br/>
      <button onclick="transferirOutro('${docSnap.id}')">Transferir para outro</button>
    </div>`;
  });

  listaTransferencias.innerHTML = html || "<p>Nenhuma transferência no momento.</p>";
}

window.transferirOutro = async (idDoc) => {
  const novo = prompt("Para qual consultor transferir?");
  if (!novo) return;

  const docRef = doc(db, "reunioes", idDoc);
  await updateDoc(docRef, { consultor: novo, status: "pendente" });
  alert("Transferido com sucesso!");
  carregarTransferencias();
};

carregarTransferencias();

function filtrarPorPeriodo(dias) {
  const agora = new Date();
  const inicio = new Date();
  inicio.setDate(agora.getDate() - dias);
  atualizarDashboard(inicio, agora);
}

async function atualizarDashboard(inicioData = null, fimData = null) {
  const snapshot = await getDocs(collection(db, "reunioes"));

  let totalReunioes = 0;
  let totalLojas = 0;

  snapshot.forEach(doc => {
    const dados = doc.data();
    const criado = dados.criadoEm?.toDate();

    if (!inicioData || (criado >= inicioData && criado <= fimData)) {
      totalReunioes++;
      totalLojas += parseInt(dados.qtdLojas || 0);
    }
  });

  graficoReunioes.innerHTML = `<div style="padding:1rem; border-radius:12px; background:#fff; margin-bottom:1rem;">
    <h3>Total de Reuniões: ${totalReunioes}</h3>
    <button onclick="filtrarPorPeriodo(1)">Hoje</button>
    <button onclick="filtrarPorPeriodo(7)">Últimos 7 dias</button>
    <button onclick="filtrarPorPeriodo(30)">Últimos 30 dias</button>
  </div>`;

  graficoLojas.innerHTML = `<div style="padding:1rem; border-radius:12px; background:#fff;">
    <h3>Total de Lojas: ${totalLojas}</h3>
  </div>`;
}

atualizarDashboard();
