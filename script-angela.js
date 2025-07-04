// script-angela.js
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

// Agendamento de nova reunião
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

// Carrega reuniões com status "transferencia"
async function carregarTransferencias() {
  listaTransferencias.innerHTML = "<p>Carregando...</p>";
  const q = query(collection(db, "reunioes"), where("status", "==", "transferencia"));
  const snapshot = await getDocs(q);

  listaTransferencias.innerHTML = "";

  if (snapshot.empty) {
    listaTransferencias.innerHTML = "<p>Sem reuniões transferidas no momento.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${dados.nomeLoja || "Sem nome"}</strong>
      <div><b>Segmento:</b> ${dados.segmento || "-"}</div>
      <div><b>Data:</b> ${dados.data || "-"}</div>
      <div><b>Horário:</b> ${dados.hora || "-"}</div>
      <label>Reenviar para:</label>
      <select id="consultor-${id}">
        <option value="">Selecionar</option>
        <option value="Leticia">Leticia</option>
        <option value="Glaucia">Glaucia</option>
        <option value="Marcelo">Marcelo</option>
        <option value="Gabriel">Gabriel</option>
      </select>
      <button onclick="transferirNovamente('${id}')">Transferir</button>
    `;
    listaTransferencias.appendChild(div);
  });
}

// Transferência de volta para outro consultor
window.transferirNovamente = async function(id) {
  const select = document.getElementById(`consultor-${id}`);
  const novoConsultor = select.value;

  if (!novoConsultor) {
    alert("Selecione um consultor para transferir.");
    return;
  }

  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    consultor: novoConsultor,
    status: "pendente"
  });

  alert("Reunião transferida com sucesso!");
  carregarTransferencias();
  atualizarDashboard();
}

// Chamada inicial ao abrir página
carregarTransferencias();

// Atualizar dashboard (placeholder)
function atualizarDashboard() {
  // ⚠️ Aqui você pode atualizar os gráficos do dashboard se quiser
}
