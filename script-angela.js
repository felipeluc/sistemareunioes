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
    const solicitadoPor = dados.transferidoPor || "desconhecido";

    const card = document.createElement("div");
    card.className = "card";
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
      if (!novoConsultor) return alert("Selecione um consultor");
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

// Dashboard novo
async function atualizarDashboard() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const snapshot = await getDocs(collection(db, "reunioes"));
  const hojeList = [];
  const futuroList = [];
  const resultados = {};

  snapshot.forEach(docSnap => {
    const dados = docSnap.data();
    const dataReuniao = new Date(dados.data);

    if (!isNaN(dataReuniao)) {
      dataReuniao.setHours(0, 0, 0, 0);

      if (dataReuniao.getTime() === hoje.getTime()) {
        hojeList.push(dados);
      } else if (dataReuniao > hoje) {
        futuroList.push(dados);
      }
    }

    if (dados.status === "realizada" && dados.resultado) {
      const mes = new Date(dados.realizadaEm || "").getMonth();
      const chave = dados.resultado;
      if (!resultados[chave]) resultados[chave] = [];
      resultados[chave].push(dados);
    }
  });

  graficoReunioes.innerHTML = `
    <div class="card">
      <strong>Reuniões de Hoje:</strong>
      ${hojeList.map(r => `<div>${r.nomeLoja} - ${r.consultor}</div>`).join("") || "<p>Nenhuma</p>"}
    </div>
    <div class="card">
      <strong>Próximos Dias:</strong>
      ${futuroList.map(r => `<div>${r.nomeLoja} - ${r.data}</div>`).join("") || "<p>Nenhuma</p>"}
    </div>
  `;

  graficoLojas.innerHTML = `
    <div class="card">
      <strong>Resultados:</strong>
      ${Object.entries(resultados).map(([res, list]) => `
        <details>
          <summary>${res}: ${list.length}</summary>
          ${list.map(l => `<div>${l.nomeLoja} - ${l.cnpj}</div>`).join("")}
        </details>
      `).join("") || "<p>Nenhum resultado registrado</p>"}
    </div>
  `;
}

carregarTransferencias();
atualizarDashboard();
