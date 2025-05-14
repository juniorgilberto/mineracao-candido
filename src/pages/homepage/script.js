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

window.onload = function () {
  setDefaultDate("datePicker");
};

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

      const vendaSalva = await response.json();
      
      const modalEl = bootstrap.Modal.getInstance(
        document.getElementById("modalVenda")
      );
      modalEl.hide();
    } catch (error) {
      console.log("Erro ao salvar venda: " + error.message);
    }
  });
});
