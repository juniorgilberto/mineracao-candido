import { defineStore, acceptHMRUpdate } from "pinia";

export const useUsuarioStore = defineStore("usuario", {
  state: () => ({
    usuario: "",
    email: "",
    token: "",
  }),
  getters: {},
  actions: {
    setLogin({ usuario, email, token }) {
      console.log("setLogin", usuario, email, token);
      this.usuario = usuario;
      this.email = email;
      this.token = token;
    },
  },
  persist: true,
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsuarioStore, import.meta.hot));
}
