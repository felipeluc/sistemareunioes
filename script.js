const users = {
  "Ana Carolina": "Ana1234",
  "Felipe": "Felipe1515",
  "Glaucia": "Glaucia1234",
  "Leticia": "Le1234",
  "Marcelo": "Marcelo1234",
  "Gabriel": "Gabriel1234",
  "Angela": "Angela1234"
};

function login() {
  const username = document.getElementById("user").value;
  const password = document.getElementById("senha").value;
  const errorEl = document.getElementById("login-error");

  errorEl.textContent = "";

  if (!username || !password) {
    errorEl.textContent = "Preencha todos os campos.";
    return;
  }

  if (users[username] !== password) {
    errorEl.textContent = "Usuário ou senha incorretos.";
    return;
  }

  localStorage.setItem("usuarioLogado", username);

  if (["Leticia", "Glaucia", "Marcelo", "Gabriel"].includes(username)) {
    window.location.href = "consultor.html";
  } else if (username === "Angela") {
    window.location.href = "angela.html";
  } else {
    window.location.href = "gerente.html";
  }
}
