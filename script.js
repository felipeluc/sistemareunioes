import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Config Firebase
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

// Senhas fixas para login
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

// Função para login
window.fazerLogin = () => {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("login-erro");

  if (senhas[usuario] && senhas[usuario] === senha) {
    erro.innerText = "";
    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("bem-vindo").innerText = `Bem-vindo(a), ${usuario}!`;
    usuarioLogado = usuario;

    // Exibe menus conforme usuário
    document.querySelectorAll(".angela").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".gerente").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".consultor").forEach(el => el.classList.add("hidden"));

    if (usuario === "Angela") {
      document.querySelectorAll(".angela").forEach(el => el.classList.remove("hidden"));
      mostrarAba("aba-agendar");
    } else if (usuario === "Felipe" || usuario === "Ana Carolina") {
      document.querySelectorAll(".gerente").forEach(el => el.classList.remove("hidden"));
      mostrarAba("aba-gerente");
    } else {
      document.querySelectorAll(".consultor").forEach(el => el.classList.remove("hidden"));
      mostrarAba("aba-consultor");
      carregarReunioesConsultor();
    }
  } else {
    erro.innerText = "Usuário ou senha inválidos!";
  }
};

// Botão login com listener (para evitar onclick inline)
document.getElementById("btn-login").addEventListener("click", window.fazerLogin);

// Função para trocar abas no dashboard
window.mostrarAba = (id) => {
  document.querySelectorAll(".aba").forEach((aba) => aba.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  // Carregar dados conforme aba
  if (id === "aba-consultor") carregarReunioesConsultor();
};

// Formulário de agendamento
const form = document.getElementById("form-agendamento");
const sucesso = document.getElementById("mensagem-sucesso");

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
      criadoEm: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "agendamentos"), dados);
      sucesso.innerText = "✅ Reunião agendada com sucesso!";
      form.reset();
      setTimeout(() => (sucesso.innerText = ""), 3500);
    } catch (error) {
      console.error("Erro ao agendar:", error);
      sucesso.innerText = "❌ Erro ao agendar reunião.";
    }
  });
}

// Carregar reuniões do consultor logado
async function carregarReunioesConsultor() {
  const pendentesDiv = document.getElementById("reunioes-pendentes");
  const hojeDiv = document.getElementById("reunioes-hoje");
  const futurasDiv = document.getElementById("reunioes-futuras");
  const realizadasDiv = document.getElementById("reunioes-realizadas");

  pendentesDiv.innerHTML = "";
  hojeDiv.innerHTML = "";
  futurasDiv.innerHTML = "";
  realizadasDiv.innerHTML = "";

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

    if (agendamento.respostaConsultor !== "aceito") {
      // Pendentes (sem resposta ou recusados)
      const btn = document.createElement("button");
      btn.className = "reuniao-box reuniao-pendente";
      btn.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;
      btn.onclick = () => mostrarDetalhesReuniao(agendamento);
      pendentesDiv.appendChild(btn);
    } else {
      // Aceitas (realizadas, hoje ou futuras)
      const div = document.createElement("div");
      div.className = "reuniao-box reuniao-realizada";

      // Texto com nome + data
      const texto = document.createElement("span");
      texto.textContent = `${agendamento.nome} - ${dataHora.toLocaleString()}`;

      // Status estilizado na frente
      const statusSpan = document.createElement("span");
      statusSpan.className = "reuniao-status";
      statusSpan.textContent = agendamento.status || "Sem status";
      // Adiciona classe para cor se quiser (exemplo abaixo)
      statusSpan.classList.add(`status-${(agendamento.status || "").replace(/\s/g, "\\ ")}`);

      div.appendChild(texto);
      div.appendChild(statusSpan);

      div.onclick = () => mostrarDetalhesReuniao(agendamento);

      if (dataComparar.getTime() === hoje.getTime()) {
        hojeDiv.appendChild(div);
      } else if (dataComparar.getTime() > hoje.getTime()) {
        futurasDiv.appendChild(div);
      } else {
        // Passado e realizado - colocar em realizadas
        realizadasDiv.appendChild(div);
      }
    }
  });
}

// Mostrar detalhes da reunião clicada
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
  // Preenche o select com o status atual (se houver)
  const statusSelect = document.getElementById("status-opcao");
  statusSelect.value = agendamento.status || "";

  // Mostrar campo motivo se status for "Não teve interesse"
  const motivoInput = document.getElementById("motivo-sem-interesse");
  if (agendamento.status === "Não teve interesse") {
    motivoInput.classList.remove("hidden");
    motivoInput.value = agendamento.motivo || "";
  } else {
    motivoInput.classList.add("hidden");
    motivoInput.value = "";
  }
}

// Aceitar reunião
document.getElementById("btn-aceitar").onclick = async () => {
  if (!agendamentoSelecionado) return;

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "aceito",
  });

  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

// Transferir reunião para Angela
document.getElementById("btn-transferir").onclick = async () => {
  if (!agendamentoSelecionado) return;

  await updateDoc(doc(db, "agendamentos", agendamentoSelecionado.id), {
    respostaConsultor: "transferir",
  });

  alert("Solicitado transferência para a Angela.");
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

// Mostrar campo motivo conforme seleção status
document.getElementById("status-opcao").onchange = (e) => {
  const motivo = document.getElementById("motivo-sem-interesse");
  motivo.classList.toggle("hidden", e.target.value !== "Não teve interesse");
  if (e.target.value !== "Não teve interesse") motivo.value = "";
};

// Enviar status atualizado
document.getElementById("btn-enviar-status").onclick = async () => {
  if (!agendamentoSelecionado) return;

  const status = document.getElementById("status-opcao").value;
  const motivo = document.getElementById("motivo-sem-interesse").value.trim();

  if (!status) {
    alert("Selecione um status para a reunião.");
    return;
  }

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
