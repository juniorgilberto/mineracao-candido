const token = localStorage.getItem("authToken");
if (!token) window.location.href = "../login/index.html";

window.onload = buscarPedidos;

function buscarPedidos() {
  const busca = document.getElementById("busca").value;
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;
  const material = document.getElementById("filtroMaterial").value;
  const placa = document.getElementById("filtroPlaca").value;
  const status = document.getElementById("filtroStatus").value;

  const params = new URLSearchParams();

  // Se for buscar por nome do cliente (ajuste aqui se for ID ou nome)
  if (busca) {
    if (!isNaN(busca)) {
      params.append("clienteId", busca); // número = ID
    } else {
      params.append("clienteNome", busca); // texto = nome
    }
  }

  if (dataInicio) params.append("dataInicio", dataInicio);
  if (dataFim) params.append("dataFim", dataFim);
  if (material) params.append("produtoNome", material);
  if (placa) params.append("veiculo", placa);
  if (status) params.append("status", status);

  fetch(
    `https://mineracao-candido-api.vercel.app/pedidos?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((res) => res.json())
    .then((dados) => {
      const tabela = document.getElementById("tabelaPedidos");
      tabela.innerHTML = "";

      if (dados.length === 0) {
        tabela.innerHTML =
          '<tr><td colspan="8" class="text-center">Nenhum pedido encontrado</td></tr>';
        return;
      }

      dados.forEach((pedido) => {
        tabela.innerHTML += `
            <tr>
              <td>${pedido.id}</td>
              <td>${pedido.cliente?.nome || "---"}</td>
              <td>${pedido.produto?.nome || "---"}</td>
              <td>${pedido.veiculo || "---"}</td>
              <td>${pedido.metragem}</td>
              <td>${pedido.viagens}</td>
              <td>${pedido.status}</td>
              <td>${new Date(pedido.data).toLocaleDateString()}</td>
            </tr>
          `;
      });
    })
    .catch((err) => {
      console.error("Erro ao buscar pedidos:", err);
    });
}
