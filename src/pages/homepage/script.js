// Redireciona para login caso o token não exista
const token = localStorage.getItem("authToken");
if (!token) window.location.href = "../login/index.html";

// Utilitários
const getElement = (id) => document.getElementById(id);

const setDefaultDate = (inputId) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  getElement(inputId).value = today;
};

const toggleMenu = () => {
  const menu = getElement("menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
};

const dateModal = () => setDefaultDate("modalDatePicker");

// Carregar lista de pedidos
const carregarPedidos = async (data) => {
  try {
    const url = new URL("https://mineracao-candido-api.vercel.app/pedidos");
    if (data) url.searchParams.append("data", data);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Erro ao buscar pedidos.");

    const pedidos = await response.json();
    const container = getElement("cardsContainer");
    container.innerHTML = "";

    pedidos.forEach(({ id, cliente, veiculo, produto, metragem, viagens }) => {
      const card = document.createElement("div");
      card.className = "col-12 col-sm-6 col-lg-4 mb-4 d-flex";
      card.innerHTML = `
        <div class="card card-pedido shadow-sm p-3 border rounded-3 position-relative w-100">
          <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2" onclick="excluirPedido(${id})">
            <i class="bi bi-trash3"></i>
          </button>
          <div class="card-body">
            <h5 class="card-title">${cliente.nome}</h5>
            <p class="card-text"><strong>Placa:</strong> ${veiculo || '-'}</p>
            <p class="card-text"><strong>Produto:</strong> ${produto.nome}</p>
            <p class="card-text"><strong>Metragem:</strong> ${metragem}</p>
            <p class="card-text"><strong>Viagens:</strong> <span id="viagens-${id}">${viagens}</span></p>
            <div class="d-flex justify-content-between mt-3">
              <button class="btn btn-outline-danger btn-sm w-100 ms-1" onclick="confirmAlterarViagens(${id}, -1)">
                <i class="bi bi-dash-circle"></i> Diminuir
              </button>
              <button class="btn btn-outline-success btn-sm w-100 ms-1" onclick="confirmAlterarViagens(${id}, 1)">
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
};

// Excluir pedido
let pedidoParaExcluir = null;

const excluirPedido = (id) => {
  pedidoParaExcluir = id;
  new bootstrap.Modal(getElement("modalConfirmDelete")).show();
};

getElement("btnConfirmarExclusao").addEventListener("click", async () => {
  if (!pedidoParaExcluir) return;

  try {
    const response = await fetch(
      `https://mineracao-candido-api.vercel.app/pedidos/${pedidoParaExcluir}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Erro ao excluir pedido.");

    bootstrap.Modal.getInstance(getElement("modalConfirmDelete")).hide();
    alert("Pedido excluído com sucesso.");
    carregarPedidos(getElement("datePicker").value);
  } catch (error) {
    console.error("Erro ao excluir pedido:", error);
    alert("Erro ao excluir pedido.");
  } finally {
    pedidoParaExcluir = null;
  }
});

// Alterar número de viagens
let pedidoIdTemp = null;
let deltaTemp = null;

const confirmAlterarViagens = (pedidoId, delta) => {
  pedidoIdTemp = pedidoId;
  deltaTemp = delta;

  getElement("acaoTexto").textContent = delta > 0 ? "aumentar" : "diminuir";
  new bootstrap.Modal(getElement("confirmModal")).show();
};

const alterarViagens = async (pedidoId, delta) => {
  const span = getElement(`viagens-${pedidoId}`);
  const valorAtual = parseInt(span.innerText);
  const novoValor = valorAtual + delta;

  if (novoValor < 0) return;

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
};

getElement("confirmarAcaoBtn").addEventListener("click", async () => {
  if (pedidoIdTemp !== null && deltaTemp !== null) {
    await alterarViagens(pedidoIdTemp, deltaTemp);
    bootstrap.Modal.getInstance(getElement("confirmModal")).hide();
    pedidoIdTemp = deltaTemp = null;
  }
});

// Carregar opções de clientes e materiais
const modalVenda = getElement("modalVenda");
const clienteSelect = getElement("selectCliente");
const materialSelect = getElement("selectMaterial");

const carregarOpcoes = async (endpoint, selectElement, labelKey = "nome") => {
  try {
    const response = await fetch(
      `https://mineracao-candido-api.vercel.app/${endpoint}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    selectElement.innerHTML = `<option selected disabled>Selecione um ${endpoint.slice(0, -1)}</option>`;
    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item[labelKey];
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error(`Erro ao carregar ${endpoint}:`, error);
  }
};

modalVenda.addEventListener("show.bs.modal", () => {
  carregarOpcoes("clientes", clienteSelect);
  carregarOpcoes("produtos", materialSelect);
});

// Lançar nova venda
getElement("btnLancarVenda").addEventListener("click", async () => {
  const clienteId = parseFloat(clienteSelect.value);
  const produtoId = parseFloat(materialSelect.value);
  const veiculo = getElement("inputVeiculo").value;
  const metragem = parseFloat(getElement("inputMetragem").value);
  const dataSelecionada = getElement("modalDatePicker").value;

  const now = new Date();
  const hora = now.toTimeString().split(" ")[0];
  const dataHoraISO = new Date(`${dataSelecionada}T${hora}Z`).toISOString();

  const venda = {
    clienteId,
    produtoId,
    veiculo,
    metragem,
    data: dataHoraISO,
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

    if (!response.ok) throw new Error("Erro ao salvar venda.");

    bootstrap.Modal.getInstance(modalVenda).hide();

    // Limpar inputs
    clienteSelect.value = "";
    materialSelect.value = "";
    getElement("inputVeiculo").value = "";
    getElement("inputMetragem").value = "";

    carregarPedidos(dataSelecionada);
  } catch (error) {
    console.error("Erro ao salvar venda:", error);
  }
});

// Inicialização
window.onload = () => {
  setDefaultDate("datePicker");
  carregarPedidos(getElement("datePicker").value);

  getElement("datePicker").addEventListener("change", (e) => {
    carregarPedidos(e.target.value);
  });
};
