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
const graficoReunioes = document.getElementById("totalReunioes");
const graficoLojas = document.getElementById("totalLojas");
const resultadosPorStatus = document.getElementById("resultadosPorStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    consultor: form.consultor.value,
    data: form.dataReuniao.value,
    hora: form.hora.value,
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

// Transferências
async function carregarTransferencias() {
  listaTransferencias.innerHTML = "<p>Carregando...</p>";

  const q = query(collection(db, "reunioes"), where("status", "==", "transferencia"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    listaTransferencias.innerHTML = "<p>Nenhuma reunião transferida.</p>";
    return;
  }

  listaTransferencias.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${dados.nomeLoja}</strong>
      <div><b>Consultor que solicitou:</b> ${dados.transferidoPor || "Desconhecido"}</div>
      <div><b>Cidade:</b> ${dados.cidade}</div>
      <div><b>Data:</b> ${dados.data}</div>
      <div><b>Hora:</b> ${dados.hora}</div>
      <button onclick="transferirParaOutro('${docSnap.id}')">Transferir para outro consultor</button>
    `;
    listaTransferencias.appendChild(div);
  });
}

window.transferirParaOutro = async function (id) {
  const novoConsultor = prompt("Para qual consultor deseja transferir?");
  if (!novoConsultor) return;

  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    consultor: novoConsultor,
    status: "pendente",
    transferidoPor: null
  });

  alert("Reunião transferida com sucesso!");
  carregarTransferencias();
};

// DASHBOARD
async function atualizarDashboard() {
  const snapshot = await getDocs(collection(db, "reunioes"));

  let total = 0;
  let totalLojas = 0;
  const resultados = {};

  const detalhesPorStatus = {};

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    total++;
    totalLojas += dados.qtdLojas || 1;

    if (dados.resultado) {
      const status = dados.resultado;
      resultados[status] = (resultados[status] || 0) + 1;

      if (!detalhesPorStatus[status]) detalhesPorStatus[status] = [];
      detalhesPorStatus[status].push({
        nomeLoja: dados.nomeLoja || "-",
        cnpj: dados.cnpj || "-"
      });
    }
  });

  graficoReunioes.textContent = total;
  graficoLojas.textContent = totalLojas;

  resultadosPorStatus.innerHTML = "";

  for (const status in resultados) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${status}</strong>
      <p>Total: ${resultados[status]}</p>
      <button onclick='verDetalhesResultado("${status}")'>Ver Detalhes</button>
      <div class="resultado-detalhes" id="detalhes-${status}" style="display:none;"></div>
    `;
    resultadosPorStatus.appendChild(card);
  }

  // Armazena os detalhes para acesso no botão
  window._detalhesResultados = detalhesPorStatus;
}

window.verDetalhesResultado = function (status) {
  const container = document.getElementById(`detalhes-${status}`);
  if (!container) return;

  if (container.style.display === "none") {
    container.innerHTML = "";
    window._detalhesResultados[status].forEach(item => {
      const div = document.createElement("div");
      div.innerHTML = `<b>${item.nomeLoja}</b> — CNPJ: ${item.cnpj}`;
      container.appendChild(div);
    });
    container.style.display = "block";
  } else {
    container.style.display = "none";
  }
};

carregarTransferencias();
atualizarDashboard();
