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

// ----------- LOGIN E CONTROLE DE ACESSO -----------
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
let abaAnterior = null;

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
      document.querySelector(".angela").classList.remove("hidden");
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
  document.querySelectorAll(".aba, .hidden-tab").forEach(aba => aba.classList.add("hidden"));
  document.getElementById(id)?.classList.remove("hidden");
  abaAnterior = id;

  if (id === "aba-consultor") carregarReunioesConsultor();
};

window.mostrarAbaAnterior = function () {
  document.querySelectorAll(".aba, .hidden-tab").forEach(aba => aba.classList.add("hidden"));
  abaAnterior && document.getElementById(abaAnterior).classList.remove("hidden");
};

// ----------- AGENDAMENTO -----------
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

// ----------- CONSULTOR - REUNIÕES -----------
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
    dataHora.setSeconds(0, 0);
    const dataComparar = new Date(dataHora);
    dataComparar.setHours(0, 0, 0, 0);

    if (agendamento.status !== "pendente" && agendamento.respostaConsultor === "aceito") {
      const li = document.createElement("li");
      li.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;
      realizadasUl.appendChild(li);
      return;
    }

    if (agendamento.respostaConsultor !== "aceito") {
      const btn = document.createElement("button");
      btn.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;
      btn.onclick = () => mostrarDetalhesReuniao(agendamento);
      pendentesDiv.appendChild(btn);
    } else {
      const li = document.createElement("li");
      li.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;
      li.onclick = () => mostrarDetalhesReuniao(agendamento);

      if (dataComparar.getTime() === hoje.getTime()) {
        hojeUl.appendChild(li);
      } else if (dataComparar.getTime() > hoje.getTime()) {
        futurasUl.appendChild(li);
      }
    }
  });
}

function mostrarDetalhesReuniao(agendamento) {
  agendamentoSelecionado = agendamento;

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

  const statusBox = document.getElementById("status-consultor");
  if (agendamento.respostaConsultor === "aceito") {
    statusBox.classList.remove("hidden");
  } else {
    statusBox.classList.add("hidden");
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

  alert("Solicitado transferência para a Angela.");
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

// ----------- STATUS E MOTIVO -----------
document.getElementById("status-opcao").onchange = (e) => {
  const motivo = document.getElementById("motivo-sem-interesse");
  motivo.classList.toggle("hidden", e.target.value !== "Não teve interesse");
};

document.getElementById("btn-enviar-status").onclick = async () => {
  if (!agendamentoSelecionado) return;

  const status = document.getElementById("status-opcao").value;
  const motivo = document.getElementById("motivo-sem-interesse").value;

  const update = {
    status
  };

  if (status === "Não teve interesse") {
    update.motivo = motivo || "Motivo não informado";
  }

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), update);
  alert("Status atualizado com sucesso!");

  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};
