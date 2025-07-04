import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";

const userName = localStorage.getItem("usuarioLogado") || "Consultor";
document.getElementById("userName").textContent = userName;

const reunioesPendentesEl = document.getElementById("reunioesPendentes");
const reunioesAgendadasEl = document.getElementById("reunioesAgendadas");
const reunioesRealizadasEl = document.getElementById("reunioesRealizadas");

async function carregarReunioes() {
  reunioesPendentesEl.innerHTML = "<p>Carregando...</p>";
  reunioesAgendadasEl.innerHTML = "";
  reunioesRealizadasEl.innerHTML = "";

  const q = query(collection(db, "reunioes"), where("consultor", "==", userName));
  const snapshot = await getDocs(q);

  let pendentes = "";
  let agendadas = "";
  let realizadas = "";

  snapshot.forEach(docSnap => {
    const r = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${r.nomeLoja || "Sem nome"}</h3>
      <p><strong>Segmento:</strong> ${r.segmento}</p>
      <p><strong>Data:</strong> ${r.data || "-"}</p>
      <p><strong>Horário:</strong> ${r.hora || r.horario || "-"}</p>
      ${r.status === "pendente" ? `
        <button class="btn" onclick="aceitarReuniao('${id}')">Aceitar</button>
        <button class="btn" onclick="transferirParaAngela('${id}')">Transferir</button>
      ` : ""}
      <button class="btn" onclick="abrirCard(this)">Ver Detalhes</button>
      <div class="card-details">
        <p><strong>Cidade:</strong> ${r.cidade || ""}</p>
        <p><strong>Observações:</strong> ${r.observacoes || ""}</p>
        <p><strong>Criado em:</strong> ${r.criadoEm?.toDate().toLocaleString() || ""}</p>
      </div>
    `;

    if (r.status === "pendente") {
      reunioesPendentesEl.appendChild(card);
    } else if (["aceito", "interessado", "aguardando pagamento", "aguardando documentação"].includes(r.status)) {
      reunioesAgendadasEl.appendChild(card);
    } else if (["nao teve interesse", "realizada"].includes(r.status)) {
      reunioesRealizadasEl.appendChild(card);
    }
  });

  if (!reunioesPendentesEl.hasChildNodes()) reunioesPendentesEl.innerHTML = "<p>Nenhuma pendente.</p>";
  if (!reunioesAgendadasEl.hasChildNodes()) reunioesAgendadasEl.innerHTML = "<p>Nenhuma agendada.</p>";
  if (!reunioesRealizadasEl.hasChildNodes()) reunioesRealizadasEl.innerHTML = "<p>Nenhuma realizada.</p>";
}

window.abrirCard = (btn) => {
  const card = btn.closest(".card");
  card.classList.toggle("open");
};

window.aceitarReuniao = async (id) => {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: "aceito" });
  await carregarReunioes();
};

window.transferirParaAngela = async (id) => {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, { status: "transferencia" });
  await carregarReunioes();
};

carregarReunioes();
