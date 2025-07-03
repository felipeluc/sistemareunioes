import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔒 Captura o nome do consultor (ex: via localStorage após login)
const consultorLogado = localStorage.getItem("usuarioLogado") || "Gabriel"; // fallback para Gabriel

document.getElementById("boasVindas").textContent = `Bem-vindo(a), ${consultorLogado}`;

const listaReunioes = document.getElementById("listaReunioes");
const reunioesDia = document.getElementById("reunioesDia");
const reunioesProximas = document.getElementById("reunioesProximas");
const listaFechamentos = document.getElementById("listaFechamentos");

// 📦 Função para carregar reuniões pendentes
async function carregarReunioesPendentes() {
  listaReunioes.innerHTML = "<p>Carregando...</p>";
  const q = query(collection(db, "reunioes"), where("consultor", "==", consultorLogado), where("status", "==", "pendente"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    listaReunioes.innerHTML = "<p>Nenhuma reunião pendente.</p>";
    return;
  }

  let html = "";
  snapshot.forEach(docSnap => {
    const r = docSnap.data();
    html += `
      <div class="card">
        <h4>${r.nomeLoja || "Loja sem nome"}</h4>
        <p><strong>Segmento:</strong> ${r.segmento || "-"}</p>
        <p><strong>Horário:</strong> ${r.horario || "-"}</p>
        <p><strong>Cidade:</strong> ${r.cidade || "-"} - ${r.estado || "-"}</p>
        <button onclick="mostrarDetalhes('${docSnap.id}')">Ver Detalhes</button>
        <button onclick="aceitarReuniao('${docSnap.id}')">Aceitar</button>
        <button onclick="transferirReuniao('${docSnap.id}')">Solicitar Transferência</button>
      </div>
    `;
  });

  listaReunioes.innerHTML = html;
}

// 👀 Mostrar todos os dados da reunião
window.mostrarDetalhes = async function(id) {
  const docRef = doc(db, "reunioes", id);
  const snap = await getDocs(query(collection(db, "reunioes"), where("__name__", "==", id)));
  const r = snap.docs[0].data();

  alert(`
Loja: ${r.nomeLoja}
Cidade: ${r.cidade} - ${r.estado}
Horário: ${r.horario}
Segmento: ${r.segmento}
CNPJ: ${r.cnpj}
Qtd Lojas: ${r.qtdLojas}
Link: ${r.link}
Origem: ${r.origem}
Canal: ${r.canal}
Contato: ${r.contato}
Conversa com: ${r.responsavelConversa}
  `);
};

// ✅ Aceitar reunião
window.aceitarReuniao = async function(id) {
  const status = prompt("Status: interessado, aguardando pagamento, aguardando documentação, não teve interesse");
  if (!status) return;

  const update = { status };
  if (status === "não teve interesse") {
    const motivo = prompt("Motivo:");
    if (!motivo) return;
    update.motivo = motivo;
  }

  await updateDoc(doc(db, "reunioes", id), update);
  alert("Reunião atualizada.");
  carregarReunioesPendentes();
}

// 🔁 Solicitar transferência
window.transferirReuniao = async function(id) {
  await updateDoc(doc(db, "reunioes", id), { status: "transferencia" });
  alert("Transferência solicitada.");
  carregarReunioesPendentes();
}

// 📋 Carregar fechamentos
async function carregarFechamentos() {
  listaFechamentos.innerHTML = "<p>Carregando...</p>";
  const q = query(collection(db, "fechamentos"));
  const snap = await getDocs(q);

  let html = "";
  snap.forEach(doc => {
    const f = doc.data();
    html += `
      <div class="card">
        <strong>${f.lojista}</strong><br/>
        ${f.cidade} - ${f.estado} | Lojas: ${f.qtdLojas}<br/>
        Faturamento: R$ ${f.faturamento} | Crediário: ${f.crediario} (R$ ${f.valorCrediario})<br/>
        Origem: ${f.origem} | Adesão: R$ ${f.adesao}
      </div>
    `;
  });

  listaFechamentos.innerHTML = html || "<p>Nenhum fechamento encontrado.</p>";
}

// Inicialização
carregarReunioesPendentes();
carregarFechamentos();
