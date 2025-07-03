import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA82SCTdpkMEAnir63lwuEf0A2Wu2dAhAQ",
  authDomain: "sistemareuniao.firebaseapp.com",
  projectId: "sistemareuniao",
  storageBucket: "sistemareuniao.appspot.com",
  messagingSenderId: "509650784087",
  appId: "1:509650784087:web:140e26fd7dcc2ef89df812"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Usuários e Senhas
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

// LOGIN
window.fazerLogin = function () {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("login-erro");

  if (senhas[usuario] && senhas[usuario] === senha) {
    document.querySelector(".tela-login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("bem-vindo").innerText = `Bem-vindo(a), ${usuario}`;
    usuarioLogado = usuario;

    if (usuario === "Angela") {
      document.getElementById("menu-angela").classList.remove("hidden");
      carregarTransferencias();
      carregarDashboardAngela();
    } else if (usuario === "Felipe" || usuario === "Ana Carolina") {
      document.getElementById("menu-gerente").classList.remove("hidden");
    } else {
      document.getElementById("menu-consultor").classList.remove("hidden");
      carregarReunioesConsultor();
    }
  } else {
    erro.innerText = "Usuário ou senha inválidos!";
  }
};

// MENU
window.abrirMenu = () => {
  document.querySelector(".menu-lateral").classList.toggle("hidden");
};

// ABAS
window.mostrarAba = (id) => {
  document.querySelectorAll(".aba").forEach((a) => a.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  if (id === "aba-consultor") carregarReunioesConsultor();
  if (id === "aba-transferencias") carregarTransferencias();
  if (id === "aba-dashboard-angela") carregarDashboardAngela();
};

// AGENDAR
document.getElementById("form-agendamento").addEventListener("submit", async (e) => {
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
    document.getElementById("mensagem-sucesso").innerText = "✅ Reunião agendada com sucesso!";
    document.getElementById("form-agendamento").reset();
    setTimeout(() => {
      document.getElementById("mensagem-sucesso").innerText = "";
    }, 3000);
  } catch (error) {
    console.error("Erro ao agendar:", error);
  }
});
