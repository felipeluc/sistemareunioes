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
    atualizarDashboard();
  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Erro ao agendar reunião");
  }
});

async function carregarTransferencias() {
  const q = query(collection(db, "reunioes"), where("status", "==", "transferencia"));
  const snapshot = await getDocs(q);

  listaTransferencias.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${dados.nomeLoja}</strong>
      <p><b>Cidade:</b> ${dados.cidade}</p>
      <p><b>Estado:</b> ${dados.estado}</p>
      <p><b>Solicitado por:</b> ${dados.transferidoPor || "Desconhecido"}</p>
      <select class="novo-consultor">
        <option value="">Transferir para...</option>
        <option value="Leticia">Leticia</option>
        <option value="Glaucia">Glaucia</option>
        <option value="Marcelo">Marcelo</option>
        <option value="Gabriel">Gabriel</option>
      </select>
      <button class="btn-transferir">Transferir</button>
    `;

    const select = div.querySelector(".novo-consultor");
    const btn = div.querySelector(".btn-transferir");

    btn.onclick = async () => {
      const novoConsultor = select.value;
      if (!novoConsultor) return alert("Selecione o consultor de destino");

      await updateDoc(doc(db, "reunioes", docSnap.id), {
        consultor: novoConsultor,
        status: "pendente",
        transferidoPor: null
      });

      carregarTransferencias();
    };

    listaTransferencias.appendChild(div);
  });
}

carregarTransferencias();

function atualizarDashboard() {
  contarReunioesPorPeriodo();
  contarLojasPorPeriodo();
  mostrarResultadosDashboard();
}

async function contarReunioesPorPeriodo() {
  const q = collection(db, "reunioes");
  const snapshot = await getDocs(q);

  let total = 0;
  snapshot.forEach(() => total++);

  graficoReunioes.innerHTML = `
    <div class="dashboard-box">
      <h3>Total de Reuniões</h3>
      <p>${total}</p>
    </div>
  `;
}

async function contarLojasPorPeriodo() {
  const q = collection(db, "reunioes");
  const snapshot = await getDocs(q);

  let total = 0;
  snapshot.forEach((doc) => {
    const dados = doc.data();
    if (dados.qtdLojas) total += parseInt(dados.qtdLojas);
  });

  graficoLojas.innerHTML = `
    <div class="dashboard-box">
      <h3>Total de Lojas</h3>
      <p>${total}</p>
    </div>
  `;
}

async function mostrarResultadosDashboard(filtro = "todos") {
  const q = collection(db, "reunioes");
  const snapshot = await getDocs(q);

  const resultados = {};

  snapshot.forEach((doc) => {
    const r = doc.data();
    if (r.status === "realizada") {
      if (filtro !== "todos" && r.resultado !== filtro) return;

      if (!resultados[r.resultado]) resultados[r.resultado] = [];
      resultados[r.resultado].push({
        nomeLoja: r.nomeLoja || "Sem nome",
        cnpj: r.cnpj || "Não informado"
      });
    }
  });

  const container = document.getElementById("resultadosDashboard");
  container.innerHTML = "";

  const cores = {
    interessado: "#4caf50",
    aguardandoPagamento: "#fbbc05",
    aguardandoDocumentacao: "#00bcd4",
    semInteresse: "#f44336"
  };

  const titulos = {
    interessado: "Interessados",
    aguardandoPagamento: "Aguardando Pagamento",
    aguardandoDocumentacao: "Aguardando Documentação",
    semInteresse: "Sem Interesse"
  };

  for (const tipo in resultados) {
    const box = document.createElement("div");
    box.className = "dashboard-box";
    box.style.borderTop = `4px solid ${cores[tipo] || "#999"}`;

    box.innerHTML = `
      <h3>${titulos[tipo] || tipo}</h3>
      <p><strong>${resultados[tipo].length}</strong> resultado(s)</p>
      <button onclick='verDetalhesResultado(${JSON.stringify(resultados[tipo])})'>Ver Detalhes</button>
    `;

    container.appendChild(box);
  }
}

window.verDetalhesResultado = function(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    alert("Nenhuma informação disponível.");
    return;
  }

  const texto = lista
    .map(item => `Loja: ${item.nomeLoja}\nCNPJ: ${item.cnpj}`)
    .join('\n\n');

  alert(texto);
};

atualizarDashboard();
