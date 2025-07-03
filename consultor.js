// consultor.js
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Simular consultor logado
const usuarioAtual = sessionStorage.getItem("usuario") || "Leticia";
document.getElementById("boasVindas").textContent = `Bem-vindo(a), ${usuarioAtual}`;

// Utilitário para formatar data
function formatarData(data) {
  return new Date(data.seconds * 1000).toLocaleString("pt-BR");
}

// Carrega reuniões
async function carregarReunioes() {
  const lista = document.getElementById("listaReunioes");
  const reunioesDia = document.getElementById("reunioesDia");
  const reunioesProximas = document.getElementById("reunioesProximas");
  lista.innerHTML = reunioesDia.innerHTML = reunioesProximas.innerHTML = "<p>Carregando...</p>";

  const q = query(collection(db, "reunioes"), where("consultor", "==", usuarioAtual));
  const snap = await getDocs(q);

  let htmlPendentes = "", htmlHoje = "", htmlProximos = "";
  const hoje = new Date().toISOString().slice(0, 10);

  snap.forEach(docSnap => {
    const dados = docSnap.data();
    const id = docSnap.id;
    const dataCriada = dados.criadoEm?.toDate().toISOString().slice(0, 10);
    const card = `
      <div class="card">
        <h4>${dados.nomeLoja}</h4>
        <p><strong>Cidade:</strong> ${dados.cidade} - ${dados.estado}<br/>
        <strong>Horário:</strong> ${dados.horario}<br/>
        <strong>Contato:</strong> ${dados.contato}</p>
        ${dados.status === "pendente" ? `
          <button onclick="aceitarReuniao('${id}')">Aceitar</button>
          <button onclick="transferirReuniao('${id}')">Transferir</button>
        ` : `<p>Status: ${dados.status}</p>`}
      </div>
    `;

    if (dados.status === "pendente") htmlPendentes += card;
    else if (dataCriada === hoje) htmlHoje += card;
    else htmlProximos += card;
  });

  lista.innerHTML = htmlPendentes || "<p>Sem reuniões pendentes.</p>";
  reunioesDia.innerHTML = htmlHoje || "<p>Sem reuniões para hoje.</p>";
  reunioesProximas.innerHTML = htmlProximos || "<p>Sem próximas reuniões.</p>";
}

window.aceitarReuniao = async (id) => {
  const status = prompt("Status: Interessado, Aguardando Documentação, Não teve interesse");
  let motivo = "";
  if (status?.toLowerCase().includes("interesse")) {
    motivo = prompt("Motivo do desinteresse:");
    if (!motivo) return alert("Motivo é obrigatório.");
  }

  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    status: status?.toLowerCase(),
    motivo: motivo || null
  });

  alert("Reunião atualizada!");
  carregarReunioes();
};

window.transferirReuniao = async (id) => {
  const ref = doc(db, "reunioes", id);
  await updateDoc(ref, {
    status: "transferencia"
  });
  alert("Reunião transferida!");
  carregarReunioes();
};

carregarReunioes();
