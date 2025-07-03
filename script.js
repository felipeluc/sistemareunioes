import { auth, db, signInWithEmailAndPassword, onAuthStateChanged } from './firebase.js';

const usuarios = {
  "Angela": "angela123",
  "Leticia": "leticia123",
  "Gabriel": "gabriel123",
  "Glaucia": "glaucia123",
  "Marcelo": "consultor123",
  "Felipe": "gerente123",
  "Ana Carolina": "ana123"
};

const papeis = {
  "Angela": "angela",
  "Leticia": "consultor",
  "Gabriel": "consultor",
  "Glaucia": "consultor",
  "Marcelo": "consultor",
  "Felipe": "gerente",
  "Ana Carolina": "gerente"
};

let usuarioLogado = "";

document.addEventListener("DOMContentLoaded", () => {
  if (auth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        usuarioLogado = user.displayName || user.email;
        mostrarDashboard();
      }
    });
  }

  document.getElementById("form-agendamento").addEventListener("submit", agendarReuniao);
});

window.fazerLogin = function () {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erroMsg = document.getElementById("login-erro");

  if (!usuario || !senha) {
    erroMsg.textContent = "Preencha todos os campos.";
    return;
  }

  if (usuarios[usuario] && usuarios[usuario] === senha) {
    usuarioLogado = usuario;
    mostrarDashboard();
  } else {
    erroMsg.textContent = "Usuário ou senha incorretos.";
  }
};

function mostrarDashboard() {
  const papel = papeis[usuarioLogado];

  document.getElementById("login").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("bem-vindo").textContent = `Bem-vindo(a), ${usuarioLogado}`;

  mostrarMenuPorPerfil(papel);
  mostrarAbaPadrao(papel);
}

function mostrarMenuPorPerfil(papel) {
  document.querySelectorAll(".menu-angela").forEach(el => el.classList.toggle("hidden", papel !== "angela"));
  document.querySelectorAll(".menu-gerente").forEach(el => el.classList.toggle("hidden", papel !== "gerente"));
  document.querySelectorAll(".menu-consultor").forEach(el => el.classList.toggle("hidden", papel !== "consultor"));
}

function mostrarAba(id) {
  document.querySelectorAll(".aba").forEach(el => el.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function mostrarAbaPadrao(papel) {
  if (papel === "angela") mostrarAba("aba-dashboard-angela");
  else if (papel === "gerente") mostrarAba("aba-painel-gerente");
  else if (papel === "consultor") mostrarAba("aba-minhas-reunioes");
}

window.logout = function () {
  usuarioLogado = "";
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("senha").value = "";
};

async function agendarReuniao(event) {
  event.preventDefault();
  const form = document.getElementById("form-agendamento");
  const dados = {
    consultor: form["agendar-consultor"].value,
    horario: form["agendar-horario"].value,
    nome: form["agendar-nome"].value,
    cidade: form["agendar-cidade"].value,
    estado: form["agendar-estado"].value,
    link: form["agendar-link"].value,
    quantidade: form["agendar-quantidade"].value,
    cnpj: form["agendar-cnpj"].value,
    segmento: form["agendar-segmento"].value,
    prospeccao: form["agendar-prospeccao"].value,
    meio: form["agendar-meio"].value,
    contato: form["agendar-contato"].value,
    comquem: form["agendar-comquem"].value,
    status: "pendente",
    criadoPor: usuarioLogado,
    criadoEm: new Date().toISOString()
  };

  try {
    await db.collection("reunioes").add(dados);
    form.reset();
    document.getElementById("mensagem-sucesso").textContent = "Reunião agendada com sucesso!";
    setTimeout(() => document.getElementById("mensagem-sucesso").textContent = "", 3000);
  } catch (error) {
    console.error("Erro ao agendar:", error);
  }
}

window.filtrarDashboardAngela = function () {
  alert("Filtro aplicado (implementar Firebase)");
};