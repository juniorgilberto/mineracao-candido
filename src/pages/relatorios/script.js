const token = localStorage.getItem("authToken");
if (!token) window.location.href = "../login/index.html";

function toggleMenu() {
  let menu = document.getElementById("menu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}

window.onload = buscarPedidos;

function buscarPedidos() {
  const busca = document.getElementById("busca").value;
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;
  const material = document.getElementById("filtroMaterial").value;
  const placa = document.getElementById("filtroPlaca").value;
  const status = document.getElementById("filtroStatus").value;

  const params = new URLSearchParams();

  if (busca) {
    if (!isNaN(busca)) {
      params.append("clienteId", busca);
    } else {
      params.append("clienteNome", busca);
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
        atualizarTotais(0, 0, 0, 0, 0, 0, 0, 0); // zera totais
        return;
      }

      let cargasTerra = 0,
        m3Terra = 0,
        valorTerra = 0,
        totalViagensTerra = 0;
      let cargasCascalho = 0,
        m3Cascalho = 0,
        valorCascalho = 0,
        totalViagensCascalho = 0;

      dados.forEach((pedido) => {
        const produto = pedido.produto?.nome?.toUpperCase();
        const produtoValor = pedido.produto?.valor;
        const viagens = parseInt(pedido.viagens);
        const m3 = parseFloat(pedido.metragem);

        if (produto === "TERRA") {
          cargasTerra += 1; // cada pedido é uma carga
          totalViagensTerra += viagens;
          m3Terra += viagens * m3;
          valorTerra += viagens * m3 * produtoValor;
        } else if (produto === "CASCALHO") {
          cargasCascalho += 1;
          totalViagensCascalho += viagens;
          m3Cascalho += viagens * m3;
          valorCascalho += viagens * m3 * produtoValor;
        }

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

      // Atualiza totais na tabela de baixo
      atualizarTotais(
        cargasTerra,
        totalViagensTerra,
        m3Terra,
        valorTerra,
        cargasCascalho,
        totalViagensCascalho,
        m3Cascalho,
        valorCascalho
      );
    })
    .catch((err) => {
      console.error("Erro ao buscar pedidos:", err);
    });
}

function atualizarTotais(
  cargasTerra, viagensTerra, m3Terra, valorTerra,
  cargasCascalho, viagensCascalho, m3Cascalho, valorCascalho
) {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Terra
  document.getElementById("cargas-terra").innerText = viagensTerra;
  document.getElementById("m3-terra").innerText = m3Terra.toFixed(2);
  document.getElementById("valor-terra").innerText = formatarMoeda(valorTerra);

  // Cascalho
  document.getElementById("cargas-cascalho").innerText = viagensCascalho;
  document.getElementById("m3-cascalho").innerText = m3Cascalho.toFixed(2);
  document.getElementById("valor-cascalho").innerText = formatarMoeda(valorCascalho);

  // Totais
  document.getElementById("cargas-total").innerText = viagensTerra + viagensCascalho;
  document.getElementById("m3-total").innerText = (m3Terra + m3Cascalho).toFixed(2);
  document.getElementById("valor-total").innerText = formatarMoeda(valorTerra + valorCascalho);
}
