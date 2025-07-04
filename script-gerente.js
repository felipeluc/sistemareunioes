import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from './firebase-config.js';

const dashboardHoje = document.getElementById("dashboardHoje");
const dashboardProximos = document.getElementById("dashboardProximos");
const dashboardTransferencias = document.getElementById("dashboardTransferencias");
const dashboardAngela = document.getElementById("dashboardAngela");

function formatarData(timestamp) {
  if (!timestamp) return "";
  const data = timestamp.toDate();
  return data.toLocaleDateString("pt-BR") + ' ' + data.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
}

function criarCard(dados) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <strong>${dados.nomeLoja || "Sem nome"}</strong>
    <p>${dados.cidade} - ${dados.estado}</p>
    <p>Data Reunião: ${dados.data || "-"} ${dados.hora || ""}</p>
    <p>Agendado em: ${formatarData(dados.criadoEm)}</p>
    <button onclick='verDetalhes(${JSON.stringify(dados).replace(/'/g, "&#39;")})'>Ver Detalhes</button>
  `;
  return div;
}

function criarCardTransferencia(dados) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <strong>${dados.nomeLoja}</strong>
    <p>${dados.cidade} - ${dados.estado}</p>
    <p>Data Reunião: ${dados.data} ${dados.hora}</p>
    <p>De: ${dados.transferidoPor || "Desconhecido"}</p>
    <p>Para: ${dados.consultor}</p>
    <p>Status: ${dados.status === "agendada" ? "Aceita" : "Aguardando"}</p>
    <button onclick='verDetalhes(${JSON.stringify(dados).replace(/'/g, "&#39;")})'>Ver Detalhes</button>
  `;
  return div;
}

window.verDetalhes = function(dados) {
  alert(`
Loja: ${dados.nomeLoja}
Cidade: ${dados.cidade}
Estado: ${dados.estado}
Contato: ${dados.contato}
Segmento: ${dados.segmento}
Link: ${dados.link}
Origem: ${dados.origem}
Canal: ${dados.canal}
Responsável pela conversa: ${dados.responsavelConversa}
CNPJ: ${dados.cnpj}
Qtd Lojas: ${dados.qtdLojas}
Status: ${dados.status}
  `);
};

async function carregarDashboard() {
  const q = query(collection(db, "reunioes"));
  const snapshot = await getDocs(q);
  const hoje = new Date().toISOString().split('T')[0];

  dashboardHoje.innerHTML = "";
  dashboardProximos.innerHTML = "";
  dashboardTransferencias.innerHTML = "";
  dashboardAngela.innerHTML = "";

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();

    // Seção Angela (replica dados do dashboard da Angela)
    const resumoAngela = document.createElement("div");
    resumoAngela.className = "card";
    resumoAngela.innerHTML = `
      <strong>${dados.nomeLoja}</strong>
      <p>Consultor: ${dados.consultor}</p>
      <p>Status: ${dados.status}</p>
    `;
    dashboardAngela.appendChild(resumoAngela);

    if (dados.status === "transferencia") {
      dashboardTransferencias.appendChild(criarCardTransferencia(dados));
    } else if (dados.data === hoje) {
      dashboardHoje.appendChild(criarCard(dados));
    } else if (dados.data > hoje) {
      dashboardProximos.appendChild(criarCard(dados));
    }
  });
}

carregarDashboard();
