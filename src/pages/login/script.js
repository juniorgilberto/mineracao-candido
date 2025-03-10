document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const loadingOverlay = document.getElementById("loadingOverlay");

    // Exibe o overlay de carregamento
    loadingOverlay.style.display = "flex";

    const userID = document.getElementById("userID").value;
    const userPassword = document.getElementById("userPassword").value;

    try {
        const response = await fetch("https://mineracao-candido-api.vercel.app/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: userID,
                senha: userPassword,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            const token = data.token;

            // Armazenar o token no localStorage
            localStorage.setItem("authToken", token);

            // Redireciona para a Página HOME
            window.location.href = "../homepage/index.html";
        } else {
            showErrorModal("Usuário ou senha inválidos!");
        }
    } catch (error) {
        console.error("Erro ao conectar à API:", error);
        showErrorModal("Erro ao conectar. Tente novamente.");
    } finally {
        loadingOverlay.style.display = "none";
    }
});

// Função para exibir o modal de erro
function showErrorModal(message) {
    document.getElementById("errorMessage").textContent = message;
    document.getElementById("errorModal").style.display = "flex";
}

// Função para fechar o modal de erro
function closeErrorModal() {
    document.getElementById("errorModal").style.display = "none";
}