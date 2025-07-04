// script-gerente.js
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from './firebase-config.js';

const hojeEl = document.getElementById("dashboardHoje");
const proximosEl = document.getElementById("dashboardProximos");
const transferenciasEl = document.getElementById("dashboardTransferencias");
const resultadosEl = document.getElementById("dashboardResultados");
const filtroData = document.getElementById("filtroDataTransferencia");

function formatarDataCompleta(timestamp) {
  if (!timestamp) return "-";
  const data = timestamp.toDate();
  return data.toLocaleDateString("pt-BR") + ' ' + data.toLocaleTimeString("pt-BR");
}

function criarCard({ nomeLoja, cidade, estado, data, hora, criadoEm, transferidoPor, consultor, status }, extra = {}) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <strong>${nomeLoja}</strong>
    <p>${cidade} - ${estado}</p>
    <p><b>Data da Reunião:</b> ${data} ${hora}</p>
    <p><b>Agendada em:</b> ${formatarDataCompleta(criadoEm)}</p>
    ${transferidoPor ? `<p><b>Solicitado por:</b> ${transferidoPor}</p>` : ""}
    ${consultor ? `<p><b>Agendado para:</b> ${consultor}</p>` : ""}
    ${status ? `<p><b>Status:</b> ${status}</p>` : ""}
    <button onclick='verDetalhes(${JSON.stringify(extra).replace(/'/g, "\'")})'>Ver Detalhes</button>
  `;
  return div;
}

async function carregarHoje() {
  const snapshot = await getDocs(collection(db, "reunioes"));
  const hoje = new Date().toISOString().split("T")[0];
  hojeEl.innerHTML = "";

  snapshot.forEach(doc => {
    const dados = doc.data();
    if (dados.data === hoje) {
      const card = criarCard(dados, dados);
      hojeEl.appendChild(card);
    }
  });
}

async function carregarProximos() {
  const snapshot = await getDocs(collection(db, "reunioes"));
  const hoje = new Date().toISOString().split("T")[0];
  proximosEl.innerHTML = "";

  snapshot.forEach(doc => {
    const dados = doc.data();
    if (dados.data > hoje) {
      const card = criarCard(dados, dados);
      proximosEl.appendChild(card);
    }
  });
}

async function carregarTransferencias() {
  const snapshot = await getDocs(query(collection(db, "reunioes"), where("status", "==", "transferencia")));
  transferenciasEl.innerHTML = "";

  snapshot.forEach(doc => {
    const dados = doc.data();
    const card = criarCard(dados, dados);
    transferenciasEl.appendChild(card);
  });
}

async function carregarResultados() {
  const snapshot = await getDocs(collection(db, "reunioes"));
  resultadosEl.innerHTML = "";

  const resultados = {};
  snapshot.forEach(doc => {
    const dados = doc.data();
    if (dados.status === "realizada") {
      const key = dados.resultado;
      if (!resultados[key]) resultados[key] = [];
      resultados[key].push(dados);
    }
  });

  const cores = {
    interessado: "#4caf50",
    aguardandoPagamento: "#fbbc05",
    aguardandoDocumentacao: "#00bcd4",
    semInteresse: "#f44336"
  };

  for (const tipo in resultados) {
    const box = document.createElement("div");
    box.className = "dashboard-box";
    box.style.borderTop = `4px solid ${cores[tipo] || "#999"}`;

    box.innerHTML = `
      <h3>${tipo}</h3>
      <p><strong>${resultados[tipo].length}</strong> resultado(s)</p>
      <button onclick='verDetalhesResultado(${JSON.stringify(resultados[tipo]).replace(/'/g, "\'")})'>Ver Detalhes</button>
    `;
    resultadosEl.appendChild(box);
  }
}

window.verDetalhes = function(dados) {
  alert(`\nLoja: ${dados.nomeLoja}\nCidade: ${dados.cidade}\nEstado: ${dados.estado}\nLink: ${dados.link}\nSegmento: ${dados.segmento}\nCNPJ: ${dados.cnpj}\nOrigem: ${dados.origem}\nCanal: ${dados.canal}\nContato: ${dados.contato}\nResponsável pela conversa: ${dados.responsavelConversa}`);
};

window.verDetalhesResultado = function(lista) {
  if (!Array.isArray(lista)) return;
  const texto = lista.map(d => `Loja: ${d.nomeLoja}\nCNPJ: ${d.cnpj}`).join("\n\n");
  alert(texto);
};

carregarHoje();
carregarProximos();
carregarTransferencias();
carregarResultados();
