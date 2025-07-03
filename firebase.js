<script type="module">
  import { db, collection, getDocs } from "./firebase.js";

  async function carregarReunioes() {
    const usuario = localStorage.getItem("user");

    const q = collection(db, "reunioes");
    const snapshot = await getDocs(q);

    const container = document.getElementById("pendentes");
    container.innerHTML = "<div class='header'>Reuniões Pendentes</div>";

    snapshot.forEach(doc => {
      const dados = doc.data();
      if (dados.consultor === usuario && dados.status === "pendente") {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${dados.nome}</h3>
          <p>Segmento: ${dados.segmento}</p>
          <p>Horário: ${dados.horario}</p>
          <button class="btn">Aceitar</button>
          <button class="btn">Transferir</button>
        `;
        container.appendChild(card);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", carregarReunioes);
</script>
