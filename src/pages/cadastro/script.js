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