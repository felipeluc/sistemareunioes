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
    carregarTransferencias(); // atualiza lista após agendamento também
  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Erro ao agendar reunião");
  }
});

async function carregarTransferencias() {
  const q = query(collection(db, "reunioes"), where("status", "==", "transferencia"));
  const snapshot = await getDocs(q);

  listaTransferencias.innerHTML = "";

  if (snapshot.empty) {
    listaTransferencias.innerHTML = "<p>Nenhuma transferência encontrada.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <strong>${dados.nomeLoja || "Loja sem nome"}</strong>
      <p><b>Cidade:</b> ${dados.cidade || "-"}</p>
      <p><b>Estado:</b> ${dados.estado || "-"}</p>
      <p><b>Solicitado por:</b> ${dados.transferidoPor || "Desconhecido"}</p>
    `;

    const select = document.createElement("select");
    select.innerHTML = `
      <option value="">Selecionar novo consultor</option>
      <option value="Leticia">Leticia</option>
      <option value="Glaucia">Glaucia</option>
      <option value="Marcelo">Marcelo</option>
      <option value="Gabriel">Gabriel</option>
    `;

    const botaoReenviar = document.createElement("button");
    botaoReenviar.textContent = "Transferir";
    botaoReenviar.onclick = async () => {
      const novoConsultor = select.value;
      if (!novoConsultor) {
        alert("Selecione um consultor para transferir");
        return;
      }

      await updateDoc(doc(db, "reunioes", id), {
        consultor: novoConsultor,
        status: "pendente",
        transferidoPor: null
      });

      alert("Reunião transferida com sucesso");
      carregarTransferencias();
    };

    div.appendChild(select);
    div.appendChild(botaoReenviar);

    listaTransferencias.appendChild(div);
  });
}

carregarTransferencias();
