
import { db, collection, query, where, getDocs, updateDoc, doc } from './firebase.js';

const user = localStorage.getItem("user");

async function carregarPendentes() {
  const lista = document.getElementById("listaPendentes");
  lista.innerHTML = "<p>Carregando...</p>";
  const q = query(collection(db, "reunioes"), where("consultor", "==", user), where("status", "==", "pendente"));
  const querySnapshot = await getDocs(q);
  lista.innerHTML = "";
  querySnapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${dados.nome}</h3>
      <p>Horário: ${dados.horario}</p>
      <p>Cidade: ${dados.cidade} - ${dados.estado}</p>
      <button class="btn" onclick="aceitar('${docSnap.id}')">Aceitar</button>
      <button class="btn" onclick="transferir('${docSnap.id}')">Transferir</button>
    `;
    lista.appendChild(div);
  });
}

window.aceitar = async function(id) {
  await updateDoc(doc(db, "reunioes", id), { status: "agendado" });
  alert("Reunião aceita!");
  carregarPendentes();
};

window.transferir = async function(id) {
  await updateDoc(doc(db, "reunioes", id), { status: "transferir" });
  alert("Solicitado transferência!");
  carregarPendentes();
};

carregarPendentes();
