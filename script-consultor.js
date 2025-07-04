import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";

// Identificar o consultor logado
const usuario = localStorage.getItem("usuario");

// Elementos do DOM
const nomeUsuario = document.getElementById("nomeUsuario");
const containerPendentes = document.getElementById("reunioesPendentes");
const containerHoje = document.getElementById("reunioesHoje");
const containerProximos = document.getElementById("reunioesProximos");
const containerHistorico = document.getElementById("reunioesHistorico");
const containerFechamentos = document.getElementById("listaFechamentos");

// Nome na tela
if (nomeUsuario && usuario) nomeUsuario.innerText = usuario;

// Carregar todas as seções
carregarPendentes();
carregarAgenda();
carregarHistorico();
carregarFechamentos();

// PENDENTES
async function carregarPendentes() {
  const q = query(collection(db, "reunioes"),
    where("consultor", "==", usuario),
    where("status", "==", "pendente")
  );
  const snapshot = await getDocs(q);
  containerPendentes.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${dados.nomeLoja}</strong>
      <p>${dados.cidade} - ${dados.estado}</p>
      <p><b>Data:</b> ${dados.data} às ${dados.hora}</p>
      <p><b>Contato:</b> ${dados.contato}</p>
      <button class="btn-aceitar">Aceitar</button>
      <button class="btn-transferir">Solicitar Transferência</button>
    `;

    card.querySelector(".btn-aceitar").onclick = () => abrirModalAceite(docSnap.id);
    card.querySelector(".btn-transferir").onclick = () => solicitarTransferencia(docSnap.id);
    containerPendentes.appendChild(card);
  });
}

// ACEITAR REUNIÃO
async function abrirModalAceite(idReuniao) {
  const motivo = prompt("Digite o status da reunião:\n1 - Interessado\n2 - Aguardando Pagamento\n3 - Aguardando Documentação\n4 - Sem Interesse");
  let resultado = "";

  switch (motivo) {
    case "1": resultado = "interessado"; break;
    case "2": resultado = "aguardandoPagamento"; break;
    case "3": resultado = "aguardandoDocumentacao"; break;
    case "4":
      resultado = "semInteresse";
      const motivoTexto = prompt("Informe o motivo:");
      if (!motivoTexto) return alert("Motivo obrigatório.");
      await updateDoc(doc(db, "reunioes", idReuniao), {
        resultado,
        motivo: motivoTexto,
        status: "realizada",
        atualizadoEm: Timestamp.now()
      });
      break;
    default:
      return alert("Opção inválida.");
  }

  if (resultado !== "semInteresse") {
    await updateDoc(doc(db, "reunioes", idReuniao), {
      resultado,
      status: "realizada",
      atualizadoEm: Timestamp.now()
    });
  }

  alert("Reunião atualizada com sucesso.");
  carregarPendentes();
  carregarHistorico();
}

// TRANSFERIR
async function solicitarTransferencia(id) {
  await updateDoc(doc(db, "reunioes", id), {
    status: "transferencia",
    transferidoPor: usuario
  });
  alert("Reunião enviada para transferência.");
  carregarPendentes();
}

// AGENDA: HOJE E PRÓXIMOS DIAS
async function carregarAgenda() {
  const q = query(collection(db, "reunioes"),
    where("consultor", "==", usuario)
  );
  const snapshot = await getDocs(q);
  const hoje = new Date().toISOString().split("T")[0];

  containerHoje.innerHTML = "";
  containerProximos.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    if (dados.status !== "realizada") {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <strong>${dados.nomeLoja}</strong>
        <p>${dados.cidade} - ${dados.estado}</p>
        <p>${dados.data} às ${dados.hora}</p>
      `;

      if (dados.data === hoje) {
        containerHoje.appendChild(card);
      } else if (dados.data > hoje) {
        containerProximos.appendChild(card);
      }
    }
  });
}

// HISTÓRICO
async function carregarHistorico() {
  const q = query(collection(db, "reunioes"),
    where("consultor", "==", usuario),
    where("status", "==", "realizada")
  );
  const snapshot = await getDocs(q);
  containerHistorico.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${dados.nomeLoja}</strong>
      <p>${dados.cidade} - ${dados.estado}</p>
      <p>${dados.data} às ${dados.hora}</p>
      <p><b>Status:</b> ${dados.resultado}</p>
      ${dados.motivo ? `<p><b>Motivo:</b> ${dados.motivo}</p>` : ""}
    `;
    containerHistorico.appendChild(card);
  });
}

// FECHAMENTOS
document.getElementById("formFechamento").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const dados = {
    nomeLojista: form.nomeLojista.value,
    contato: form.contato.value,
    cidade: form.cidade.value,
    estado: form.estado.value,
    qtdLojas: parseInt(form.qtdLojas.value),
    cnpj: form.cnpj.value,
    faturamento: form.faturamento.value,
    temCrediario: form.temCrediario.value,
    valorCrediario: form.valorCrediario.value,
    origem: form.origem.value,
    consultor: usuario,
    criadoEm: Timestamp.now()
  };

  try {
    await addDoc(collection(db, "fechamentos"), dados);
    alert("Fechamento registrado com sucesso!");
    form.reset();
    carregarFechamentos();
  } catch (err) {
    console.error("Erro ao salvar fechamento", err);
    alert("Erro ao salvar fechamento.");
  }
});

async function carregarFechamentos() {
  const q = query(collection(db, "fechamentos"), where("consultor", "==", usuario));
  const snapshot = await getDocs(q);
  containerFechamentos.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const d = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${d.nomeLojista}</strong>
      <p>${d.cidade} - ${d.estado}</p>
      <p><b>Contato:</b> ${d.contato}</p>
      <p><b>CNPJ:</b> ${d.cnpj}</p>
      <p><b>Faturamento:</b> ${d.faturamento}</p>
      <p><b>Crediário:</b> ${d.temCrediario} (${d.valorCrediario})</p>
      <p><b>Origem:</b> ${d.origem}</p>
    `;
    containerFechamentos.appendChild(card);
  });
}
