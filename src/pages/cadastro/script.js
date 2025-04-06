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


document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const tabelaBody = document.querySelector("#tabela-clientes tbody");
    const cardsContainer = document.querySelector("#cards-clientes");
    const filtro = document.getElementById("filtro");
    const modalElement = document.getElementById("clienteModal");

    modalElement.addEventListener('show.bs.modal', () => {
        form.reset();
        form.classList.remove("was-validated");
    });

    function atualizarCards() {
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
        const temClientesVisiveis = Array.from(tabelaBody.querySelectorAll("tr")).some(tr => tr.style.display !== "none");
        document.getElementById("sem-clientes-linha").style.display = temClientesVisiveis ? "none" : "";
        document.getElementById("sem-clientes-card").style.display = temClientesVisiveis ? "none" : "block";
    }

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
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    });

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