
import {
  auth, db, signInWithEmailAndPassword, onAuthStateChanged,
  collection, query, where, onSnapshot, doc, getDoc
} from './firebase.js';

const usuarios = {
  "Angela": "angela123",
  "Leticia": "leticia123",
  "Gabriel": "gabriel123",
  "Glaucia": "glaucia123",
  "Marcelo": "marcelo123",
  "Felipe": "felipe123",
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
  if (papel === "consultor") carregarReunioesConsultor(usuarioLogado);
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

async function carregarReunioesConsultor(nomeConsultor) {
  const q = query(collection(db, "reunioes"), where("consultor", "==", nomeConsultor));
  onSnapshot(q, (snapshot) => {
    const pendentes = [];
    const hoje = [];
    const futuras = [];
    const realizadas = [];
    const agora = new Date();

    snapshot.forEach(docSnap => {
      const dados = docSnap.data();
      const horario = new Date(dados.horario);
      const id = docSnap.id;
      if (dados.status === "realizada") {
        realizadas.push({ ...dados, id });
      } else if (horario.toDateString() === agora.toDateString()) {
        hoje.push({ ...dados, id });
      } else if (horario > agora) {
        futuras.push({ ...dados, id });
      } else {
        pendentes.push({ ...dados, id });
      }
    });

    atualizarLista("reunioes-pendentes", pendentes);
    atualizarLista("reunioes-hoje", hoje);
    atualizarLista("reunioes-futuras", futuras);
    atualizarLista("reunioes-realizadas", realizadas);
  });
}

function atualizarLista(idElemento, reunioes) {
  const lista = document.getElementById(idElemento);
  lista.innerHTML = "";
  reunioes.forEach(reuniao => {
    const item = document.createElement("li");
    item.textContent = `${reuniao.nome} (${formatarDataHora(reuniao.horario)})`;
    item.onclick = () => exibirDetalhes(reuniao);
    lista.appendChild(item);
  });
}

function formatarDataHora(dataISO) {
  const d = new Date(dataISO);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function exibirDetalhes(reuniao) {
  document.getElementById("acoes-consultor").classList.remove("hidden");
  document.getElementById("det-nome").textContent = reuniao.nome || "";
  document.getElementById("det-cidade-estado").textContent = `${reuniao.cidade || ""} / ${reuniao.estado || ""}`;
  document.getElementById("det-cnpj").textContent = reuniao.cnpj || "";
  document.getElementById("det-contato").textContent = reuniao.contato || "";
  document.getElementById("det-segmento").textContent = reuniao.segmento || "";
  document.getElementById("det-meio").textContent = reuniao.meio || "";
  document.getElementById("det-link").textContent = reuniao.link || "";
  document.getElementById("det-comquem").textContent = reuniao.comquem || "";
  document.getElementById("det-horario").textContent = formatarDataHora(reuniao.horario);
}
