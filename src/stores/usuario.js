import { defineStore, acceptHMRUpdate } from "pinia";
import { api } from "src/boot/axios";

export const useUsuarioStore = defineStore("usuario", {
  state: () => ({
    nome: "",
    role: "",
    token: "",
  }),
  getters: {},
  actions: {
    setLogin(payload, rememberMe) {
      this.nome = payload.nome;
      this.role = payload.role;
      this.token = payload.token;

      // Define qual storage usar baseado no "Lembrar de mim"
      const storage = rememberMe ? localStorage : sessionStorage;

      // Salva o token para recuperar quando a página atualizar
      storage.setItem("token", payload.token);
      storage.setItem(
        "user_data",
        JSON.stringify({
          nome: payload.nome,
          role: payload.role,
        }),
      );

      // Configura o axios para as próximas requisições
      api.defaults.headers.common["Authorization"] = `Bearer ${payload.token}`;
    },

    logout() {
      // 1. Limpa o estado da Store (memória)
      this.nome = null;
      this.role = null;
      this.token = null;

      // 2. Limpa o Axios
      delete api.defaults.headers.common["Authorization"];

      // 3. Limpa TODOS os storages (disco)
      localStorage.removeItem("token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("filtroProduto");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user_data");
    },

    // Importante: Função para carregar os dados ao abrir o app
    reidratarStore() {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const userData = JSON.parse(
        localStorage.getItem("user_data") ||
          sessionStorage.getItem("user_data"),
      );

      if (token && userData) {
        this.token = token;
        this.nome = userData.nome;
        this.role = userData.role;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsuarioStore, import.meta.hot));
}
