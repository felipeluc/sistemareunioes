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
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("login-error");

  if (!username || !password) {
    errorEl.textContent = "Preencha todos os campos.";
    return;
  }

  if (users[username] !== password) {
    errorEl.textContent = "Usuário ou senha incorretos.";
    return;
  }

  // Redirecionamento por tipo de usuário
  if (["Leticia", "Glaucia", "Marcelo", "Gabriel"].includes(username)) {
    window.location.href = "consultor.html";
  } else if (username === "Angela") {
    window.location.href = "angela.html";
  } else if (["Felipe", "Ana Carolina"].includes(username)) {
    window.location.href = "gerente.html";
  }
}
