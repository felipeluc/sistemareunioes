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
const filtroConsultor = document.getElementById("filtroConsultor");
const filtroMes = document.getElementById("filtroMes");

// Agendamento de reunião
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

// Mostrar transferências
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
    card.className = "card-dashboard";
    card.innerHTML = `
      <h3>${dados.nomeLoja || "Loja sem nome"}</h3>
      <p><b>Data:</b> ${dados.data || "-"}</p>
      <p><b>Horário:</b> ${dados.hora || "-"}</p>
      <p><b>Segmento:</b> ${dados.segmento || "-"}</p>
      <p><b>Solicitado por:</b> ${dados.consultor || "Desconhecido"}</p>
    `;

    const btn = document.createElement("button");
    btn.textContent = "Reatribuir";
    btn.onclick = async () => {
      const novoConsultor = prompt("Para qual consultor deseja transferir?", "Leticia");
      if (!novoConsultor) return;
      await updateDoc(doc(db, "reunioes", docSnap.id), {
        consultor: novoConsultor,
        status: "pendente"
      });
      carregarTransferencias();
    };

    card.appendChild(btn);
    listaTransferencias.appendChild(card);
  });
}

// Carregar dashboard com filtro
export async function carregarDashboard() {
  const snapshot = await getDocs(collection(db, "reunioes"));
  const mesSelecionado = filtroMes.value;
  const consultorSelecionado = filtroConsultor.value;

  let totalReunioes = 0;
  let totalLojas = 0;

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const dataStr = dados.data; // formato: yyyy-mm-dd

    if (mesSelecionado && (!dataStr || dataStr.split("-")[1] !== mesSelecionado)) return;
    if (consultorSelecionado && dados.consultor !== consultorSelecionado) return;

    totalReunioes++;
    totalLojas += parseInt(dados.qtdLojas || 0);
  });

  graficoReunioes.innerHTML = `
    <h3>Total de Reuniões</h3>
    <p>${totalReunioes}</p>
  `;

  graficoLojas.innerHTML = `
    <h3>Total de Lojas</h3>
    <p>${totalLojas}</p>
  `;
}

// Inicialização
carregarTransferencias();
carregarDashboard();
