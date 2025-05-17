// Verifica se o token está presente no localStorage
const token = localStorage.getItem("authToken");

if (!token) {
  // Redireciona para a página de login se o token não existir
  window.location.href = "../login/index.html";
}

function setDefaultDate(inputId) {
  let now = new Date();

  let year = now.getFullYear();
  let month = String(now.getMonth() + 1).padStart(2, "0");
  let day = String(now.getDate()).padStart(2, "0");

  let today = `${year}-${month}-${day}`;
  document.getElementById(inputId).value = today;
}
function toggleMenu() {
  let menu = document.getElementById("menu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}
function dateModal() {
  setDefaultDate("modalDatePicker");
}
async function carregarPedidos(data) {
  try {
    const url = new URL("https://mineracao-candido-api.vercel.app/pedidos");
    if (data) url.searchParams.append("data", data);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Erro ao buscar pedidos.");

    const pedidos = await response.json();

    const container = document.getElementById("cardsContainer");
    container.innerHTML = ""; // limpa antes de renderizar

    pedidos.forEach((pedido) => {
      const card = document.createElement("div");
      card.className = "col-md-4";
      card.innerHTML = `
        <div class="card shadow-sm p-3 border rounded-3">
          <div class="card-body">
            <h5 class="card-title">${pedido.cliente.nome}</h5>
            <p class="card-text"><strong>Placa:</strong> ${pedido.veiculo}</p>
            <p class="card-text"><strong>Produto:</strong> ${pedido.produto.nome}</p>
            <p class="card-text"><strong>Metragem:</strong> ${pedido.metragem}</p>
            <p class="card-text"><strong>Viagens:</strong> <span id="viagens-${pedido.id}">${pedido.viagens}</span></p>
            <div class="d-flex justify-content-between mt-3">
              <button class="btn btn-outline-danger btn-sm" onclick="confirmAlterarViagens(${pedido.id}, -1)">
                <i class="bi bi-dash-circle"></i> Diminuir
              </button>
              <button class="btn btn-outline-success btn-sm" onclick="confirmAlterarViagens(${pedido.id}, 1)">
                <i class="bi bi-plus-circle"></i> Aumentar
              </button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
  }
}



window.onload = function () {
  setDefaultDate("datePicker");

  // Quando o usuário muda a data, recarrega os pedidos
  document.getElementById("datePicker").addEventListener("change", function () {
    const dataSelecionada = this.value;
    carregarPedidos(dataSelecionada); // agora passando a data
  });

  // Primeira carga com a data de hoje
  carregarPedidos(document.getElementById("datePicker").value);
};
let pedidoIdTemp = null;
let deltaTemp = null;
async function confirmAlterarViagens(pedidoId, delta) {
  pedidoIdTemp = pedidoId;
  deltaTemp = delta;

  // Atualiza o texto do modal
  const textoAcao = delta > 0 ? "aumentar" : "diminuir";
  document.getElementById("acaoTexto").textContent = textoAcao;

  // Abre o modal
  const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
  modal.show();
}

async function alterarViagens(pedidoId, delta) {
  const span = document.getElementById(`viagens-${pedidoId}`);
  let valorAtual = parseInt(span.innerText);
  let novoValor = valorAtual + delta;

  if (novoValor < 0) return; // impede valores negativos

  try {
    const response = await fetch(
      `https://mineracao-candido-api.vercel.app/pedidos/${pedidoId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ viagens: novoValor }),
      }
    );

    if (!response.ok) throw new Error("Erro ao atualizar viagens.");

    span.innerText = novoValor;
  } catch (error) {
    console.error("Erro ao atualizar viagens:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modalVenda");
  const clienteSelect = modal.querySelector("#selectCliente");
  const materialSelect = modal.querySelector("#selectMaterial");

  async function carregarOpcoes(endpoint, selectElement, labelKey = "nome") {
    try {
      const response = await fetch(
        `https://mineracao-candido-api.vercel.app/${endpoint}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item[labelKey];
        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error(`Erro ao carregar ${endpoint}:`, error);
    }
  }

  modal.addEventListener("show.bs.modal", () => {
    clienteSelect.innerHTML =
      "<option selected disabled>Selecione um cliente</option>";
    materialSelect.innerHTML =
      "<option selected disabled>Selecione o material</option>";

    carregarOpcoes("clientes", clienteSelect);
    carregarOpcoes("produtos", materialSelect);
  });

  const btnLancar = document.getElementById("btnLancarVenda");

  btnLancar.addEventListener("click", async () => {
    const clienteSelect = document.getElementById("selectCliente");
    const veiculoInput = document.getElementById("inputVeiculo");
    const materialSelect = document.getElementById("selectMaterial");
    const metragemInput = document.querySelector("#inputMetragem");
    const dataInput = document.getElementById("modalDatePicker");
    const dataSelecionada = dataInput.value;

    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, "0");
    const minutos = agora.getMinutes().toString().padStart(2, "0");
    const segundos = agora.getSeconds().toString().padStart(2, "0");

    const dataComHora = new Date(
      `${dataSelecionada}T${hora}:${minutos}:${segundos}Z`
    ).toISOString();

    const venda = {
      clienteId: parseFloat(clienteSelect.value),
      veiculo: veiculoInput.value,
      produtoId: parseFloat(materialSelect.value),
      metragem: parseFloat(metragemInput.value),
      data: dataComHora,
      status: "pendente",
      viagens: 1,
    };

    try {
      const response = await fetch(
        "https://mineracao-candido-api.vercel.app/pedidos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(venda),
        }
      );

      console.log(venda);

      if (!response.ok) throw new Error("Erro ao salvar venda no banco.");
      const modalEl = bootstrap.Modal.getInstance(
        document.getElementById("modalVenda")
      );
      modalEl.hide();
    } catch (error) {
      console.log("Erro ao salvar venda: " + error.message);
    }
  });

  document
    .getElementById("confirmarAcaoBtn")
    .addEventListener("click", async () => {
      if (pedidoIdTemp !== null && deltaTemp !== null) {
        await alterarViagens(pedidoIdTemp, deltaTemp);

        // Fecha o modal após a confirmação
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("confirmModal")
        );
        modal.hide();

        // Limpa variáveis temporárias
        pedidoIdTemp = null;
        deltaTemp = null;
      }
    });
  carregarPedidos();
});
