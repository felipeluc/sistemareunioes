import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Config Firebase (copie o seu do firebase-config.js, só duplicado aqui para funcionar standalone)
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

const loginSection = document.getElementById("login");
const dashboard = document.getElementById("dashboard");
const usuarioSelect = document.getElementById("usuario");
const senhaInput = document.getElementById("senha");
const erroLogin = document.getElementById("login-erro");
const bemVindo = document.getElementById("bem-vindo");
const menu = document.getElementById("menu");
const menuToggleBtn = document.getElementById("menu-toggle");
const logoutBtn = document.getElementById("btn-logout");
const menuItems = document.querySelectorAll(".menu-item");
const abas = document.querySelectorAll(".aba");

document.getElementById("btn-login").addEventListener("click", fazerLogin);
menuToggleBtn.addEventListener("click", () => {
  menu.classList.toggle("hidden");
});
logoutBtn.addEventListener("click", logout);

menuItems.forEach(btn => {
  btn.addEventListener("click", () => {
    mostrarAba(btn.getAttribute("data-target"));
    menu.classList.add("hidden"); // fecha menu ao escolher aba
  });
});

function fazerLogin() {
  const usuario = usuarioSelect.value;
  const senha = senhaInput.value.trim();

  if (!usuario) {
    erroLogin.innerText = "Selecione um usuário.";
    return;
  }
  if (!senha) {
    erroLogin.innerText = "Digite a senha.";
    return;
  }
  if (senhas[usuario] && senhas[usuario] === senha) {
    usuarioLogado = usuario;
    erroLogin.innerText = "";
    loginSection.classList.add("hidden");
    dashboard.classList.remove("hidden");
    bemVindo.innerText = `Bem-vindo(a), ${usuario}!`;

    // Mostrar itens do menu conforme perfil
    menuItems.forEach(btn => btn.classList.add("hidden"));
    if (usuario === "Angela") {
      document.querySelectorAll(".angela").forEach(el => el.classList.remove("hidden"));
      mostrarAba("aba-agendar"); // ou aba específica da Angela
    } else if (usuario === "Felipe" || usuario === "Ana Carolina") {
      document.querySelectorAll(".gerente").forEach(el => el.classList.remove("hidden"));
      mostrarAba("aba-gerente");
    } else {
      document.querySelectorAll(".consultor").forEach(el => el.classList.remove("hidden"));
      mostrarAba("aba-consultor");
    }
  } else {
    erroLogin.innerText = "Usuário ou senha inválidos!";
  }
}

function logout() {
  usuarioLogado = "";
  senhaInput.value = "";
  usuarioSelect.value = "";
  erroLogin.innerText = "";
  dashboard.classList.add("hidden");
  loginSection.classList.remove("hidden");
  menu.classList.add("hidden");
  abas.forEach(aba => aba.classList.add("hidden"));
}

function mostrarAba(id) {
  abas.forEach(aba => aba.classList.add("hidden"));
  const abaAtiva = document.getElementById(id);
  if (abaAtiva) abaAtiva.classList.remove("hidden");
}
