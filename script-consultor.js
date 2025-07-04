import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from './firebase-config.js';

const usuario = localStorage.getItem("usuarioLogado");
document.getElementById("nomeConsultor").textContent = `Bem-vindo, ${usuario}`;

// Função principal
carregarReunioes();

async function carregarReunioes() {
  const q = query(collection(db, "reunioes"), where("consultor", "==", usuario));
  const snapshot = await getDocs(q);

  const pendentes = [];
  const agendadas = [];
  const realizadas = [];

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();
    const id = docSnap.id;

    if (dados.status === "pendente") pendentes.push({ ...dados, id });
    else if (dados.status === "agendado") agendadas.push({ ...dados, id });
    else if (dados.status === "realizado") realizadas.push({ ...dados, id });
  });

  mostrarLista(pendentes, "listaPendentes", true, false);
  mostrarLista(agendadas, "listaAgendadas", false, true);
  mostrarLista(realizadas, "listaRealizadas", false, false);
}

function mostrarLista(lista, containerId, permitirAcoes, permitirStatus) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = "<p style='color:#888;'>Nenhuma reunião encontrada.</p>";
    return;
  }

  lista.forEach(dados => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <strong>${dados.nomeLoja}</strong>
      <small>${dados.cidade} - ${dados.estado || ""}</small><br>
      <small>Horário: ${dados.horario || dados.hora || ""}</small><br>
      <small>Segmento: ${dados.segmento || ""}</small><br>
    `;

    if (permitirAcoes) {
      const btnAceitar = document.createElement("button");
      btnAceitar.textContent = "Aceitar";
      btnAceitar.onclick = () => atualizarStatus(dados.id, "agendado");

      const btnTransferir = document.createElement("button");
      btnTransferir.textContent = "Transferir";
      btnTransferir.onclick = () => atualizarStatus(dados.id, "transferencia");

      div.appendChild(btnAceitar);
      div.appendChild(btnTransferir);
    }

    if (permitirStatus) {
      const select = document.createElement("select");
      select.innerHTML = `
        <option value="">Selecionar status</option>
        <option value="realizado">Realizado</option>
      `;
      select.onchange = () => {
        if (select.value) {
          atualizarStatus(dados.id, select.value);
        }
      };
      div.appendChild(select);
    }

    container.appendChild(div);
  });
}

async function atualizarStatus(id, novoStatus) {
  const docRef = doc(db, "reunioes", id);
  await updateDoc(docRef, { status: novoStatus });
  carregarReunioes();
}
