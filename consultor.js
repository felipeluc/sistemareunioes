// script-consultor.js
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";

const usuario = localStorage.getItem("usuarioLogado");
document.getElementById("nomeConsultor").innerText = `Bem-vindo(a), ${usuario}`;

const listaPendentes = document.getElementById("listaPendentes");
const listaAgendadas = document.getElementById("listaAgendadas");
const listaRealizadas = document.getElementById("listaRealizadas");

async function carregarReunioes() {
  const q = query(collection(db, "reunioes"), where("consultor", "==", usuario));
  const snapshot = await getDocs(q);

  listaPendentes.innerHTML = "";
  listaAgendadas.innerHTML = "";
  listaRealizadas.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const card = criarCard(dados, docSnap.id);

    if (dados.status === "pendente") {
      listaPendentes.appendChild(card);
    } else if (dados.status === "agendada") {
      listaAgendadas.appendChild(card);
    } else if (dados.status === "realizada") {
      listaRealizadas.appendChild(card);
    }
  });
}

function criarCard(dados, id) {
  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <strong>${dados.nomeLoja || "Sem nome"}</strong>
    <div><b>Segmento:</b> ${dados.segmento || "-"}</div>
    <div><b>Data:</b> ${dados.data || "-"}</div>
    <div><b>Horário:</b> ${dados.hora || "-"}</div>
  `;

  if (dados.status === "pendente") {
    const btnAceitar = document.createElement("button");
    btnAceitar.textContent = "Aceitar";
    btnAceitar.onclick = () => aceitarReuniao(id);
    div.appendChild(btnAceitar);

    const btnTransferir = document.createElement("button");
    btnTransferir.textContent = "Transferir";
    btnTransferir.onclick = () => transferirReuniao(id);
    div.appendChild(btnTransferir);

    const btnDetalhes = document.createElement("button");
    btnDetalhes.textContent = "Ver Detalhes";
    btnDetalhes.onclick = () => alert(JSON.stringify(dados, null, 2));
    div.appendChild(btnDetalhes);
  }

  if (dados.status === "agendada") {
    const select = document.createElement("select");
    select.innerHTML = `
      <option value="">Selecionar status</option>
      <option value="interessado">Interessado</option>
      <option value="aguardandoPagamento">Aguardando Pagamento</option>
      <option value="aguardandoDocumentacao">Aguardando Documentação</option>
      <option value="semInteresse">Não teve interesse</option>
    `;
    select.onchange = () => atualizarStatus(id, select.value);
    div.appendChild(select);
  }

  return div;
}

async function aceitarReuniao(id) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: "agendada" });
  carregarReunioes();
}

async function transferirReuniao(id) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: "transferencia" });
  carregarReunioes();
}

async function atualizarStatus(id, novoStatus) {
  if (!novoStatus) return;

  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    status: "realizada",
    resultado: novoStatus,
    realizadaEm: new Date().toISOString()
  });

  carregarReunioes();
}

carregarReunioes();
