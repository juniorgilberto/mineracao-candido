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
        const response = await fetch('https://mineracao-candido-api.vercel.app/clientes', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        const tbody = document.querySelector('#tabela-clientes tbody');
        tbody.innerHTML = '';

        data.forEach(cliente => {
            const tr = document.createElement('tr');

            const nome = cliente.nome || "";
            const cpfCnpj = cliente.cpfCnpj || "";
            const inscricaoEstadual = cliente.inscricaoEstadual || "";
            const telefone = cliente.telefone || "";
            const email = cliente.email || "";
            const endereco = cliente.endereco || "";
            const veiculos = cliente.veiculos && cliente.veiculos.length
                ? cliente.veiculos.map(veiculo => `<li class="dropdown-item">${veiculo}</li>`).join('')
                : '<li class="dropdown-item text-muted">Nenhum veículo</li>';

            tr.innerHTML = `
                <td>${nome}</td>
                <td>${cpfCnpj}</td>
                <td>${inscricaoEstadual}</td>
                <td>${telefone}</td>
                <td>${email}</td>
                <td>${endereco}</td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Veículos
                        </button>
                        <ul class="dropdown-menu">
                            ${veiculos}
                        </ul>
                        <button class="btn btn-success btn-sm mt-2" data-bs-toggle="modal" data-bs-target="#veiculoModal">
                            Adicionar
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

        atualizarCards(); // Atualiza os cards depois de carregar
    } catch (error) {
        console.error('Erro ao buscar os clientes:', error);
    }
}

//CASO MEU DISPOSITIVO SEJA MENOR, CONVERTE MINHA TABELA DE CLIENTES PARA CARDS
function atualizarCards() {
    const tabelaBody = document.querySelector("#tabela-clientes tbody");
    const cardsContainer = document.querySelector("#cards-clientes");
    
    cardsContainer.innerHTML = "";
    const linhas = tabelaBody.querySelectorAll("tr");
    linhas.forEach(tr => {
        if (tr.style.display === "none") return;
        const colunas = tr.querySelectorAll("td");
        const nome = colunas[0].innerText;
        const cpfCnpj = colunas[1].innerText;
        const inscricao = colunas[2].innerText;
        const telefone = colunas[3].innerText;
        const email = colunas[4].innerText;
        const endereco = colunas[5].innerText;

        const card = document.createElement("div");
        card.className = "card mb-3";
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${nome}</h5>
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


function abrirModalCadastrarVeiculo(clienteId) {
    // Você pode criar um modal Bootstrap ou fazer um prompt rápido para testar
    const modelo = prompt("Digite o modelo do veículo:");
    const placa = prompt("Digite a placa do veículo:");

    if (modelo && placa) {
        cadastrarVeiculo(clienteId, modelo, placa);
    }
}

async function cadastrarVeiculo(clienteId, modelo, placa) {
    try {
        const response = await fetch('https://mineracao-candido-api.vercel.app/veiculos', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                clienteId: clienteId,
                modelo: modelo,
                placa: placa
            }),
        });

        if (response.ok) {
            alert("Veículo cadastrado com sucesso!");
            carregarClientes(); // Atualiza a tabela e os cards
        } else {
            alert("Erro ao cadastrar veículo!");
        }
    } catch (error) {
        console.error('Erro ao cadastrar veículo:', error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const tabelaBody = document.querySelector("#tabela-clientes tbody");
    const filtro = document.getElementById("filtro");
    const modalElement = document.getElementById("clienteModal");

    modalElement.addEventListener('show.bs.modal', () => {
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
        const inscricaoEstadual = document.getElementById("inscricao_estadual").value;
        const telefone = document.getElementById("telefone").value;
        const email = document.getElementById("email").value;
        const endereco = document.getElementById("endereco").value;

        try {
            const response = await fetch("https://mineracao-candido-api.vercel.app/clientes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: nome,
                    cpfCnpj: cpfCnpj,
                    ie: inscricaoEstadual,
                    telefone: telefone,
                    email: email,
                    endereco: endereco
                }),
            });

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
        linhas.forEach(tr => {
            const texto = tr.innerText.toLowerCase();
            tr.style.display = texto.includes(filtroValor) ? "" : "none";
        });
        atualizarCards();
    });
});