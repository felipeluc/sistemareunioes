// script-index.js
const usuarios = {
  "Angela": "angela",
  "Leticia": "consultor",
  "Glaucia": "consultor",
  "Marcelo": "consultor",
  "Gabriel": "consultor",
  "Felipe": "gerente",
  "Ana Carolina": "gerente"
};

const senhas = {
  "Angela": "1234",
  "Leticia": "1234",
  "Glaucia": "1234",
  "Marcelo": "1234",
  "Gabriel": "1234",
  "Felipe": "1234",
  "Ana Carolina": "1234"
};

window.login = function () {
  const user = document.getElementById('user').value;
  const senha = document.getElementById('senha').value;

  if (!user || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  if (senhas[user] && senhas[user] === senha) {
    localStorage.setItem('userName', user);
    const tipo = usuarios[user];

    if (tipo === 'angela') window.location.href = 'angela.html';
    else if (tipo === 'consultor') window.location.href = 'consultor.html';
    else if (tipo === 'gerente') window.location.href = 'gerente.html';
  } else {
    alert("Usuário ou senha inválidos.");
  }
};
