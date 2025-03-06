document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

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
            alert("ID ou senha inválidos!");
        }
    } catch (error) {
        console.error("Erro ao conectar à API:", error);
        alert("Ocorreu um erro. Tente novamente mais tarde.");
    }
});