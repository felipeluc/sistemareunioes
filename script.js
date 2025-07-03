import { auth } from './firebase.js';

const senhas = {
  "Ana Carolina": "Ana1234",
  "Felipe": "Felipe1515",
  "Leticia": "Le1234",
  "Glaucia": "Glaucia1234",
  "Marcelo": "Marcelo1234",
  "Gabriel": "Gabriel1234",
  "Angela": "Angela1234"
};

window.fazerLogin = () => {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erroMsg = document.getElementById("login-erro");

  if (!usuario || !senha) {
    erroMsg.textContent = "Preencha todos os campos.";
    return;
  }

  if (senhas[usuario] && senhas[usuario] === senha) {
    if (usuario === "Angela") window.location.href = "./abas/angela.html";
    else if (usuario === "Felipe" || usuario === "Ana Carolina") window.location.href = "./abas/gerente.html";
    else window.location.href = "./abas/consultor.html";
  } else {
    erroMsg.textContent = "Usuário ou senha incorretos.";
  }
};