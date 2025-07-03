import { auth, db, signInWithEmailAndPassword, onAuthStateChanged, logoutUser } from './firebase.js';

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

  document.getElementById("form-agendamento").addEventListener("submit", agendarReuniao);
  document.getElementById("btn-enviar-status").addEventListener("click", salvarStatus);
  document.getElementById("status-opcao").addEventListener("change", toggleMotivo);
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

  // Exibir menus e abas conforme perfil
  mostrarMenuPorPerfil(papel);
  mostrarAbaPadrao(papel);if (papel === "consultor") carregarReunioesConsultor();

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

window.toggleMenu = function () {
  document.getElementById("menu-lateral").classList.toggle("hidden");
};

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

function toggleMotivo() {
  const valor = document.getElementById("status-opcao").value;
  document.getElementById("motivo-sem-interesse").classList.toggle("hidden", valor !== "Não teve interesse");
}

function salvarStatus() {
  // Você pode implementar lógica de salvar no Firestore aqui
  alert("Status salvo (ainda será implementado no Firebase)");
}

window.filtrarDashboardAngela = function () {
  alert("Filtro aplicado (implementar Firebase)");
};
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Carregar reuniões do consultor logado
function carregarReunioesConsultor() {
  const consultor = usuarioLogado;
  const reunioesRef = collection(db, "reunioes");
  const q = query(reunioesRef, where("consultor", "==", consultor));

  onSnapshot(q, (snapshot) => {
    const hoje = new Date().toISOString().slice(0, 10);
    const pendentes = [];
    const hojeReunioes = [];
    const futuras = [];
    const realizadas = [];

    snapshot.forEach((doc) => {
      const dados = doc.data();
      const horario = dados.horario?.slice(0, 10);
      const status = dados.status || "pendente";
      const itemHTML = `
        <li onclick="mostrarDetalhesReuniao('${doc.id}')">
          <strong>${dados.nome}</strong> - ${dados.cidade}/${dados.estado} - ${dados.horario.slice(11, 16)}
        </li>
      `;

      if (status === "pendente") {
        pendentes.push(itemHTML);
      } else if (horario === hoje) {
        hojeReunioes.push(itemHTML);
      } else if (horario > hoje) {
        futuras.push(itemHTML);
      } else {
        realizadas.push(itemHTML);
      }
    });

    document.getElementById("reunioes-pendentes").innerHTML = pendentes.join("");
    document.getElementById("reunioes-hoje").innerHTML = hojeReunioes.join("");
    document.getElementById("reunioes-futuras").innerHTML = futuras.join("");
    document.getElementById("reunioes-realizadas").innerHTML = realizadas.join("");
  });
}

// Mostrar detalhes da reunião ao clicar
window.mostrarDetalhesReuniao = async function (id) {
  const docRef = await db.collection("reunioes").doc(id).get();
  const dados = docRef.data();
  if (!dados) return;

  document.getElementById("acoes-consultor").classList.remove("hidden");
  document.getElementById("status-consultor").classList.remove("hidden");

  document.getElementById("det-nome").textContent = dados.nome;
  document.getElementById("det-cidade-estado").textContent = `${dados.cidade}/${dados.estado}`;
  document.getElementById("det-cnpj").textContent = dados.cnpj;
  document.getElementById("det-contato").textContent = dados.contato;
  document.getElementById("det-segmento").textContent = dados.segmento;
  document.getElementById("det-meio").textContent = dados.meio;
  document.getElementById("det-link").textContent = dados.link;
  document.getElementById("det-comquem").textContent = dados.comquem;
  document.getElementById("det-horario").textContent = dados.horario;

  // Salvar ID atual para alterações
  document.getElementById("btn-enviar-status").dataset.id = id;
};
