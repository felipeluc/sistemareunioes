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
    carregarTransferencias();
    atualizarDashboard();
  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Erro ao agendar reunião");
  }
});

// Carrega transferências com campo 'transferidoPor'
async function carregarTransferencias() {
  listaTransferencias.innerHTML = "<p>Carregando...</p>";
  const q = query(collection(db, "reunioes"), where("status", "==", "transferencia"));
  const snapshot = await getDocs(q);

  listaTransferencias.innerHTML = "";

  if (snapshot.empty) {
    listaTransferencias.innerHTML = "<p>Nenhuma transferência no momento.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("div");
    card.className = "card";

    const solicitadoPor = dados.transferidoPor || "desconhecido";

    card.innerHTML = `
      <strong>${dados.nomeLoja || "Loja sem nome"}</strong>
      <div><b>Segmento:</b> ${dados.segmento || "-"}</div>
      <div><b>Data:</b> ${dados.data || "-"}</div>
      <div><b>Horário:</b> ${dados.hora || "-"}</div>
      <div><b>Solicitado por:</b> ${solicitadoPor}</div>
    `;

    const select = document.createElement("select");
    select.innerHTML = `
      <option value="">Selecionar novo consultor</option>
      <option value="Leticia">Leticia</option>
      <option value="Glaucia">Glaucia</option>
      <option value="Marcelo">Marcelo</option>
      <option value="Gabriel">Gabriel</option>
    `;

    const btnTransferir = document.createElement("button");
    btnTransferir.textContent = "Transferir";
    btnTransferir.onclick = async () => {
      const novoConsultor = select.value;
      if (!novoConsultor) {
        alert("Selecione um consultor");
        return;
      }
      await updateDoc(doc(db, "reunioes", id), {
        consultor: novoConsultor,
        status: "pendente",
        transferidoPor: null
      });
      alert("Transferido com sucesso");
      carregarTransferencias();
    };

    card.appendChild(select);
    card.appendChild(btnTransferir);
    listaTransferencias.appendChild(card);
  });
}

// Dashboard: total de reuniões e total de lojas
async function atualizarDashboard() {
  graficoReunioes.innerHTML = "<p>Carregando...</p>";
  graficoLojas.innerHTML = "";

  const snapshot = await getDocs(collection(db, "reunioes"));
  let totalReunioes = 0;
  let totalLojas = 0;

  snapshot.forEach((doc) => {
    const dados = doc.data();
    totalReunioes++;
    if (dados.qtdLojas) {
      totalLojas += parseInt(dados.qtdLojas);
    }
  });

  graficoReunioes.innerHTML = `
    <div class="card">
      <strong>Total de Reuniões:</strong> ${totalReunioes}
    </div>`;
  graficoLojas.innerHTML = `
    <div class="card">
      <strong>Total de Lojas:</strong> ${totalLojas}
    </div>`;
}

// Inicia transferências e dashboard ao carregar
carregarTransferencias();
atualizarDashboard();
