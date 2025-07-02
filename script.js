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
let agendamentosConsultor = [];
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
      document.querySelector(".angela").style.display = "block";
    } else if (usuario === "Felipe" || usuario === "Ana Carolina") {
      document.querySelector(".gerente").style.display = "block";
    } else {
      document.querySelectorAll(".consultor").forEach(btn => btn.style.display = "block");
      carregarReunioesConsultor();
    }

  } else {
    erro.innerText = "Usuário ou senha inválidos!";
  }
};

window.mostrarAba = function (id) {
  document.querySelectorAll(".aba").forEach(aba => aba.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
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

// CONSULTOR: Carrega reuniões
async function carregarReunioesConsultor() {
  const container = document.getElementById("reunioes-consultor");
  container.innerHTML = "<p>Carregando...</p>";
  agendamentosConsultor = [];

  const snapshot = await getDocs(collection(db, "agendamentos"));
  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.consultor === usuarioLogado) {
      agendamentosConsultor.push({ id: docSnap.id, ...data });

      const btn = document.createElement("button");
      btn.textContent = `${data.nome} - ${new Date(data.horario).toLocaleString()}`;
      btn.onclick = () => mostrarDetalhesReuniao(data, docSnap.id);
      container.appendChild(btn);
    }
  });

  if (agendamentosConsultor.length === 0) {
    container.innerHTML = "<p>Nenhuma reunião marcada para você ainda.</p>";
  }
}

// CONSULTOR: Mostra detalhes
function mostrarDetalhesReuniao(dados, id) {
  agendamentoSelecionado = { ...dados, id };

  document.getElementById("acoes-consultor").classList.remove("hidden");
  document.getElementById("det-nome").innerText = dados.nome;
  document.getElementById("det-cidade-estado").innerText = `${dados.cidade} / ${dados.estado}`;
  document.getElementById("det-cnpj").innerText = dados.cnpj;
  document.getElementById("det-contato").innerText = dados.contato;
  document.getElementById("det-segmento").innerText = dados.segmento;
  document.getElementById("det-meio").innerText = dados.meio;
  document.getElementById("det-link").innerText = dados.link;
  document.getElementById("det-comquem").innerText = dados.comQuem;
  document.getElementById("det-horario").innerText = new Date(dados.horario).toLocaleString();

  document.getElementById("status-consultor").classList.add("hidden");
  document.getElementById("status-opcao").value = "";
  document.getElementById("motivo-sem-interesse").classList.add("hidden");
}

// CONSULTOR: Aceitar reunião
document.getElementById("btn-aceitar").onclick = () => {
  if (!agendamentoSelecionado) return;

  updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "aceito"
  }).then(() => {
    document.getElementById("status-consultor").classList.remove("hidden");
  });
};

// CONSULTOR: Transferir
document.getElementById("btn-transferir").onclick = () => {
  if (!agendamentoSelecionado) return;

  updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "transferir"
  }).then(() => {
    alert("Solicitado transferência para a Angela.");
    carregarReunioesConsultor();
    document.getElementById("acoes-consultor").classList.add("hidden");
  });
};

// CONSULTOR: Enviar status
document.getElementById("status-opcao").onchange = (e) => {
  const motivo = document.getElementById("motivo-sem-interesse");
  motivo.classList.toggle("hidden", e.target.value !== "Não teve interesse");
};

document.getElementById("btn-enviar-status").onclick = async () => {
  if (!agendamentoSelecionado) return;

  const status = document.getElementById("status-opcao").value;
  const motivo = document.getElementById("motivo-sem-interesse").value;

  let update = {
    status: status
  };

  if (status === "Não teve interesse") {
    update.motivo = motivo || "Motivo não informado";
  }

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), update);
  alert("Status atualizado com sucesso!");
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};
