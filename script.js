import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const usuariosSenha = {
  "Ana Carolina": "Ana1234",
  "Felipe": "Felipe1515",
  "Leticia": "Le1234",
  "Glaucia": "Glaucia1234",
  "Marcelo": "Marcelo1234",
  "Gabriel": "Gabriel1234",
  "Angela": "Angela1234"
};

function fazerLogin() {
  const usuario = document.getElementById('usuario').value;
  const senha = document.getElementById('senha').value;
  const erro = document.getElementById('login-erro');

  if (usuariosSenha[usuario] && usuariosSenha[usuario] === senha) {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('bem-vindo').innerText = `Bem-vindo(a), ${usuario}!`;
    configurarAbas(usuario);
  } else {
    erro.innerText = "Nome ou senha inválidos.";
  }
}

window.fazerLogin = fazerLogin;

function configurarAbas(usuario) {
  if (usuario === "Angela") {
    document.querySelectorAll('.angela').forEach(btn => btn.style.display = 'block');
  } else if (["Leticia", "Marcelo", "Gabriel", "Glaucia"].includes(usuario)) {
    document.querySelectorAll('.consultor').forEach(btn => btn.style.display = 'block');
  } else if (["Felipe", "Ana Carolina"].includes(usuario)) {
    document.querySelectorAll('.gerente').forEach(btn => btn.style.display = 'block');
  }
}

window.mostrarAba = function(abaId) {
  document.querySelectorAll('.aba').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(abaId).classList.remove('hidden');
};
