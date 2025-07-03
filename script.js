import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = { /* ... seu config ... */ };
initializeApp(firebaseConfig);
const db = getFirestore();

const senhas = { "Angela":"Angela1234", "Felipe":"Felipe1515", "Ana Carolina":"Ana1234", "Leticia":"Le1234", "Gabriel":"Gabriel1234", "Glaucia":"Glaucia1234", "Marcelo":"Marcelo1234" };

let usuarioLogado = "", agendamentoSelecionado = null, abaAnterior = null;

window.fazerLogin = () => {
  const u = document.getElementById("usuario").value;
  const s = document.getElementById("senha").value;
  if (senhas[u] === s) {
    usuarioLogado = u;
    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    document.querySelector("aside").style.display = "flex";
    document.getElementById("bem-vindo").innerText = `Olá, ${u}!`;

    document.querySelectorAll("nav button").forEach(b=>b.classList.add("hidden"));
    if (u === "Angela") document.querySelector("nav button.angela").classList.remove("hidden");
    else if (["Felipe","Ana Carolina"].includes(u)) document.querySelector("nav button.gerente").classList.remove("hidden");
    else document.querySelectorAll("nav button.consultor").forEach(b=>b.classList.remove("hidden"));

    window.mostrarAba(u==="Angela"?"aba-agendar":(["Felipe","Ana Carolina"].includes(u)?"aba-gerente":"aba-consultor"));
  } else document.getElementById("login-erro").innerText = "Usuário ou senha inválidos";
};

window.mostrarAba = id => {
  document.querySelectorAll(".aba").forEach(a=>a.classList.add("hidden"));
  document.getElementById(id)?.classList.remove("hidden");
  abaAnterior = id;
  if (id === "aba-consultor") carregarReunioesConsultor();
};
window.mostrarAbaAnterior = () => { if(abaAnterior) mostrarAba(abaAnterior); };

async function carregarReunioesConsultor() {
  const snap = await getDocs(collection(db,"agendamentos"));
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const pend = document.getElementById("reunioes-pendentes");
  const hojeUl = document.getElementById("reunioes-hoje");
  const fut = document.getElementById("reunioes-futuras");
  const real = document.getElementById("reunioes-realizadas");
  pend.innerHTML=hojeUl.innerHTML=fut.innerHTML=real.innerHTML="";

  snap.forEach(docSnap=>{
    const a = { id: docSnap.id, ...docSnap.data() };
    if(a.consultor !== usuarioLogado) return;
    const dt = new Date(a.horario), d0 = new Date(dt); d0.setHours(0,0,0,0);

    // já realizada
    if(a.status!=="pendente" && a.respostaConsultor==="aceito"){
      const div = criarBoxRealizado(a, dt);
      real.appendChild(div); return;
    }
    // pendente → botão
    if(a.respostaConsultor!=="aceito"){
      const btn = criarBotaoReuniao(a, dt, true);
      pend.appendChild(btn);
    } else {
      const box = criarBotaoReuniao(a, dt, false);
      if(d0.getTime()===hoje.getTime()) hojeUl.appendChild(box);
      else if(d0>hoje) fut.appendChild(box);
    }
  });
}

function criarBoxRealizado(a, dt) {
  const div = document.createElement("div");
  div.className = "reuniao-box";
  div.innerHTML = `<span>${a.nome} - ${dt.toLocaleString()}</span><span class="status-badge">${a.status}</span>`;
  return div;
}

function criarBotaoReuniao(a, dt, isPendente){
  const div = document.createElement("div");
  div.className = "reuniao-box";
  div.innerHTML = `<span>${a.nome} - ${dt.toLocaleString()}</span>`;
  div.onclick = ()=> mostrarDetalhesReuniao(a);
  if(isPendente) div.style.background = "#fff3e0";
  return div;
}

function mostrarDetalhesReuniao(a) {
  agendamentoSelecionado = a;
  document.getElementById("acoes-consultor").classList.remove("hidden");
  document.getElementById("status-consultor").classList.add("hidden");
  ["det-nome","det-cidade-estado","det-cnpj","det-contato","det-segmento","det-meio","det-link","det-comquem","det-horario"].forEach(id=>{
    document.getElementById(id).innerText = a[id.replace("det-","")=== "cidade-estado"?`${a.cidade} / ${a.estado}`:a[id.replace("det-","")]];
  });
  document.getElementById("acoes-consultor").classList.remove("hidden");
}

document.getElementById("btn-aceitar").onclick = async ()=>{
  if(!agendamentoSelecionado) return;
  await updateDoc(doc(db,"agendamentos",agendamentoSelecionado.id),{respostaConsultor:"aceito"});
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};

document.getElementById("btn-enviar-status").onclick = async ()=>{
  const s = document.getElementById("status-opcao").value;
  const m = document.getElementById("motivo-sem-interesse").value;
  const upd = { status:s };
  if(s==="Não teve interesse") upd.motivo = m;
  await updateDoc(doc(db,"agendamentos",agendamentoSelecionado.id),upd);
  carregarReunioesConsultor();
  document.getElementById("status-opcao").value="";
  document.getElementById("motivo-sem-interesse").classList.add("hidden");
};

document.getElementById("status-opcao").onchange = e=>{
  document.getElementById("motivo-sem-interesse").classList.toggle("hidden", e.target.value!=="Não teve interesse");
};

document.getElementById("btn-transferir").onclick = async ()=>{
  if(!agendamentoSelecionado) return;
  await updateDoc(doc(db,"agendamentos",agendamentoSelecionado.id),{respostaConsultor:"transferir"});
  carregarReunioesConsultor();
  document.getElementById("acoes-consultor").classList.add("hidden");
};
