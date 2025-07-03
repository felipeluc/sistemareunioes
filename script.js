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
  orderBy,
  startAt,
  endAt,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase config e inicialização
const firebaseConfig = {
  apiKey: "AIzaSyA82SCTdpkMEAnir63lwuEf0A2Wu2dAhAQ",
  authDomain: "sistemareuniao.firebaseapp.com",
  projectId: "sistemareuniao",
  storageBucket: "sistemareuniao.appspot.com",
  messagingSenderId: "509650784087",
  appId: "1:509650784087:web:140e26fd7dcc2ef89df812",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Usuários e senhas fixas
const senhas = {
  "Ana Carolina": "Ana1234",
  Felipe: "Felipe1515",
  Glaucia: "Glaucia1234",
  Leticia: "Le1234",
  Marcelo: "Marcelo1234",
  Gabriel: "Gabriel1234",
  Angela: "Angela1234",
};

let usuarioLogado = "";
let agendamentoSelecionado = null;

// Login
window.fazerLogin = function () {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("login-erro");

  if (senhas[usuario] && senhas[usuario] === senha) {
    usuarioLogado = usuario;

    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");

    document.getElementById("bem-vindo").innerText = `Bem-vindo(a), ${usuario}!`;

    // Configura menus conforme usuário
    document.querySelectorAll(".menu-angela").forEach((el) => el.classList.add("hidden"));
    document.querySelectorAll(".menu-gerente").forEach((el) => el.classList.add("hidden"));
    document.querySelectorAll(".menu-consultor").forEach((el) => el.classList.add("hidden"));

    if (usuario === "Angela") {
      document.querySelectorAll(".menu-angela").forEach((el) => el.classList.remove("hidden"));
      mostrarAba("aba-dashboard-angela");
      carregarDashboardAngela();
      carregarTransferencias();
    } else if (usuario === "Ana Carolina" || usuario === "Felipe") {
      document.querySelectorAll(".menu-gerente").forEach((el) => el.classList.remove("hidden"));
      mostrarAba("aba-painel-gerente");
    } else {
      document.querySelectorAll(".menu-consultor").forEach((el) => el.classList.remove("hidden"));
      mostrarAba("aba-minhas-reunioes");
      carregarReunioesConsultor();
    }

    fecharMenu();
    erro.innerText = "";
  } else {
    erro.innerText = "Usuário ou senha inválidos!";
  }
};

// Logout
window.logout = function () {
  usuarioLogado = "";
  agendamentoSelecionado = null;

  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("usuario").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("login-erro").innerText = "";
  esconderTodasAbas();
  fecharMenu();
};

// Menu lateral toggle
window.toggleMenu = function () {
  const menu = document.getElementById("menu-lateral");
  menu.classList.toggle("hidden");
};
function fecharMenu() {
  document.getElementById("menu-lateral").classList.add("hidden");
}

// Esconder todas as abas
function esconderTodasAbas() {
  document.querySelectorAll(".aba").forEach((aba) => aba.classList.add("hidden"));
}

// Mostrar aba
window.mostrarAba = function (id) {
  esconderTodasAbas();
  document.getElementById(id).classList.remove("hidden");
  fecharMenu();

  if (id === "aba-minhas-reunioes") carregarReunioesConsultor();
  if (id === "aba-dashboard-angela") carregarDashboardAngela();
  if (id === "aba-transferencias") carregarTransferencias();
  if (id === "aba-agendar") resetarFormularioAgendamento();
};

// Formulário agendamento
const form = document.getElementById("form-agendamento");
const sucesso = document.getElementById("mensagem-sucesso");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      consultor: form["agendar-consultor"].value,
      horario: form["agendar-horario"].value,
      nome: form["agendar-nome"].value,
      cidade: form["agendar-cidade"].value,
      estado: form["agendar-estado"].value,
      link: form["agendar-link"].value,
      quantidadeLojas: form["agendar-quantidade"].value,
      cnpj: form["agendar-cnpj"].value,
      segmento: form["agendar-segmento"].value,
      prospeccao: form["agendar-prospeccao"].value,
      meio: form["agendar-meio"].value,
      contato: form["agendar-contato"].value,
      comQuem: form["agendar-comquem"].value,
      status: "pendente",
      respostaConsultor: "",
      criadoPor: usuarioLogado,
      criadoEm: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "agendamentos"), dados);
      sucesso.innerText = "✅ Reunião agendada com sucesso!";
      form.reset();
      setTimeout(() => (sucesso.innerText = ""), 3000);
      mostrarAba("aba-minhas-reunioes");
    } catch (error) {
      console.error("Erro ao agendar:", error);
      sucesso.innerText = "❌ Erro ao agendar reunião.";
    }
  });
}
function resetarFormularioAgendamento() {
  if (form) form.reset();
  sucesso.innerText = "";
}

// --- Consultor: carregar reuniões ---
async function carregarReunioesConsultor() {
  const pendentesDiv = document.getElementById("reunioes-pendentes");
  const hojeUl = document.getElementById("reunioes-hoje");
  const futurasUl = document.getElementById("reunioes-futuras");
  const realizadasUl = document.getElementById("reunioes-realizadas");

  const filtroStatus = document.getElementById("filtro-status-realizadas")?.value || "";

  pendentesDiv.innerHTML = "";
  hojeUl.innerHTML = "";
  futurasUl.innerHTML = "";
  realizadasUl.innerHTML = "";

  const snapshot = await getDocs(collection(db, "agendamentos"));
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  snapshot.forEach((docSnap) => {
    const agendamento = { id: docSnap.id, ...docSnap.data() };

    if (agendamento.consultor !== usuarioLogado) return;

    const dataHora = new Date(agendamento.horario);
    const dataComparar = new Date(dataHora);
    dataComparar.setHours(0, 0, 0, 0);

    if (agendamento.respostaConsultor !== "aceito") {
      const btn = document.createElement("button");
      btn.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;
      btn.style.marginBottom = "6px";
      btn.style.background = "#f9e79f";
      btn.onclick = () => mostrarDetalhesReuniao(agendamento);
      pendentesDiv.appendChild(btn);
    } else {
      const li = document.createElement("li");
      li.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()} - Status: ${agendamento.status || "Sem status"}`;
      li.onclick = () => mostrarDetalhesReuniao(agendamento);

      if (dataComparar.getTime() === hoje.getTime()) {
        hojeUl.appendChild(li);
      } else if (dataComparar.getTime() > hoje.getTime()) {
        futurasUl.appendChild(li);
      } else {
        if (!filtroStatus || filtroStatus === agendamento.status) {
          realizadasUl.appendChild(li);
        }
      }
    }
  });
}

// Mostrar detalhes da reunião
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
  statusBox.classList.remove("hidden");

  if (agendamento.respostaConsultor === "aceito") {
    statusBox.classList.remove("hidden");
  } else {
    statusBox.classList.add("hidden");
  }
}

// Botões ações consultor
document.getElementById("btn-aceitar").onclick = async () => {
  if (!agendamentoSelecionado) return;

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "aceito",
  });

  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

document.getElementById("btn-transferir").onclick = async () => {
  if (!agendamentoSelecionado) return;

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "transferir",
  });

  alert("Solicitado transferência para a Angela.");
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

// Mostrar/esconder motivo "não teve interesse"
document.getElementById("status-opcao").onchange = (e) => {
  const motivoInput = document.getElementById("motivo-sem-interesse");
  if (e.target.value === "Não teve interesse") {
    motivoInput.classList.remove("hidden");
  } else {
    motivoInput.classList.add("hidden");
  }
};

// Salvar status reunião consultor
document.getElementById("btn-enviar-status").onclick = async () => {
  if (!agendamentoSelecionado) return;

  const status = document.getElementById("status-opcao").value;
  const motivo = document.getElementById("motivo-sem-interesse").value || "";

  if (!status) {
    alert("Selecione um status!");
    return;
  }

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    status,
    motivoNaoInteresse: motivo,
    statusAtualizadoEm: new Date().toISOString(),
  });

  alert("Status atualizado com sucesso!");
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
  document.getElementById("status-consultor").classList.add("hidden");
};

// --- DASHBOARD ANGELA ---

async function carregarDashboardAngela() {
  const filtroData = document.getElementById("filtro-data-angela")?.value;
  const filtroConsultor = document.getElementById("filtro-consultor-angela")?.value;
  const container = document.getElementById("dashboard-angela-conteudo");
  container.innerHTML = "Carregando...";

  let q = collection(db, "agendamentos");

  let filtros = [];

  if (filtroConsultor) {
    filtros.push(where("consultor", "==", filtroConsultor));
  }

  if (filtroData) {
    // Filtra agendamentos do dia escolhido (00:00 a 23:59)
    const start = new Date(filtroData);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filtroData);
    end.setHours(23, 59, 59, 999);
    filtros.push(where("horario", ">=", start.toISOString()));
    filtros.push(where("horario", "<=", end.toISOString()));
  }

  if (filtros.length) {
    q = query(collection(db, "agendamentos"), ...filtros);
  }

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    container.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
    return;
  }

  let html = `<table class="tabela-dashboard">
    <thead>
      <tr>
        <th>Consultor</th>
        <th>Nome</th>
        <th>Horário</th>
        <th>Status</th>
        <th>Resposta Consultor</th>
      </tr>
    </thead>
    <tbody>`;

  snapshot.forEach((docSnap) => {
    const ag = docSnap.data();
    html += `<tr>
      <td>${ag.consultor || ""}</td>
      <td>${ag.nome || ""}</td>
      <td>${new Date(ag.horario).toLocaleString()}</td>
      <td>${ag.status || ""}</td>
      <td>${ag.respostaConsultor || ""}</td>
    </tr>`;
  });

  html += "</tbody></table>";

  container.innerHTML = html;
}

// Filtro dashboard Angela
window.filtrarDashboardAngela = () => {
  carregarDashboardAngela();
};

// --- TRANSFERÊNCIAS (para Angela) ---

async function carregarTransferencias() {
  const lista = document.getElementById("lista-transferencias");
  lista.innerHTML = "Carregando...";

  const snapshot = await getDocs(query(collection(db, "agendamentos"), where("respostaConsultor", "==", "transferir")));

  if (snapshot.empty) {
    lista.innerHTML = "<p>Nenhuma transferência pendente.</p>";
    return;
  }

  lista.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const ag = { id: docSnap.id, ...docSnap.data() };

    const div = document.createElement("div");
    div.className
