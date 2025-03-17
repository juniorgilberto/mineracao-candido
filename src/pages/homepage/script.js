// Verifica se o token está presente no localStorage
const token = localStorage.getItem("authToken");

if (!token) {
    // Redireciona para a página de login se o token não existir
    window.location.href = "../login/index.html";
}

function setDefaultDate(inputId) {
    let now = new Date(); 
    
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let day = String(now.getDate()).padStart(2, '0');

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

window.onload = function() {
    setDefaultDate("datePicker");    
};


