import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.getElementById("cadastro-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem");

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    mensagem.textContent = "Usuário cadastrado com sucesso!";
    mensagem.style.color = "green";
  } catch (error) {
    mensagem.textContent = "Erro: " + error.message;
    mensagem.style.color = "red";
  }
});