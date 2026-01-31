import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from "src/boot/axios";

export const useFiltroStore = defineStore('filtro', {
  state: () => ({
    produtoSelecionado: localStorage.getItem('filtroProduto') || 'Todos',
    listaProdutos: ['Todos'] // Inicializa com a opção padrão
  }),
  actions: {
    async carregarProdutos() {
      try {
        const response = await api.get('/produtos'); // Sua rota de API
        // Mapeamos apenas o nome/descricao e garantimos que 'Todos' esteja no topo
        const produtosApi = response.data.map(p => p.nome);
        this.listaProdutos = ['Todos', ...produtosApi];
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    },
    setProduto(novoProduto) {
      this.produtoSelecionado = novoProduto;
      localStorage.setItem('filtroProduto', novoProduto);
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFiltroStore, import.meta.hot))
}
