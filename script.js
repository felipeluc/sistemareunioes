
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
  const user = document.getElementById("userSelect").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("loginError");

  if (!user || !password) {
    errorEl.textContent = "Preencha todos os campos.";
    return;
  }

  if (users[user] === password) {
    switch (user) {
      case "Angela":
        window.location.href = "angela.html";
        break;
      case "Felipe":
      case "Ana Carolina":
        window.location.href = "gerente.html";
        break;
      default:
        window.location.href = "consultor.html";
    }
  } else {
    errorEl.textContent = "Usuário ou senha inválidos.";
  }
}
