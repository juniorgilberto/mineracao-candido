// Verifica se o token está presente no localStorage
const token = localStorage.getItem("authToken");

if (!token) {
  // Redireciona para a página de login se o token não existir
  window.location.href = "../login/index.html";
}

function toggleMenu() {
  let menu = document.getElementById("menu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}

//SOLICITA NA API MINHA LISTA DE CLIENTES E COLOCA NA MINHA TABELA DE CLIENTES
async function carregarClientes() {
  try {
    const response = await fetch(
      "https://mineracao-candido-api.vercel.app/clientes",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const tbody = document.querySelector("#tabela-clientes tbody");
    tbody.innerHTML = "";

    data.forEach((cliente) => {
      const tr = document.createElement("tr");

      const nome = cliente.nome || "";
      const cpfCnpj = cliente.cpfCnpj || "";
      const inscricaoEstadual = cliente.ie || "";
      const telefone = cliente.telefone || "";
      const email = cliente.email || "";
      const endereco = cliente.endereco || "";
      const id = cliente.id;

      tr.innerHTML = `
                <td class="text-truncate" style="max-width: 200px;" title="${nome}">${nome}</td>
                <td>${cpfCnpj}</td>
                <td>${inscricaoEstadual}</td>
                <td>${telefone}</td>
                <td class="text-lowercase">${email}</td>
                <td class="text-truncate" style="max-width: 250px;" title="${endereco}">${endereco}</td>
                <td class="text-center">
                    <button class="btn btn-sm d-flex justify-content-center align-items-center mx-auto" style="width: 36px; height: 36px;" onclick="editarCliente(${id}); event.stopPropagation();">
                        <i class="bi bi-pencil-square text-dark"></i>
                    </button>
                </td>
            `;

      // Ao clicar na linha, abre o modal com detalhes
      tr.style.cursor = "pointer";
      tr.addEventListener("click", () => {
        mostrarDetalhesCliente(cliente);
      });

      tbody.appendChild(tr);
    });
    atualizarCards(); // Atualiza os cards depois de carregar
  } catch (error) {
    console.error("Erro ao buscar os clientes:", error);
  }
}
function mostrarDetalhesCliente(cliente) {
  const modalBody = document.getElementById("modalClienteBody");
  modalBody.innerHTML = `
        <p><strong>Nome:</strong> ${cliente.nome || ""}</p>
        <p><strong>CPF/CNPJ:</strong> ${cliente.cpfCnpj || ""}</p>
        <p><strong>Inscrição Estadual:</strong> ${
          cliente.inscricaoEstadual || ""
        }</p>
        <p><strong>Telefone:</strong> ${cliente.telefone || ""}</p>
        <p><strong>Email:</strong> ${cliente.email || ""}</p>
        <p><strong>Endereço:</strong> ${cliente.endereco || ""}</p>
    `;

  const modal = new bootstrap.Modal(
    document.getElementById("modalDetalhesCliente")
  );
  modal.show();
}

//CASO MEU DISPOSITIVO SEJA MENOR, CONVERTE MINHA TABELA DE CLIENTES PARA CARDS
function atualizarCards() {
  const tabelaBody = document.querySelector("#tabela-clientes tbody");
  const cardsContainer = document.querySelector("#cards-clientes");
  cardsContainer.innerHTML = "";
  const linhas = tabelaBody.querySelectorAll("tr");

  linhas.forEach((tr) => {
    if (tr.style.display === "none") return;

    const colunas = tr.querySelectorAll("td");
    const nome = colunas[0].innerText;
    const cpfCnpj = colunas[1].innerText;
    const inscricao = colunas[2].innerText;
    const telefone = colunas[3].innerText;
    const email = colunas[4].innerText;
    const endereco = colunas[5].innerText;
    const id = tr
      .querySelector("button")
      ?.getAttribute("onclick")
      ?.match(/\d+/)?.[0]; // extrai o ID

    const card = document.createElement("div");
    card.className = "card mb-3";

    card.innerHTML = `
            <div class="card-body position-relative">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">${nome}</h5>
                    <button class="btn btn-sm" onclick="editarCliente(${id})">
                        <i class="bi bi-pencil-square text-dark"></i>
                    </button>
                </div>
                <p class="card-text"><strong>CPF/CNPJ:</strong> ${cpfCnpj}</p>
                <p class="card-text"><strong>Inscrição Estadual:</strong> ${inscricao}</p>
                <p class="card-text"><strong>Telefone:</strong> ${telefone}</p>
                <p class="card-text"><strong>Email:</strong> ${email}</p>
                <p class="card-text"><strong>Endereço:</strong> ${endereco}</p>
            </div>
        `;

    cardsContainer.appendChild(card);
  });
}

async function editarCliente(id) {
  try {
    const response = await fetch(
      `https://mineracao-candido-api.vercel.app/clientes/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const cliente = await response.json();

    document.getElementById("editar-id").value = cliente.id;
    document.getElementById("editar-nome").value = cliente.nome;
    document.getElementById("editar-cpfCnpj").value = cliente.cpfCnpj;
    document.getElementById("editar-inscricao").value = cliente.ie;
    document.getElementById("editar-telefone").value = cliente.telefone;
    document.getElementById("editar-email").value = cliente.email;
    document.getElementById("editar-endereco").value = cliente.endereco;

    const modal = new bootstrap.Modal(
      document.getElementById("modalEditarCliente")
    );
    modal.show();
  } catch (error) {
    console.error("Erro ao carregar cliente:", error);
    alert("Erro ao carregar os dados do cliente.");
  }
}
function mostrarModalSucesso(mensagem = "Operação realizada com sucesso!") {
  const texto = document.getElementById("mensagemSucesso");
  texto.textContent = mensagem;

  const modal = new bootstrap.Modal(document.getElementById("modalSucesso"));
  modal.show();

  // Fechar automaticamente após 2 segundos (opcional)
  setTimeout(() => {
    modal.hide();
  }, 2000);
}

document
  .getElementById("formEditarCliente")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("editar-id").value;

    const dadosAtualizados = {
      nome: document.getElementById("editar-nome").value,
      cpfCnpj: document.getElementById("editar-cpfCnpj").value,
      ie: document.getElementById("editar-inscricao").value,
      telefone: document.getElementById("editar-telefone").value,
      email: document.getElementById("editar-email").value,
      endereco: document.getElementById("editar-endereco").value,
    };

    try {
      const response = await fetch(
        `https://mineracao-candido-api.vercel.app/clientes/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dadosAtualizados),
        }
      );
      console.log(dadosAtualizados);

      if (response.ok) {
        mostrarModalSucesso("Cliente atualizado com sucesso!");
        // Atualize a lista ou recarregue a página:
        setTimeout(() => {
          location.reload();
        }, 2000);
      } else {
        alert("Erro ao atualizar cliente.");
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente.");
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const tabelaBody = document.querySelector("#tabela-clientes tbody");
  const filtro = document.getElementById("filtro");
  const modalElement = document.getElementById("clienteModal");

  modalElement.addEventListener("show.bs.modal", () => {
    form.reset();
    form.classList.remove("was-validated");
  });

  carregarClientes();
  atualizarCards();

  //CADASTRO NOVO CLIENTE
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const cpfCnpj = document.getElementById("cpf_cnpj").value;
    const inscricaoEstadual =
      document.getElementById("inscricao_estadual").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;
    const endereco = document.getElementById("endereco").value;

    try {
      const response = await fetch(
        "https://mineracao-candido-api.vercel.app/clientes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome: nome,
            cpfCnpj: cpfCnpj,
            ie: inscricaoEstadual,
            telefone: telefone,
            email: email,
            endereco: endereco,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        form.reset();
        bootstrap.Modal.getInstance(modalElement).hide();
        await carregarClientes();
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  });

  //FILTRO PARA PESQUISA
  filtro.addEventListener("input", () => {
    const filtroValor = filtro.value.toLowerCase();
    const linhas = tabelaBody.querySelectorAll("tr");
    linhas.forEach((tr) => {
      const texto = tr.innerText.toLowerCase();
      tr.style.display = texto.includes(filtroValor) ? "" : "none";
    });
    atualizarCards();
  });
});
