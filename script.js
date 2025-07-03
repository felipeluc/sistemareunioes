import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA82SCTdpkMEAnir63lwuEf0A2Wu2dAhAQ",
  authDomain: "sistemareuniao.firebaseapp.com",
  projectId: "sistemareuniao",
  storageBucket: "sistemareuniao.appspot.com",
  messagingSenderId: "509650784087",
  appId: "1:509650784087:web:140e26fd7dcc2ef89df812"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const senhas = {
  "Ana Carolina": "Ana1234",
  "Felipe": "Felipe1515",
  "Glaucia": "Glaucia1234",
  "Leticia": "Le1234",
  "Marcelo": "Marcelo1234",
  "Gabriel": "Gabriel1234",
  "Angela": "Angela1234"
};

let usuarioLogado = "";
let agendamentoSelecionado = null;

window.fazerLogin = function () {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("login-erro");

  if (senhas[usuario] && senhas[usuario] === senha) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("bem-vindo").innerText = `Bem-vindo(a), ${usuario}!`;
    usuarioLogado = usuario;

    if (usuario === "Angela") {
      document.querySelectorAll(".angela").forEach(btn => btn.classList.remove("hidden"));
      carregarDashboardAngela();
      carregarTransferencias();
    } else if (usuario === "Felipe" || usuario === "Ana Carolina") {
      document.querySelector(".gerente").classList.remove("hidden");
    } else {
      document.querySelectorAll(".consultor").forEach(btn => btn.classList.remove("hidden"));
      carregarReunioesConsultor();
    }
  } else {
    erro.innerText = "Usuário ou senha inválidos!";
  }
};

window.mostrarAba = function (id) {
  document.querySelectorAll(".aba").forEach(aba => aba.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  if (id === "aba-consultor") {
    carregarReunioesConsultor();
  } else if (id === "aba-dashboard-angela") {
    carregarDashboardAngela();
    carregarTransferencias();
  }
};

// Angela
async function carregarTransferencias() {
  const div = document.getElementById("transferencias-angela");
  div.innerHTML = "";

  const snapshot = await getDocs(collection(db, "agendamentos"));
  snapshot.forEach((docSnap) => {
    const agendamento = { id: docSnap.id, ...docSnap.data() };
    if (agendamento.respostaConsultor === "transferir") {
      const p = document.createElement("p");
      p.innerHTML = `
        <strong>${agendamento.consultor}</strong> solicitou transferência para reunião com <strong>${agendamento.nome}</strong>.
        <button onclick="reatribuirReuniao('${agendamento.id}')">Transferir para outro</button>
      `;
      div.appendChild(p);
    }
  });
}

window.reatribuirReuniao = async function (id) {
  const novo = prompt("Para qual consultor deseja transferir?");
  if (novo) {
    await updateDoc(doc(db, "agendamentos", id), {
      consultor: novo,
      respostaConsultor: ""
    });
    alert("Reunião transferida com sucesso.");
    carregarTransferencias();
  }
};

async function carregarDashboardAngela() {
  const container = document.getElementById("historico-angela");
  container.innerHTML = "";

  const consultorFiltro = document.getElementById("filter-consultor-angela").value;
  const dataFiltro = document.getElementById("filter-data-angela").value;

  const snapshot = await getDocs(collection(db, "agendamentos"));
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const horario = new Date(data.horario);
    const diaFormatado = horario.toISOString().split("T")[0];

    if (
      (consultorFiltro === "" || data.consultor === consultorFiltro) &&
      (dataFiltro === "" || diaFormatado === dataFiltro) &&
      data.status &&
      data.status !== "pendente"
    ) {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${data.consultor}</strong> - ${data.nome} - ${data.status}`;
      container.appendChild(p);
    }
  });
}

document.getElementById("btn-filtrar-angela").onclick = carregarDashboardAngela;

// Angela - Agendamento
const form = document.getElementById("form-agendamento");
const sucesso = document.getElementById("mensagem-sucesso");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      consultor: document.getElementById("agendar-consultor").value,
      horario: document.getElementById("agendar-horario").value,
      nome: document.getElementById("agendar-nome").value,
      cidade: document.getElementById("agendar-cidade").value,
      estado: document.getElementById("agendar-estado").value,
      link: document.getElementById("agendar-link").value,
      quantidadeLojas: document.getElementById("agendar-quantidade").value,
      cnpj: document.getElementById("agendar-cnpj").value,
      segmento: document.getElementById("agendar-segmento").value,
      prospeccao: document.getElementById("agendar-prospeccao").value,
      meio: document.getElementById("agendar-meio").value,
      contato: document.getElementById("agendar-contato").value,
      comQuem: document.getElementById("agendar-comquem").value,
      status: "pendente",
      respostaConsultor: "",
      criadoPor: usuarioLogado,
      criadoEm: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "agendamentos"), dados);
      sucesso.innerText = "✅ Reunião agendada com sucesso!";
      form.reset();
      setTimeout(() => sucesso.innerText = "", 3000);
    } catch (error) {
      console.error("Erro ao agendar:", error);
      sucesso.innerText = "❌ Erro ao agendar reunião.";
    }
  });
}

// Consultor
async function carregarReunioesConsultor() {
  const pendentesDiv = document.getElementById("reunioes-pendentes");
  const hojeUl = document.getElementById("reunioes-hoje");
  const futurasUl = document.getElementById("reunioes-futuras");
  const realizadasUl = document.getElementById("reunioes-realizadas");

  pendentesDiv.innerHTML = "";
  hojeUl.innerHTML = "";
  futurasUl.innerHTML = "";
  realizadasUl.innerHTML = "";

  const filtroRealizadas = document.getElementById("filter-realizadas-consultor")?.value;

  const snapshot = await getDocs(collection(db, "agendamentos"));
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.consultor !== usuarioLogado) return;

    const dataHora = new Date(data.horario);
    const diaComparar = new Date(dataHora);
    diaComparar.setHours(0, 0, 0, 0);

    const item = document.createElement("li");
    item.textContent = `${data.nome} - ${dataHora.toLocaleString()}`;
    if (data.status && data.status !== "pendente") {
      item.textContent = `[${data.status}] ` + item.textContent;
    }
    item.onclick = () => mostrarDetalhesReuniao({ ...data, id: docSnap.id });

    if (data.respostaConsultor !== "aceito") {
      const btn = document.createElement("button");
      btn.textContent = `${data.nome} - ${dataHora.toLocaleString()}`;
      btn.onclick = () => mostrarDetalhesReuniao({ ...data, id: docSnap.id });
      pendentesDiv.appendChild(btn);
    } else if (data.status && data.status !== "pendente") {
      if (!filtroRealizadas || filtroRealizadas === data.status) {
        realizadasUl.appendChild(item);
      }
    } else if (diaComparar.getTime() === hoje.getTime()) {
      hojeUl.appendChild(item);
    } else if (diaComparar.getTime() > hoje.getTime()) {
      futurasUl.appendChild(item);
    }
  });
}

function mostrarDetalhesReuniao(agendamento) {
  agendamentoSelecionado = agendamento;
  document.getElementById("acoes-consultor").classList.remove("hidden");
  document.getElementById("status-consultor").classList.add("hidden");

  document.getElementById("det-nome").innerText = agendamento.nome;
  document.getElementById("det-cidade-estado").innerText = `${agendamento.cidade} / ${agendamento.estado}`;
  document.getElementById("det-cnpj").innerText = agendamento.cnpj;
  document.getElementById("det-contato").innerText = agendamento.contato;
  document.getElementById("det-segmento").innerText = agendamento.segmento;
  document.getElementById("det-meio").innerText = agendamento.meio;
  document.getElementById("det-link").innerText = agendamento.link;
  document.getElementById("det-comquem").innerText = agendamento.comQuem;
  document.getElementById("det-horario").innerText = new Date(agendamento.horario).toLocaleString();

  if (agendamento.respostaConsultor === "aceito") {
    document.getElementById("status-consultor").classList.remove("hidden");
  }
}

document.getElementById("btn-aceitar").onclick = async () => {
  if (!agendamentoSelecionado) return;
  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "aceito"
  });
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

document.getElementById("btn-transferir").onclick = async () => {
  if (!agendamentoSelecionado) return;
  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "transferir"
  });
  alert("Solicitado transferência para Angela.");
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

document.getElementById("status-opcao").onchange = (e) => {
  const motivo = document.getElementById("motivo-sem-interesse");
  motivo.classList.toggle("hidden", e.target.value !== "Não teve interesse");
};

document.getElementById("btn-enviar-status").onclick = async () => {
  if (!agendamentoSelecionado) return;

  const status = document.getElementById("status-opcao").value;
  const motivo = document.getElementById("motivo-sem-interesse").value;
  const update = { status };

  if (status === "Não teve interesse") {
    update.motivo = motivo || "Motivo não informado";
  }

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), update);
  alert("Status atualizado com sucesso!");
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};
