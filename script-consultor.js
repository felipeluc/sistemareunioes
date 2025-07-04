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

  const pendentes = [];
  const agendadas = [];
  const realizadas = [];

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    dados.id = docSnap.id;

    if (dados.status === "pendente") pendentes.push(dados);
    else if (dados.status === "agendada") agendadas.push(dados);
    else if (dados.status === "realizada") realizadas.push(dados);
  });

  mostrarLista(listaPendentes, pendentes, "pendente");
  mostrarLista(listaAgendadas, agendadas, "agendada");
  mostrarLista(listaRealizadas, realizadas, "realizada");
}

function mostrarLista(container, lista, tipo) {
  container.innerHTML = "";
  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhuma reunião encontrada.</p>";
    return;
  }

  lista.forEach((dados) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <strong>${dados.nomeLoja || "Sem nome"}</strong>
      <div><b>Segmento:</b> ${dados.segmento || "-"}</div>
      <div><b>Data:</b> ${dados.data || "-"}</div>
      <div><b>Horário:</b> ${dados.hora || "-"}</div>
    `;

    if (tipo === "pendente") {
      const btnAceitar = document.createElement("button");
      btnAceitar.textContent = "Aceitar";
      btnAceitar.onclick = () => aceitar(dados.id);
      div.appendChild(btnAceitar);

      const btnTransferir = document.createElement("button");
      btnTransferir.textContent = "Transferir";
      btnTransferir.onclick = () => transferir(dados.id);
      div.appendChild(btnTransferir);

      const btnDetalhes = document.createElement("button");
      btnDetalhes.textContent = "Ver Detalhes";
      btnDetalhes.onclick = () => verDetalhes(dados);
      div.appendChild(btnDetalhes);
    }

    if (tipo === "agendada") {
      const select = document.createElement("select");
      select.innerHTML = `
        <option value="">Selecionar status</option>
        <option value="interessado">Interessado</option>
        <option value="aguardandoPagamento">Aguardando Pagamento</option>
        <option value="aguardandoDocumentacao">Aguardando Documentação</option>
        <option value="semInteresse">Não teve interesse</option>
      `;
      select.onchange = () => atualizarStatus(dados.id, select.value, dados.nomeLoja, dados.cnpj);
      div.appendChild(select);
    }

    container.appendChild(div);
  });
}

async function aceitar(id) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    status: "agendada",
    transferidoPor: null
  });
  carregarReunioes();
}

async function transferir(id) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    status: "transferencia",
    transferidoPor: usuario
  });
  carregarReunioes();
}

function verDetalhes(dados) {
  alert(`
Loja: ${dados.nomeLoja}
Cidade: ${dados.cidade}
Estado: ${dados.estado}
Contato: ${dados.contato}
Segmento: ${dados.segmento}
Link: ${dados.link}
Observações: ${dados.observacoes || "-"}
  `);
}

async function atualizarStatus(id, resultado, nomeLoja, cnpj) {
  if (!resultado) return;

  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    status: "realizada",
    resultado: resultado,
    realizadaEm: new Date().toISOString(),
    nomeLoja: nomeLoja || "",
    cnpj: cnpj || ""
  });

  carregarReunioes();
}

carregarReunioes();
