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
    
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        
        const nome = document.getElementById("nome").value;
        const cpfCnpj = document.getElementById("cpf_cnpj").value;
        const inscricaoEstadual = document.getElementById("inscricao_estadual").value;
        const telefone = document.getElementById("telefone").value;
        const email = document.getElementById("email").value;
        const endereco = document.getElementById("endereco").value;
        
        const newRow = document.createElement("tr");
        newRow.innerHTML = `<td>${nome}</td><td>${cpfCnpj}</td><td>${inscricaoEstadual}</td><td>${telefone}</td><td>${email}</td><td>${endereco}</td>`;
        tabelaBody.appendChild(newRow);
        
        form.reset();
        var modal = bootstrap.Modal.getInstance(document.getElementById('clienteModal'));
        modal.hide();
    });
});