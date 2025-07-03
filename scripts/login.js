import { db } from '../shared/firebase.js';

const senhas = {
  "Ana Carolina": "Ana1234",
  "Felipe": "Felipe1515",
  "Leticia": "Le1234",
  "Glaucia": "Glaucia1234",
  "Marcelo": "Marcelo1234",
  "Gabriel": "Gabriel1234",
  "Angela": "Angela1234"
};

window.fazerLogin = function () {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erroMsg = document.getElementById("login-erro");

  if (!usuario || !senha) {
    erroMsg.textContent = "Preencha todos os campos.";
    return;
  }

  if (senhas[usuario] === senha) {
    if (["Leticia", "Glaucia", "Gabriel", "Marcelo"].includes(usuario)) {
      window.location.href = "consultor.html";
    } else if (usuario === "Angela") {
      window.location.href = "angela.html";
    } else if (["Ana Carolina", "Felipe"].includes(usuario)) {
      window.location.href = "gerente.html";
    }
  } else {
    erroMsg.textContent = "Usuário ou senha incorretos.";
  }
};