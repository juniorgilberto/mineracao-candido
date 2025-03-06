// Verifica se o token está presente no localStorage
const token = localStorage.getItem("authToken");

if (!token) {
    // Redireciona para a página de login se o token não existir
    window.location.href = "../login/index.html";
}

const hoje = new Date();
const opcoes = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
let dataFormatada = hoje.toLocaleDateString('pt-BR', opcoes);
dataFormatada = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

document.getElementById("data").textContent = dataFormatada;

