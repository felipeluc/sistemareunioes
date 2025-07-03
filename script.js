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

    // Mostrar menu conforme perfil
    document.querySelectorAll(".angela").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".gerente").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".consultor").forEach(el => el.classList.add("hidden"));

    if (usuario === "Angela") {
      document.querySelectorAll(".angela").forEach(el => el.classList.remove("hidden"));
    } else if (usuario === "Felipe" || usuario === "Ana Carolina") {
      document.querySelectorAll(".gerente").forEach(el => el.classList.remove("hidden"));
    } else {
      document.querySelectorAll(".consultor").forEach(el => el.classList.remove("hidden"));
      mostrarAba("aba-consultor");
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
    esconderDetalhes();
  } else {
    esconderDetalhes();
  }
};

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

async function carregarReunioesConsultor() {
  const pendentesDiv = document.getElementById("reunioes-pendentes");
  const hojeUl = document.getElementById("reunioes-hoje");
  const futurasUl = document.getElementById("reunioes-futuras");
  const realizadasUl = document.getElementById("reunioes-realizadas");

  pendentesDiv.innerHTML = "";
  hojeUl.innerHTML = "";
  futurasUl.innerHTML = "";
  realizadasUl.innerHTML = "";

  const snapshot = await getDocs(collection(db, "agendamentos"));
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const agendamento = { id: docSnap.id, ...data };

    if (agendamento.consultor !== usuarioLogado) return;

    const dataHora = new Date(agendamento.horario);
    const dataComparar = new Date(dataHora);
    dataComparar.setHours(0, 0, 0, 0);

    // Botão pendente (não aceito ainda)
    if (agendamento.respostaConsultor !== "aceito") {
      const btn = document.createElement("button");
      btn.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;
      btn.style.marginBottom = "6px";
      btn.style.width = "100%";
      btn.style.padding = "8px";
      btn.style.borderRadius = "6px";
      btn.style.border = "1px solid #f59e0b";
      btn.style.background = "#fef3c7";
      btn.onclick = () => mostrarDetalhesReuniao(agendamento, "pendente");
      pendentesDiv.appendChild(btn);
      return;
    }

    // Se aceito, separar em hoje, futuros e realizados

    // Realizadas = status diferente de pendente e com status definido
    if (agendamento.status && agendamento.status !== "pendente") {
      // Reuniões realizadas aparecem com status à frente
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${agendamento.nome} - ${dataHora.toLocaleString()}</span>
        <span class="status">${agendamento.status}</span>
      `;
      li.style.cursor = "pointer";
      li.onclick = () => mostrarDetalhesReuniao(agendamento, "realizada");
      realizadasUl.appendChild(li);
      return;
    }

    // Hoje ou próximos dias sem status ainda
    if (dataComparar.getTime() === hoje.getTime()) {
      const li = document.createElement("li");
      li.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;
      li.style.cursor = "pointer";
      li.onclick = () => mostrarDetalhesReuniao(agendamento, "hoje");
      hojeUl.appendChild(li);
    } else if (dataComparar.getTime() > hoje.getTime()) {
      const li = document.createElement("li");
      li.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;
      li.style.cursor = "pointer";
      li.onclick = () => mostrarDetalhesReuniao(agendamento, "futuro");
      futurasUl.appendChild(li);
    }
  });
}

function mostrarDetalhesReuniao(agendamento, aba) {
  agendamentoSelecionado = agendamento;

  // Exibir detalhes
  document.getElementById("acoes-consultor").classList.remove("hidden");
  document.getElementById("det-nome").innerText = agendamento.nome;
  document.getElementById("det-cidade-estado").innerText = `${agendamento.cidade} / ${agendamento.estado}`;
  document.getElementById("det-cnpj").innerText = agendamento.cnpj;
  document.getElementById("det-contato").innerText = agendamento.contato;
  document.getElementById("det-segmento").innerText = agendamento.segmento;
  document.getElementById("det-meio").innerText = agendamento.meio;
  document.getElementById("det-link").innerText = agendamento.link;
  document.getElementById("det-comquem").innerText = agendamento.comQuem;
  document.getElementById("det-horario").innerText = new Date(agendamento.horario).toLocaleString();

  // Mostrar ou esconder o status conforme regras:
  const statusBox = document.getElementById("status-consultor");
  if (aba === "hoje" || aba === "futuro") {
    if (agendamento.respostaConsultor === "aceito") {
      statusBox.classList.remove("hidden");
    } else {
      statusBox.classList.add("hidden");
    }
  } else {
    statusBox.classList.add("hidden");
  }
}

function esconderDetalhes() {
  document.getElementById("acoes-consultor").classList.add("hidden");
  document.getElementById("status-consultor").classList.add("hidden");
  agendamentoSelecionado = null;
}

// Botões aceitar e transferir
document.getElementById("btn-aceitar").onclick = async () => {
  if (!agendamentoSelecionado) return;

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "aceito"
  });

  alert("Reunião aceita!");
  carregarReunioesConsultor();
  esconderDetalhes();
};

document.getElementById("btn-transferir").onclick = async () => {
  if (!agendamentoSelecionado) return;

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "transferir"
  });

  alert("Solicitada transferência para a Angela.");
  carregarReunioesConsultor();
  esconderDetalhes();
};

// Mostrar input motivo só se "Não teve interesse"
document.getElementById("status-opcao").onchange = (e) => {
  const motivo = document.getElementById("motivo-sem-interesse");
  motivo.classList.toggle("hidden", e.target.value !== "Não teve interesse");
};

// Salvar status e mover reunião para realizadas
document.getElementById("btn-enviar-status").onclick = async () => {
  if (!agendamentoSelecionado) return;

  const status = document.getElementById("status-opcao").value;
  if (!status) {
    alert("Selecione um status para a reunião.");
    return
