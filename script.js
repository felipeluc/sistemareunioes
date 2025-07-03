import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA82SCTdpkMEAnir63lwuEf0A2Wu2dAhAQ",
  authDomain: "sistemareuniao.firebaseapp.com",
  projectId: "sistemareuniao",
  storageBucket: "sistemareuniao.appspot.com",
  messagingSenderId: "509650784087",
  appId: "1:509650784087:web:140e26fd7dcc2ef89df812"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const senhas = {
  "Ana Carolina": "Ana1234",
  "Felipe": "Felipe1515",
  "Glaucia": "Glaucia1234",
  "Leticia": "Le1234",
  "Marcelo": "Marcelo1234",
  "Gabriel": "Gabriel1234",
  "Angela": "Angela1234"
};

let usuarioLogado = "";
let agendamentoSelecionado = null;

window.fazerLogin = function () {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("login-erro");

  if (senhas[usuario] && senhas[usuario] === senha) {
    erro.innerText = "";
    usuarioLogado = usuario;
    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("bem-vindo").innerText = `Bem-vindo(a), ${usuario}!`;

    document.getElementById("menu-lateral").classList.remove("hidden");
    esconderMenus();
    if (usuario === "Angela") {
      document.getElementById("menu-angela").classList.remove("hidden");
      mostrarAba("aba-dashboard-angela");
      carregarDashboardAngela();
      carregarTransferencias();
    } else if (usuario === "Felipe" || usuario === "Ana Carolina") {
      document.getElementById("menu-gerente").classList.remove("hidden");
      mostrarAba("aba-gerente");
    } else {
      document.getElementById("menu-consultor").classList.remove("hidden");
      mostrarAba("aba-consultor");
      carregarReunioesConsultor();
    }
  } else {
    erro.innerText = "Usuário ou senha inválidos!";
  }
};

function esconderMenus() {
  document.getElementById("menu-angela").classList.add("hidden");
  document.getElementById("menu-gerente").classList.add("hidden");
  document.getElementById("menu-consultor").classList.add("hidden");
}

window.mostrarAba = function (id) {
  document.querySelectorAll(".aba").forEach(aba => aba.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  // Carregar dados ao abrir abas
  if (id === "aba-consultor") {
    carregarReunioesConsultor();
  } else if (id === "aba-dashboard-angela") {
    carregarDashboardAngela();
  } else if (id === "aba-transferencias") {
    carregarTransferencias();
  }
};

// FUNÇÃO PARA TOGGLE MENU MOBILE (se quiser depois)
window.toggleMenu = function () {
  const menu = document.getElementById("menu-lateral");
  if (menu.style.left === "0px" || !menu.style.left) {
    menu.style.left = "-260px";
  } else {
    menu.style.left = "0px";
  }
};

window.logout = function () {
  usuarioLogado = "";
  agendamentoSelecionado = null;
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("menu-lateral").classList.add("hidden");
  document.getElementById("usuario").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("login-erro").innerText = "";
  esconderMenus();
};

// FORMULÁRIO DE AGENDAMENTO - ABA ÂNGELA
const form = document.getElementById("form-agendamento");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      consultor: document.getElementById("agendar-consultor").value,
      horario: document.getElementById("agendar-horario").value,
      nome: document.getElementById("agendar-nome").value,
      cidade: document.getElementById("agendar-cidade").value,
      estado: document.getElementById("agendar-estado").value,
      link: document.getElementById("agendar-link").value,
      quantidadeLojas: document.getElementById("agendar-quantidade").value,
      cnpj: document.getElementById("agendar-cnpj").value,
      segmento: document.getElementById("agendar-segmento").value,
      prospeccao: document.getElementById("agendar-prospeccao").value,
      meio: document.getElementById("agendar-meio").value,
      contato: document.getElementById("agendar-contato").value,
      comQuem: document.getElementById("agendar-comquem").value,
      status: "pendente",
      respostaConsultor: "",
      criadoPor: usuarioLogado,
      criadoEm: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "agendamentos"), dados);
      document.getElementById("mensagem-sucesso").innerText = "✅ Reunião agendada com sucesso!";
      form.reset();
      setTimeout(() => {
        document.getElementById("mensagem-sucesso").innerText = "";
      }, 3000);
    } catch (error) {
      console.error("Erro ao agendar:", error);
      document.getElementById("mensagem-sucesso").innerText = "❌ Erro ao agendar reunião.";
    }
  });
}

// CARREGAR REUNIÕES - CONSULTOR COM FILTROS
async function carregarReunioesConsultor() {
  const filtroStatus = document.getElementById("filtro-status-realizadas").value;
  const filtroData = document.getElementById("filtro-data-realizadas").value;

  const pendentesDiv = document.getElementById("reunioes-pendentes");
  const hojeUl = document.getElementById("reunioes-hoje");
  const futurasUl = document.getElementById("reunioes-futuras");
  const realizadasUl = document.getElementById("reunioes-realizadas");

  pendentesDiv.innerHTML = "";
  hojeUl.innerHTML = "";
  futurasUl.innerHTML = "";
  realizadasUl.innerHTML = "";

  // Buscar todos os agendamentos do consultor
  const snapshot = await getDocs(collection(db, "agendamentos"));
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const agendamento = { id: docSnap.id, ...data };
    if (agendamento.consultor !== usuarioLogado) return;

    const dataHora = new Date(agendamento.horario);
    dataHora.setSeconds(0, 0);
    const dataComparar = new Date(dataHora);
    dataComparar.setHours(0, 0, 0, 0);

    // Botão para reuniões pendentes (não aceitas ainda)
    if (agendamento.respostaConsultor !== "aceito") {
      const btn = document.createElement("button");
      btn.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;
      btn.style.marginBottom = "6px";
      btn.style.background = "#f9e79f";
      btn.onclick = () => mostrarDetalhesReuniao(agendamento);
      pendentesDiv.appendChild(btn);
    } else {
      // Reuniões aceitas - mostrar em Hoje, Futuras ou Realizadas
      if (dataComparar.getTime() === hoje.getTime()) {
        const li = criarLiReuniao(agendamento, dataHora);
        hojeUl.appendChild(li);
      } else if (dataComparar.getTime() > hoje.getTime()) {
        const li = criarLiReuniao(agendamento, dataHora);
        futurasUl.appendChild(li);
      } else {
        // Realizadas - aplicar filtro de status e data
        if ((filtroStatus === "" || agendamento.status === filtroStatus) &&
          (filtroData === "" || (new Date(agendamento.horario)).toISOString().slice(0,10) === filtroData)) {
          const li = criarLiReuniao(agendamento, dataHora, true);
          realizadasUl.appendChild(li);
        }
      }
    }
  });
}

function criarLiReuniao(agendamento, dataHora, mostrarStatus = false) {
  const li = document.createElement("li");
  li.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;
  if (mostrarStatus) {
    li.textContent += ` — Status: ${agendamento.status || "N/A"}`;
  }
  li.style.cursor = "pointer";
  li.onclick = () => mostrarDetalhesReuniao(agendamento);
  return li;
}

function mostrarDetalhesReuniao(agendamento) {
  agendamentoSelecionado = agendamento;
  document.getElementById("acoes-consultor").classList.remove("hidden");

  document.getElementById("det-nome").innerText = agendamento.nome;
  document.getElementById("det-cidade-estado").innerText = `${agendamento.cidade} / ${agendamento.estado}`;
  document.getElementById("det-cnpj").innerText = agendamento.cnpj;
  document.getElementById("det-contato").innerText = agendamento.contato;
  document.getElementById("det-segmento").innerText = agendamento.segmento;
  document.getElementById("det-meio").innerText = agendamento.meio;
  document.getElementById("det-link").innerText = agendamento.link;
  document.getElementById("det-comquem").innerText = agendamento.comQuem;
  document.getElementById("det-horario").innerText = new Date(agendamento.horario).toLocaleString();

  const statusBox = document.getElementById("status-consultor");
  if (agendamento.respostaConsultor === "aceito") {
    statusBox.classList.remove("hidden");
    document.getElementById("status-opcao").value = agendamento.status || "";
    if (agendamento.status === "Não teve interesse") {
      document.getElementById("motivo-sem-interesse").classList.remove("hidden");
      document.getElementById("motivo-sem-interesse").value = agendamento.motivo || "";
    } else {
      document.getElementById("motivo-sem-interesse").classList.add("hidden");
      document.getElementById("motivo-sem-interesse").value = "";
    }
  } else {
    statusBox.classList.add("hidden");
  }
}

document.getElementById("btn-aceitar").onclick = async () => {
  if (!agendamentoSelecionado) return;

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "aceito"
  });

  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

document.getElementById("btn-transferir").onclick = async () => {
  if (!agendamentoSelecionado) return;

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "transferir"
  });

  alert("Solicitado transferência para a Angela.");
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

document.getElementById("status-opcao").onchange = (e) => {
  const motivo = document.getElementById("motivo-sem-interesse");
  motivo.classList.toggle("hidden", e.target.value !== "Não teve interesse");
};

document.getElementById("btn-enviar-status").onclick = async () => {
  if (!agendamentoSelecionado) return;

  const status = document.getElementById("status-opcao").value;
  const motivo = document.getElementById("motivo-sem-interesse").value;

  const update = { status };

  if (status === "Não teve interesse") {
    update.motivo = motivo || "Motivo não informado";
  } else {
    update.motivo = "";
  }

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), update);
  alert("Status atualizado com sucesso!");

  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

// --- ABA DASHBOARD DA ÂNGELA ---
async function carregarDashboardAngela() {
  const filtroConsultor = document.getElementById("filtro-consultor-angela").value;
  const filtroData = document.getElementById("filtro-data-angela").value;

  const lista = document.getElementById("lista-dashboard-angela");
  lista.innerHTML = "";

  const agendamentosCol = collection(db, "agendamentos");
  const snapshot = await getDocs(agendamentosCol);

  snapshot.forEach(docSnap => {
    const agendamento = { id: docSnap.id, ...docSnap.data() };

    if (filtroConsultor && agendamento.consultor !== filtroConsultor) return;
    if (filtroData && (new Date(agendamento.horario)).toISOString().slice(0, 10) !== filtroData) return;

    const li = document.createElement("li");
    li.textContent = `[${agendamento.consultor}] ${agendamento.nome} - ${new Date(agendamento.horario).toLocaleString()} - Status: ${agendamento.status || "N/A"}`;
    lista.appendChild(li);
  });
}

// --- ABA TRANSFERÊNCIAS PARA ÂNGELA ---
async function carregarTransferencias() {
  const lista = document.getElementById("lista-transferencias");
  lista.innerHTML = "";

  const snapshot = await getDocs(collection(db, "agendamentos"));
  snapshot.forEach(docSnap => {
    const agendamento = { id: docSnap.id, ...docSnap.data() };
    if (agendamento.respostaConsultor === "transferir") {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${agendamento.nome}</strong> (Consultor: ${agendamento.consultor}) - ${new Date(agendamento.horario).toLocaleString()}
        <button onclick="transferirParaOutro('${agendamento.id}')">Transferir para outro</button>
      `;
      lista.appendChild(li);
    }
  });
}

// FUNÇÃO PARA TRANSFERIR PARA OUTRO CONSULTOR (ANGELA)
window.transferirParaOutro = async function (id) {
  const novoConsultor = prompt("Digite o nome do consultor para transferir:");

  if (!novoConsultor || !["Leticia", "Gabriel", "Glaucia", "Marcelo"].includes(novoConsultor)) {
    alert("Consultor inválido. Tente novamente.");
    return;
  }

  await updateDoc(doc(db, "agendamentos", id), {
    consultor: novoConsultor,
    respostaConsultor: "",
    status: "pendente"
  });

  alert(`Reunião transferida para ${novoConsultor} com sucesso!`);
  carregarTransferencias();
};

// FILTROS DA ABA CONSULTOR
document.getElementById("filtro-status-realizadas").onchange = carregarReunioesConsultor;
document.getElementById("filtro-data-realizadas").onchange = carregarReunioesConsultor;

// Seta de voltar (se precisar implementar na interface pode adicionar botão e chamar essa função)
window.voltar = function () {
  // pode usar para esconder detalhes ou voltar em abas, dependendo do design
  document.getElementById("acoes-consultor").classList.add("hidden");
};
