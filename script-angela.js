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
    interessado: [],
    aguardandoPagamento: [],
    aguardandoDocumentacao: [],
    semInteresse: []
  };

  snapshot.forEach((docSnap) => {
    const r = docSnap.data();
    if (r.data === hojeStr) hojeLista.push(r);
    if (r.data > hojeStr && r.data <= proximaStr) proximosLista.push(r);
    if (r.status === "realizada" && r.resultado) {
      resultados[r.resultado].push(r);
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

function renderizarResultados(id, resultados) {
  const container = document.getElementById(id);
  container.innerHTML = "";

  for (const tipo in resultados) {
    const lista = resultados[tipo];
    const card = document.createElement("div");
    card.className = "card";

    const detalhesId = `detalhes-${tipo}`;
    card.innerHTML = `
      <b>${tipo.charAt(0).toUpperCase() + tipo.slice(1)}:</b> ${lista.length}
      <button onclick="document.getElementById('${detalhesId}').classList.toggle('hidden')">Ver detalhes</button>
      <ul id="${detalhesId}" class="hidden" style="margin-top: 0.5rem; padding-left: 1rem;"></ul>
    `;

    const ul = document.createElement("ul");
    ul.id = detalhesId;
    ul.className = "hidden";
    lista.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = `${r.nomeLoja || "Sem nome"} - ${r.cnpj || "Sem CNPJ"}`;
      ul.appendChild(li);
    });

    card.appendChild(ul);
    container.appendChild(card);
  }
}

// estilo ocultar detalhes
const style = document.createElement("style");
style.textContent = `.hidden { display: none; }`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      const dashboardVisivel = document.getElementById("dashboard").classList.contains("active");
      if (dashboardVisivel) carregarDashboard();
    });
  });

  observer.observe(document.getElementById("dashboard"), { attributes: true });
});

carregarTransferencias();
