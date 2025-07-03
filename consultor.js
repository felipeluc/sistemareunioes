// consultor.js
import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  Timestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const usuario = localStorage.getItem("usuarioAtual") || "Leticia";
document.getElementById("boasVindas").innerText = `Bem-vindo(a), ${usuario}`;

const listaReunioes = document.getElementById("listaReunioes");
const reunioesDia = document.getElementById("reunioesDia");
const reunioesProximas = document.getElementById("reunioesProximas");
const listaFechamentos = document.getElementById("listaFechamentos");

function criarCardReuniao(dados, id) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <h4>${dados.nomeLoja || "(Sem nome)"}</h4>
    <p>${dados.segmento || "Segmento não informado"} - ${dados.horario || "--:--"}</p>
    <button onclick="mostrarModal('Detalhes da Reunião', 
      'Consultor: ${dados.consultor}<br>' +
      'Cidade: ${dados.cidade}<br>' +
      'Estado: ${dados.estado}<br>' +
      'Link: <a href=\"${dados.link}\" target=\"_blank\">Acessar</a><br>' +
      'Quantidade de Lojas: ${dados.qtdLojas}<br>' +
      'CNPJ: ${dados.cnpj}<br>' +
      'Segmento: ${dados.segmento}<br>' +
      'Origem: ${dados.origem}<br>' +
      'Canal: ${dados.canal}<br>' +
      'Contato: ${dados.contato}<br>' +
      'Responsável pela conversa: ${dados.responsavelConversa}'
    )">Ver Detalhes</button>
    <button onclick="aceitarReuniao('${id}')">Aceitar</button>
    <button onclick="transferirReuniao('${id}')">Transferir</button>
  `;
  return div;
}

window.mostrarModal = function(titulo, conteudo) {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.5)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.innerHTML = `
    <div style="background:white;padding:2rem;border-radius:20px;width:400px;max-width:90%;">
      <h3>${titulo}</h3>
      <div>${conteudo}</div>
      <button onclick="this.closest('div').parentNode.remove()" style="margin-top:1rem;">Fechar</button>
    </div>
  `;
  document.body.appendChild(modal);
};

window.aceitarReuniao = async function(id) {
  const docRef = doc(db, "reunioes", id);
  const status = prompt("Qual o status? (interessado, aguardando pagamento, aguardando documentação, não teve interesse)");
  if (!status) return;

  let motivo = "";
  if (status === "não teve interesse") {
    motivo = prompt("Qual o motivo?") || "";
  }

  await updateDoc(docRef, {
    status: status,
    motivo: motivo || null,
    atualizadoEm: Timestamp.now()
  });

  alert("Status atualizado com sucesso.");
  carregarReunioes();
};

window.transferirReuniao = async function(id) {
  const docRef = doc(db, "reunioes", id);
  await updateDoc(docRef, {
    status: "transferencia"
  });
  alert("Reunião enviada para transferência.");
  carregarReunioes();
};

async function carregarReunioes() {
  listaReunioes.innerHTML = "Carregando...";
  const q = query(collection(db, "reunioes"), where("consultor", "==", usuario), where("status", "==", "pendente"));
  const snap = await getDocs(q);
  listaReunioes.innerHTML = "";
  snap.forEach(doc => {
    const dados = doc.data();
    const card = criarCardReuniao(dados, doc.id);
    listaReunioes.appendChild(card);
  });
}

async function carregarFechamentos() {
  const q = query(collection(db, "fechamentos"));
  const snap = await getDocs(q);
  listaFechamentos.innerHTML = "";
  snap.forEach(doc => {
    const dados = doc.data();
    if (dados && dados.lojista) {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <strong>${dados.lojista}</strong><br>
        ${dados.cidade}, ${dados.estado}<br>
        CNPJ: ${dados.cnpj}<br>
        Adesão: R$ ${dados.adesao}<br>
        <small>Origem: ${dados.origem}</small>
      `;
      listaFechamentos.appendChild(div);
    }
  });
}

carregarReunioes();
carregarFechamentos();
