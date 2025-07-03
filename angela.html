// script-angela.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuração Firebase (já deve estar no firebase-config.js)
import { db } from './firebase-config.js';

const form = document.getElementById("formAgendamento");
const listaTransferencias = document.getElementById("listaTransferencias");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    consultor: form.consultor.value,
    horario: form.hora.value,
    nomeLoja: form.nomeLoja.value,
    cidade: form.cidade.value,
    link: form.linkReuniao.value,
    estado: form.estado.value,
    qtdLojas: form.qtdLojas.value,
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
  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Erro ao agendar reunião");
  }
});

// Carregar transferências
async function carregarTransferencias() {
  listaTransferencias.innerHTML = "<p>Carregando...</p>";
  const q = query(collection(db, "reunioes"), where("status", "==", "transferencia"));
  const snapshot = await getDocs(q);

  let html = "";
  snapshot.forEach((doc) => {
    const dados = doc.data();
    html += `<div style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 12px;">
      <strong>${dados.nomeLoja}</strong><br/>
      ${dados.cidade} - ${dados.estado}<br/>
      <small>${dados.horario}</small><br/>
      <button onclick="transferirOutro('${doc.id}')">Transferir para outro</button>
    </div>`;
  });

  listaTransferencias.innerHTML = html || "<p>Nenhuma transferência no momento.</p>";
}

window.transferirOutro = async (idDoc) => {
  const novo = prompt("Para qual consultor transferir?");
  if (!novo) return;

  const docRef = collection(db, "reunioes");
  const snapshot = await getDocs(query(docRef, where("status", "==", "transferencia")));
  const docToUpdate = snapshot.docs.find(doc => doc.id === idDoc);

  if (docToUpdate) {
    await docToUpdate.ref.update({ consultor: novo, status: "pendente" });
    alert("Transferido com sucesso!");
    carregarTransferencias();
  }
};

carregarTransferencias();
