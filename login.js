import { auth } from './firebase.js';

const senhas = {
  "Ana Carolina": "Ana1234",
  "Felipe": "Felipe1515",
  "Glaucia": "Glaucia1234",
  "Leticia": "Le1234",
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
    localStorage.setItem("usuarioLogado", usuario);
    if (usuario === "Angela") window.location.href = "tela-angela.html";
    else if (usuario === "Felipe" || usuario === "Ana Carolina") window.location.href = "tela-gerencia.html";
    else window.location.href = "tela-consultor.html";
  } else {
    erroMsg.textContent = "Usuário ou senha incorretos.";
  }
};