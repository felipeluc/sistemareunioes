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
  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Erro ao agendar reunião");
  }
});

async function carregarTransferencias() {
  listaTransferencias.innerHTML = "";

  const q = query(collection(db, "reunioes"), where("status", "==", "transferencia"));
  const snapshot = await getDocs(q);

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
      <div><b>Solicitado por:</b> ${dados.transferidoPor || "Desconhecido"}</div>
      <label>Reenviar para:</label>
      <select id="consultor-${id}">
        <option value="">Selecionar</option>
        ${["Leticia", "Glaucia", "Marcelo", "Gabriel"]
          .filter(nome => nome !== dados.transferidoPor)
          .map(nome => `<option value="${nome}">${nome}</option>`)
          .join("")}
      </select>
      <button onclick="transferirNovamente('${id}', '${dados.transferidoPor || ""}')">Transferir</button>
    `;
    listaTransferencias.appendChild(div);
  });
}

window.transferirNovamente = async (id, transferidoPor) => {
  const select = document.getElementById(`consultor-${id}`);
  const novoConsultor = select.value;

  if (!novoConsultor) {
    alert("Selecione um consultor.");
    return;
  }

  if (novoConsultor === transferidoPor) {
    alert("Não é possível reenviar para o mesmo consultor que solicitou a transferência.");
    return;
  }

  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    consultor: novoConsultor,
    status: "pendente",
    transferidoPor: null
  });

  alert("Transferência realizada.");
  carregarTransferencias();
};

carregarTransferencias();
