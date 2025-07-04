import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from './firebase-config.js';

const form = document.getElementById("formAgendamento");
const listaTransferencias = document.getElementById("listaTransferencias");
const graficoReunioes = document.getElementById("graficoReunioes");
const graficoLojas = document.getElementById("graficoLojas");

// Agendamento
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    consultor: form.consultor.value,
    data: form.dataReuniao.value,
    hora: form.hora.value,
    nomeLoja: form.nomeLoja.value,
    cidade: form.cidade.value,
    link: form.linkReuniao.value,
    estado: form.estado.value,
    qtdLojas: parseInt(form.qtdLojas.value),
    cnpj: form.cnpj.value,
    segmento: form.segmento.value,
    origem: form.prospeccao.value,
    canal: form.canal.value,
    contato: form.contato.value,
    responsavelConversa: form.responsavelConversa.value,
    status: "pendente",
    criadoEm: Timestamp.now()
  };

  try {
    await addDoc(collection(db, "reunioes"), data);
    alert("Reunião agendada com sucesso!");
    form.reset();
    carregarDashboard();
  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Erro ao agendar reunião");
  }
});

// Transferências
async function carregarTransferencias() {
  const q = query(collection(db, "reunioes"), where("status", "==", "transferencia"));
  const snapshot = await getDocs(q);

  listaTransferencias.innerHTML = "";

  if (snapshot.empty) {
    listaTransferencias.innerHTML = "<p>Nenhuma reunião transferida no momento.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${dados.nomeLoja || "Loja sem nome"}</h3>
      <p><b>Data:</b> ${dados.data || "-"}</p>
      <p><b>Horário:</b> ${dados.hora || "-"}</p>
      <p><b>Segmento:</b> ${dados.segmento || "-"}</p>
      <p><b>Solicitado por:</b> ${dados.transferidoPor || "Desconhecido"}</p>
    `;

    const select = document.createElement("select");
    select.innerHTML = `
      <option value="">Selecionar consultor</option>
      <option value="Leticia">Leticia</option>
      <option value="Glaucia">Glaucia</option>
      <option value="Marcelo">Marcelo</option>
      <option value="Gabriel">Gabriel</option>
    `;

    const btn = document.createElement("button");
    btn.textContent = "Transferir";
    btn.onclick = async () => {
      const novoConsultor = select.value;
      if (!novoConsultor) {
        alert("Selecione um consultor para transferir.");
        return;
      }
      await updateDoc(doc(db, "reunioes", docSnap.id), {
        consultor: novoConsultor,
        status: "pendente",
        transferidoPor: null
      });
      carregarTransferencias();
      carregarDashboard();
    };

    card.appendChild(select);
    card.appendChild(btn);
    listaTransferencias.appendChild(card);
  });
}

// Dashboard
function carregarDashboard() {
  graficoReunioes.innerHTML = "";
  graficoLojas.innerHTML = "";

  const filtroContainer = document.createElement("div");
  filtroContainer.style.display = "flex";
  filtroContainer.style.gap = "1rem";
  filtroContainer.style.marginBottom = "1rem";

  const filtroConsultor = document.createElement("select");
  filtroConsultor.innerHTML = `
    <option value="">Todos os consultores</option>
    <option value="Leticia">Leticia</option>
    <option value="Glaucia">Glaucia</option>
    <option value="Marcelo">Marcelo</option>
    <option value="Gabriel">Gabriel</option>
  `;

  const filtroMes = document.createElement("select");
  const meses = [
    "01","02","03","04","05","06","07","08","09","10","11","12"
  ];
  const anoAtual = new Date().getFullYear();
  filtroMes.innerHTML = `<option value="">Todos os meses</option>` + 
    meses.map(m => `<option value="${anoAtual}-${m}">${m}/${anoAtual}</option>`).join("");

  filtroConsultor.onchange = atualizar;
  filtroMes.onchange = atualizar;

  filtroContainer.appendChild(filtroConsultor);
  filtroContainer.appendChild(filtroMes);
  graficoReunioes.appendChild(filtroContainer);

  atualizar();

  async function atualizar() {
    const q = query(collection(db, "reunioes"));
    const snapshot = await getDocs(q);

    let total = 0;
    let totalLojas = 0;

    snapshot.forEach(docSnap => {
      const dados = docSnap.data();
      const data = dados.data || "";

      const filtroOk = (
        (!filtroConsultor.value || dados.consultor === filtroConsultor.value) &&
        (!filtroMes.value || data.startsWith(filtroMes.value))
      );

      if (filtroOk) {
        total++;
        totalLojas += parseInt(dados.qtdLojas || 0);
      }
    });

    graficoReunioes.innerHTML = "";
    graficoReunioes.appendChild(filtroContainer);

    const cardReunioes = document.createElement("div");
    cardReunioes.className = "card";
    cardReunioes.innerHTML = `
      <h3>Total de Reuniões</h3>
      <p style="font-size: 2rem;">${total}</p>
    `;

    graficoReunioes.appendChild(cardReunioes);

    graficoLojas.innerHTML = `
      <div class="card">
        <h3>Total de Lojas</h3>
        <p style="font-size: 2rem;">${totalLojas}</p>
      </div>
    `;
  }
}

// Início
carregarTransferencias();
carregarDashboard();
