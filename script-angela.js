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
    carregarTransferencias();
    carregarDashboard();
  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Erro ao agendar reunião");
  }
});

async function carregarTransferencias() {
  const q = query(collection(db, "reunioes"), where("status", "==", "transferencia"));
  const snapshot = await getDocs(q);

  listaTransferencias.innerHTML = "";

  if (snapshot.empty) {
    listaTransferencias.innerHTML = "<p>Nenhuma transferência no momento.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";

    const solicitadoPor = dados.transferidoPor || "Desconhecido";

    card.innerHTML = `
      <strong>${dados.nomeLoja || "Sem nome"}</strong>
      <div><b>Data:</b> ${dados.data || "-"}</div>
      <div><b>Horário:</b> ${dados.hora || "-"}</div>
      <div><b>Solicitado por:</b> ${solicitadoPor}</div>
    `;

    const select = document.createElement("select");
    select.innerHTML = `
      <option value="">Selecionar novo consultor</option>
      <option value="Leticia">Leticia</option>
      <option value="Glaucia">Glaucia</option>
      <option value="Marcelo">Marcelo</option>
      <option value="Gabriel">Gabriel</option>
    `;
    card.appendChild(select);

    const btn = document.createElement("button");
    btn.textContent = "Transferir";
    btn.onclick = async () => {
      if (!select.value) return alert("Selecione um consultor");
      const ref = doc(db, "reunioes", docSnap.id);
      await updateDoc(ref, {
        consultor: select.value,
        status: "pendente",
        transferidoPor: null
      });
      carregarTransferencias();
    };

    card.appendChild(btn);
    listaTransferencias.appendChild(card);
  });
}

async function carregarDashboard() {
  const hoje = new Date();
  const hojeStr = hoje.toISOString().split("T")[0];

  const proximaData = new Date();
  proximaData.setDate(hoje.getDate() + 7);
  const proximaStr = proximaData.toISOString().split("T")[0];

  const q = query(collection(db, "reunioes"));
  const snapshot = await getDocs(q);

  const hojeLista = [];
  const proximosLista = [];
  const resultados = {
    interessado: 0,
    aguardandoPagamento: 0,
    aguardandoDocumentacao: 0,
    semInteresse: 0
  };

  snapshot.forEach((docSnap) => {
    const r = docSnap.data();
    if (r.data === hojeStr) hojeLista.push(r);
    if (r.data > hojeStr && r.data <= proximaStr) proximosLista.push(r);
    if (r.status === "realizada" && r.resultado) {
      resultados[r.resultado] = (resultados[r.resultado] || 0) + 1;
    }
  });

  renderizarListaDashboard("dashboardHoje", hojeLista);
  renderizarListaDashboard("dashboardProximos", proximosLista);
  renderizarResultados("dashboardResultados", resultados);
}

function renderizarListaDashboard(id, lista) {
  const container = document.getElementById(id);
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhuma reunião encontrada.</p>";
    return;
  }

  lista.forEach((r) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${r.nomeLoja || "Sem nome"}</strong>
      <div><b>Data:</b> ${r.data || "-"}</div>
      <div><b>Horário:</b> ${r.hora || "-"}</div>
      <div><b>Consultor:</b> ${r.consultor || "-"}</div>
    `;
    container.appendChild(card);
  });
}

function renderizarResultados(id, resultado) {
  const container = document.getElementById(id);
  container.innerHTML = `
    <div class="card"><b>Interessado:</b> ${resultado.interessado}</div>
    <div class="card"><b>Aguardando Pagamento:</b> ${resultado.aguardandoPagamento}</div>
    <div class="card"><b>Aguardando Documentação:</b> ${resultado.aguardandoDocumentacao}</div>
    <div class="card"><b>Não teve interesse:</b> ${resultado.semInteresse}</div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      const dashboardVisivel = document.getElementById("dashboard").classList.contains("active");
      if (dashboardVisivel) {
        carregarDashboard();
      }
    });
  });

  observer.observe(document.getElementById("dashboard"), { attributes: true });
});

carregarTransferencias();
