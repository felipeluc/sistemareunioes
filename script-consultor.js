import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-config.js";

const usuario = localStorage.getItem("usuarioLogado");
document.getElementById("nomeConsultor").textContent = `Bem-vindo(a), ${usuario}`;

const listaPendentes = document.getElementById("listaPendentes");
const listaAgendadas = document.getElementById("listaAgendadas");
const listaRealizadas = document.getElementById("listaRealizadas");
const listaFechamentos = document.getElementById("listaFechamentos");
const formFechamento = document.getElementById("formFechamento");

async function carregarReunioes() {
  const q = query(collection(db, "reunioes"), where("consultor", "==", usuario));
  const snap = await getDocs(q);

  listaPendentes.innerHTML = "";
  listaAgendadas.innerHTML = "";
  listaRealizadas.innerHTML = "";

  snap.forEach(docSnap => {
    const dados = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${dados.nomeLoja}</strong>
      <div><b>Segmento:</b> ${dados.segmento}</div>
      <div><b>Data:</b> ${dados.data || "-"}</div>
      <div><b>Horário:</b> ${dados.horario}</div>
    `;

    if (dados.status === "pendente") {
      const btnAceitar = document.createElement("button");
      btnAceitar.textContent = "Aceitar";
      btnAceitar.onclick = () => aceitarReuniao(id);

      const btnTransferir = document.createElement("button");
      btnTransferir.textContent = "Transferir";
      btnTransferir.onclick = () => transferirParaAngela(id);

      const btnDetalhes = document.createElement("button");
      btnDetalhes.textContent = "Ver Detalhes";
      btnDetalhes.onclick = () => alert(`Link: ${dados.link}\nContato: ${dados.contato}\nCNPJ: ${dados.cnpj}\nOrigem: ${dados.origem}`);

      card.append(btnAceitar, btnTransferir, btnDetalhes);
      listaPendentes.appendChild(card);
    }

    if (dados.status === "agendado") {
      const selectStatus = document.createElement("select");
      selectStatus.innerHTML = `
        <option value="">Selecionar Status</option>
        <option value="realizado">Realizado</option>
        <option value="aguardando pagamento">Aguardando Pagamento</option>
        <option value="aguardando documentação">Aguardando Documentação</option>
        <option value="não teve interesse">Não teve interesse</option>
      `;
      selectStatus.onchange = () => atualizarStatus(id, selectStatus.value);

      card.appendChild(selectStatus);
      listaAgendadas.appendChild(card);
    }

    if (dados.status === "realizado") {
      listaRealizadas.appendChild(card);
    }
  });
}

async function aceitarReuniao(id) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: "agendado" });
  carregarReunioes();
}

async function transferirParaAngela(id) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: "transferencia" });
  alert("Reunião transferida para Angela.");
  carregarReunioes();
}

async function atualizarStatus(id, novoStatus) {
  if (!novoStatus) return;

  const ref = doc(db, "reunioes", id);
  const statusFinal = "realizado";

  await updateDoc(ref, {
    status: statusFinal,
    subStatus: novoStatus
  });

  carregarReunioes();
}

// FECHAMENTOS
formFechamento.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    consultor: usuario,
    nomeLojista: formFechamento.nomeLojista.value,
    contato: formFechamento.contato.value,
    cidade: formFechamento.cidade.value,
    estado: formFechamento.estado.value,
    qtdLojas: formFechamento.qtdLojas.value,
    cnpj: formFechamento.cnpj.value,
    faturamento: formFechamento.faturamento.value,
    crediario: formFechamento.crediario.value,
    valorCrediario: formFechamento.valorCrediario.value,
    origem: formFechamento.origem.value,
    criadoEm: Timestamp.now()
  };

  await addDoc(collection(db, "fechamentos"), data);
  alert("Fechamento salvo!");
  formFechamento.reset();
  carregarFechamentos();
});

async function carregarFechamentos() {
  const q = query(collection(db, "fechamentos"), where("consultor", "==", usuario));
  const snap = await getDocs(q);

  listaFechamentos.innerHTML = "";
  snap.forEach(docSnap => {
    const f = docSnap.data();
    const item = document.createElement("div");
    item.className = "card";
    item.innerHTML = `
      <strong>${f.nomeLojista}</strong>
      ${f.cidade} - ${f.estado} | ${f.qtdLojas} loja(s)<br/>
      CNPJ: ${f.cnpj}<br/>
      Crediário: ${f.crediario} - Valor: ${f.valorCrediario}<br/>
      Origem: ${f.origem}
    `;
    listaFechamentos.appendChild(item);
  });
}

carregarReunioes();
carregarFechamentos();
