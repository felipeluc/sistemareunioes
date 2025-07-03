import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, query, where,
  getDocs, doc, updateDoc, addDoc, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8RN8vcrLZGGmwCXx8ng4GaUZDSo_SSfg",
  authDomain: "reunioes-sistema.firebaseapp.com",
  projectId: "reunioes-sistema",
  storageBucket: "reunioes-sistema.firebasestorage.app",
  messagingSenderId: "591533232683",
  appId: "1:591533232683:web:a2aaeddac1d6c4e3a7906e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const user = localStorage.getItem("user") || "Consultor";
document.getElementById("userName").textContent = user;

// Mostrar seções
window.showSection = function (id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  if (id === 'pendentes') carregarPendentes();
  if (id === 'agendadas') carregarAgendadas();
  if (id === 'realizadas') carregarRealizadas();
}

// Carregar reuniões pendentes
async function carregarPendentes() {
  const container = document.getElementById("reunioesPendentes");
  container.innerHTML = "";

  const q = query(collection(db, "reunioes"), where("consultor", "==", user), where("status", "==", "pendente"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${dados.nomeLoja || "(Sem nome)"}</h3>
      <p>Segmento: ${dados.segmento}</p>
      <p>Horário: ${dados.hora || "—"}</p>
      <div id="detalhes-${docSnap.id}" style="display:none; margin-top:10px;">
        <p><strong>Cidade:</strong> ${dados.cidade}</p>
        <p><strong>Data:</strong> ${dados.data}</p>
        <p><strong>Observações:</strong> ${dados.observacoes || "—"}</p>
      </div>
      <button class="btn" onclick="aceitarReuniao('${docSnap.id}')">Aceitar</button>
      <button class="btn" onclick="abrirDetalhes('${docSnap.id}')">Abrir Card</button>
    `;
    container.appendChild(div);
  });
}

window.abrirDetalhes = function (id) {
  const el = document.getElementById(`detalhes-${id}`);
  if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

window.aceitarReuniao = async function (id) {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: "agendada" });
  carregarPendentes();
  alert("Reunião aceita e movida para 'Hoje / Próximos Dias'");
}

// Carregar agendadas
async function carregarAgendadas() {
  const container = document.getElementById("reunioesAgendadas");
  container.innerHTML = "";

  const q = query(collection(db, "reunioes"), where("consultor", "==", user), where("status", "==", "agendada"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${dados.nomeLoja}</h3>
      <p>Data: ${dados.data}</p>
      <p>Hora: ${dados.hora}</p>
      <label>Status:
        <select onchange="salvarStatus('${docSnap.id}', this.value)">
          <option value="">Selecione</option>
          <option>Fechou</option>
          <option>Não teve interesse</option>
          <option>Aguardando pagamento</option>
          <option>Aguardando documentação</option>
        </select>
      </label>
    `;
    container.appendChild(div);
  });
}

window.salvarStatus = async function (id, novoStatus) {
  if (!novoStatus) return;
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: "realizada", resultado: novoStatus });
  carregarAgendadas();
  alert("Status atualizado para 'realizada'");
}

// Carregar realizadas
async function carregarRealizadas() {
  const container = document.getElementById("reunioesRealizadas");
  container.innerHTML = "";

  const q = query(collection(db, "reunioes"), where("consultor", "==", user), where("status", "==", "realizada"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${dados.nomeLoja}</h3>
      <p>Data: ${dados.data}</p>
      <p>Status: ${dados.resultado || "—"}</p>
      <button class="btn" onclick="editarStatus('${docSnap.id}')">Editar Status</button>
    `;
    container.appendChild(div);
  });
}

window.editarStatus = async function (id) {
  const novo = prompt("Novo status da reunião:");
  if (!novo) return;
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { resultado: novo });
  carregarRealizadas();
}

// Salvar fechamento
window.salvarFechamento = async function () {
  const dados = {
    nomeLojista: document.getElementById("nomeLojista").value,
    contato: document.getElementById("contato").value,
    cidade: document.getElementById("cidade").value,
    estado: document.getElementById("estado").value,
    qtdLojas: parseInt(document.getElementById("qtdLojas").value),
    cnpj: document.getElementById("cnpj").value,
    faturamento: parseFloat(document.getElementById("faturamento").value),
    temCrediario: document.getElementById("temCrediario").value,
    valorCrediario: parseFloat(document.getElementById("valorCrediario").value),
    origem: document.getElementById("origem").value,
    valorAdesao: parseFloat(document.getElementById("valorAdesao").value),
    criadoEm: Timestamp.now(),
    consultor: user
  };

  await addDoc(collection(db, "fechamentos"), dados);
  alert("Fechamento salvo com sucesso!");
}

// Dashboard
window.carregarDashboard = async function () {
  const inicio = new Date(document.getElementById("dataInicio").value);
  const fim = new Date(document.getElementById("dataFim").value);
  fim.setDate(fim.getDate() + 1); // incluir o fim do dia

  const reunioesSnap = await getDocs(query(
    collection(db, "reunioes"),
    where("consultor", "==", user)
  ));

  let totalRealizadas = 0;
  reunioesSnap.forEach(doc => {
    const dados = doc.data();
    const data = new Date(dados.data);
    if (dados.status === "realizada" && data >= inicio && data <= fim) {
      totalRealizadas++;
    }
  });

  const fechamentosSnap = await getDocs(query(
    collection(db, "fechamentos"),
    where("consultor", "==", user)
  ));

  let totalFechamentos = 0;
  fechamentosSnap.forEach(doc => {
    const data = doc.data().criadoEm.toDate();
    if (data >= inicio && data <= fim) totalFechamentos++;
  });

  document.getElementById("infoDashboard").innerHTML = `
    <p><strong>Total de reuniões realizadas:</strong> ${totalRealizadas}</p>
    <p><strong>Total de fechamentos:</strong> ${totalFechamentos}</p>
  `;
}

// Carregar pendentes ao abrir
document.addEventListener("DOMContentLoaded", carregarPendentes);
