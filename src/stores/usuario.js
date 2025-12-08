import { defineStore, acceptHMRUpdate } from "pinia";

export const useUsuarioStore = defineStore("usuario", {
  state: () => ({
    nome: "",
    role: "",
    token: "",
  }),
  getters: {},
  actions: {
    setLogin({ nome, role, token }) {
      this.nome = nome;
      this.role = role;
      this.token = token;
    },
  },
  persist: true,
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsuarioStore, import.meta.hot));
}
