<template>
  <q-page padding>
    <q-toolbar class="row q-col-gutter-md justify-around">
      <q-input
        v-model="filtro"
        dense
        placeholder="Pesquisar (cliente / placa / material...)"
        debounce="300"
        class="q-mr-sm col-md-6"
        style="max-width: 360px"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <div class="row col-md-6 justify-end items-center">
        <div class="text-subtitle1 text-grey q-mr-md">
          Hoje: {{ new Date().toLocaleDateString("pt-BR") }}
        </div>
        <q-btn
          label="+ Nova Venda"
          color="positive"
          @click="cardVenda = true"
        />
      </div>
    </q-toolbar>

    <q-dialog v-model="cardVenda">
      <q-card class="my-card">
        <q-form
          id="novaVenda"
          class="q-pa-lg"
          ref="formVendas"
          @submit.prevent="salvarVenda"
        >
          <div class="text-h6 q-pb-sm">Nova Venda</div>
          <q-select
            id="clienteSelect"
            outlined
            v-model="clientId"
            :options="clientes"
            option-value="id"
            option-label="nome"
            label="Cliente"
            emit-value
            map-options
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            outlined
            v-model="veiculoId"
            :options="veiculos"
            option-value="id"
            option-label="placa"
            emit-value
            map-options
            :disable="!clientId"
            :loading="carregandoVeiculos"
            label="Placa do Veículo"
            class="q-mt-md"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Nenhum veículo cadastrado.
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            outlined
            v-model="produtoId"
            label="Produto"
            :options="produtos"
            option-value="id"
            option-label="nome"
            emit-value
            map-options
            class="q-mt-md col-5"
          />
          <q-input
            label="M³"
            outlined
            type="number"
            v-model="metrosCubicos"
            class="q-mt-md"
          />
          <q-input
            label="Valor M³"
            prefix="R$"
            outlined
            type="number"
            v-model="valorProduto"
            option-label="nome"
            class="q-mt-md"
          />

          <div class="text-center q-mt-md">
            Valor venda: R$ {{ (valorProduto * metrosCubicos).toFixed(2) }}
          </div>

          <q-btn
            class="q-ma-md"
            :loading="carregandoNovaVenda"
            style="float: right"
            label="Salvar Venda"
            type="submit"
            color="primary"
          />
        </q-form>
      </q-card>
    </q-dialog>

    <div v-if="!pedidos.length" class="text-center text-grey-7 q-mt-xl">
      Nenhuma venda lançada no dia de hoje. Clique em <b>Nova Venda</b> para
      cadastrar uma.
    </div>
    <div v-else class="row justify-center q-mt-md q-gutter-md">
      <q-card
        v-for="cliente in pedidosFiltrados"
        :key="cliente.nome"
        class="q-pa-md col-12 col-md-5 col-lg-3"
        flat
        bordered
      >
        <div class="text-h6 text-primary text-bold">
          {{ cliente.nome }}
        </div>

        <div class="text-caption q-mb-sm">
          {{ Object.keys(cliente.detalhes).length }} caminhão(ões)
        </div>

        <q-separator />

        <q-card-section
          v-for="(v, chave, index) in cliente.detalhes"
          :key="chave"
          class="q-pa-none"
        >
          <q-separator v-if="index !== 0" />

          <div class="row justify-between items-center q-pa-md">
            <div>
              <div class="text-bold">{{ v.placa }}</div>
              <div class="text-grey-7">
                {{ v.produto }} • {{ v.metragem }} m³
              </div>
              <div class="text-grey-7">
                Carga: R$ {{ (v.metragem * v.produtoValor).toFixed(2) }}
              </div>
            </div>

            <div class="row items-center">
              <q-badge color="blue-2" text-color="primary" class="q-mr-md">
                {{ v.viagens }} viagem(s)
              </q-badge>
              <q-btn
                size="md"
                color="primary"
                unelevated
                label="+ VIAGEM"
                @click="abrirModal(v, cliente)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="modalConfirmacao">
      <q-card style="min-width: 350px">
        <div class="text-h6 q-pa-md">Confirmar Viagem</div>
        <q-separator />
        <q-card-section>
          <div><b>Cliente:</b> {{ pedidoSelecionado?.nome }}</div>
          <div>
            <b>Placa:</b> {{ pedidoSelecionado?.detalhes.placa || "SEM PLACA" }}
          </div>
          <div>
            <b>Metragem:</b> {{ pedidoSelecionado?.detalhes.metragem }} m³
          </div>
          <div>
            <b>Valor:</b> R$ {{ pedidoSelecionado?.detalhes.produtoValor }}
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-md" align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            :loading="carregandoDetalhes"
            label="Confirmar"
            color="primary"
            @click="confirmarViagem"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { api } from "src/boot/axios";
import { ref, watch, onMounted, computed } from "vue";
import { useQuasar } from "quasar";

const $q = useQuasar();
const filtro = ref("");
const clientes = ref([]);
const clientId = ref(null);
const veiculos = ref([]);
const veiculoId = ref(null);
const produtos = ref([]);
const produtoId = ref(null);
const pedidos = ref([]);
const metrosCubicos = ref(null);
const valorProduto = ref(null);
const formVendas = ref(null);
const carregandoDetalhes = ref(false);
const carregandoNovaVenda = ref(false);

const carregandoVeiculos = ref(false);
const cardVenda = ref(false);
const modalConfirmacao = ref(false);
const pedidoSelecionado = ref({});

const pedidosFiltrados = computed(() => {
  const termo = filtro.value.toLowerCase().trim();

  if (!termo) return pedidos.value;

  return pedidos.value
    .map((cliente) => {
      // 1. Filtramos as entradas do objeto "detalhes"
      const detalhesFiltrados = Object.fromEntries(
        Object.entries(cliente.detalhes || {}).filter(([chave, detalhe]) => {
          const placa = detalhe.placa?.toLowerCase() || "";
          const produto = detalhe.produto?.toLowerCase() || "";

          return placa.includes(termo) || produto.includes(termo);
        })
      );

      // 2. Verificamos se o nome do cliente bate com a busca
      const nomeClienteBate = cliente.nome.toLowerCase().includes(termo);

      // 3. Verificamos se restou algum detalhe após o filtro
      const temDetalhesFiltrados = Object.keys(detalhesFiltrados).length > 0;

      // Se o nome do cliente bater, retornamos ele com TODOS os detalhes
      if (nomeClienteBate) {
        return cliente;
      }

      // Se o nome NÃO bater, mas ele tiver detalhes que batem (placa ou produto)
      // retornamos o cliente apenas com os detalhes filtrados
      if (temDetalhesFiltrados) {
        return {
          ...cliente,
          detalhes: detalhesFiltrados,
        };
      }

      return null;
    })
    .filter((c) => c !== null); // Remove os clientes que não bateram em nada
});

function abrirModal(detalhes, cliente) {
  if (!cliente || !detalhes) return;
  pedidoSelecionado.value = {
    nome: cliente.nome,
    clientId: cliente.clienteId,
    detalhes: { ...detalhes },
  };
  console.log(pedidoSelecionado.value);

  modalConfirmacao.value = true;
}

async function confirmarViagem() {
  if (carregandoDetalhes.value) return; // Evita múltiplos cliques

  carregandoDetalhes.value = true;
  try {
    const { clientId, detalhes } = pedidoSelecionado.value;
    const { produtoId, veiculoId, metragem, produtoValor } = detalhes;
    await api.post("/pedidos", {
      clientId,
      produtoId,
      veiculoId,
      metragem,
      produtoValor,
    });
    $q.notify({
      type: "positive",
      message: "Viagem confirmada com sucesso!",
      timeout: 2000,
    });
    modalConfirmacao.value = false; // Fecha apenas no sucesso
    await carregarPedidos(); // Aguarda a atualização da lista
  } catch (error) {
    console.error("Erro ao confirmar viagem:", error);
    $q.notify({
      type: "negative",
      message:
        error.response?.data?.message ||
        "Erro ao confirmar viagem. Tente novamente.",
    });
  } finally {
    carregandoDetalhes.value = false;
  }
}

async function carregarCliente() {
  try {
    const { data } = await api.get("/clients");
    clientes.value = data;
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
  }
}

async function carregarVeiculos(clientId) {
  carregandoVeiculos.value = true;
  try {
    const { data } = await api.get("/veiculos", {
      params: { clientId: clientId },
    });
    veiculos.value = Array.isArray(data) ? data : data.veiculos;
  } catch (error) {
    console.error("Erro ao carregar veículos:", error);
  } finally {
    carregandoVeiculos.value = false;
  }
}

async function carregarProduto() {
  try {
    const { data } = await api.get("/produtos");
    produtos.value = data;
  } catch (error) {
    console.error("Erro ao carregar materiais:", error);
  }
}

async function getPedidos() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data } = await api.get("/pedidos/agrupados", {
    params: {
      from: hoje,
      to: hoje,
    },
  });
  return data;
}

async function carregarPedidos() {
  const hide = $q.loading.show({
    message: "Carregando pedidos...",
  });

  try {
    pedidos.value = await getPedidos();
  } finally {
    hide();
  }
}

const salvarVenda = async () => {
  if (carregandoNovaVenda.value) return;

  carregandoNovaVenda.value = true;
  try {
    await api.post("/pedidos", {
      clientId: clientId.value,
      veiculoId: veiculoId.value,
      produtoId: produtoId.value,
      metragem: metrosCubicos.value,
      produto_valor: valorProduto.value,
    });
    $q.notify({
      type: "positive",
      message: "Venda cadastrada com sucesso!",
    });
    cardVenda.value = false;
    carregarPedidos();
  } catch (error) {
    console.error("Erro ao salvar venda:", error);
    $q.notify({
      type: "negative",
      message: "Erro ao cadastrar venda. Tente novamente.",
    });
  } finally {
    carregandoNovaVenda.value = false;
    formVendas.value.reset();
  }
};

watch(clientId, (id) => {
  veiculoId.value = null;
  veiculos.value = [];

  if (!id) return;

  carregarVeiculos(id);
});

watch(veiculoId, (id) => {
  if (!id) {
    metrosCubicos.value = null;
    return;
  }

  const veiculo = veiculos.value.find((v) => v.id === id);
  metrosCubicos.value = veiculo?.metragem || null;
});

watch(produtoId, (id) => {
  if (!id) {
    valorProduto.value = null;
    return;
  }

  const produto = produtos.value.find((p) => p.id === id);
  valorProduto.value = produto.valor_m3 || null;
  valorProduto.value = Number(valorProduto.value).toFixed(2);
});
carregarCliente(), carregarProduto();

onMounted(carregarPedidos);
</script>

<style scoped>
.my-card {
  width: 480px;
}

.q-card {
  border-radius: 14px;
}
</style>
