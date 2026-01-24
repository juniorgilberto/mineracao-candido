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

    <q-dialog
      v-model="cardVenda"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card
        class="my-card"
        style="width: 500px; max-width: 90vw; border-radius: 12px"
      >
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6 font-weight-bold">
            <q-icon name="shopping_cart" class="q-mr-sm" size="28px" />
            Nova Venda
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-form
            id="novaVenda"
            ref="formVendas"
            @submit.prevent="salvarVenda"
            class="row q-col-gutter-md"
          >
            <div class="col-12">
              <q-select
                id="clienteSelect"
                outlined
                dense
                v-model="clientId"
                :options="clientesFiltrados"
                option-value="id"
                option-label="nome"
                label="Cliente"
                emit-value
                map-options
                bg-color="grey-1"
                use-input
                input-debounce="300"
                @filter="filtrarClientes"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Nenhum cliente encontrado
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12">
              <q-select
                outlined
                dense
                v-model="veiculoId"
                :options="veiculos"
                option-value="id"
                option-label="placa"
                emit-value
                map-options
                :disable="!clientId"
                :loading="carregandoVeiculos"
                label="Placa do Veículo"
                bg-color="grey-1"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey"
                      >Nenhum veículo cadastrado.</q-item-section
                    >
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12">
              <q-select
                outlined
                dense
                v-model="produtoId"
                label="Produto"
                :options="produtos"
                option-value="id"
                option-label="nome"
                emit-value
                map-options
                bg-color="grey-1"
              />
            </div>

            <div class="col-6">
              <q-input
                label="Quantidade (M³)"
                outlined
                dense
                type="number"
                v-model.number="metrosCubicos"
                bg-color="grey-1"
              />
            </div>
            <div class="col-6">
              <q-input
                label="Valor Unitário (M³)"
                prefix="R$"
                outlined
                dense
                type="number"
                v-model.number="valorProduto"
                bg-color="grey-1"
              />
            </div>

            <div class="col-12">
              <q-banner
                dense
                class="bg-blue-1 text-blue-9 rounded-borders text-center"
              >
                <template v-slot:avatar>
                  <q-icon name="payments" color="blue-9" />
                </template>
                <span class="text-subtitle1 text-weight-bold">
                  Total da Venda: R$
                  {{ (valorProduto * metrosCubicos).toFixed(2) }}
                </span>
              </q-banner>
            </div>

            <div class="col-12 row justify-end q-mt-sm">
              <q-btn
                flat
                label="Cancelar"
                color="grey-7"
                v-close-popup
                class="q-mr-sm"
              />
              <q-btn
                label="Salvar Venda"
                type="submit"
                color="secondary"
                unelevated
                :loading="carregandoNovaVenda"
                class="q-px-lg"
              />
            </div>
          </q-form>
        </q-card-section>
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
              <q-badge color="blue-2" text-color="primary" class="q-mr-md q-pa-sm" >
                {{ v.viagens }} viagem(ns)
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

    <q-dialog
      v-model="modalConfirmacao"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 400px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6 font-weight-bold">
            <q-icon name="check_circle" class="q-mr-sm" size="28px" />
            Confirmar Viagem
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-list class="bg-grey-1">
            <q-item>
              <q-item-section>
                <q-item-label caption>Cliente</q-item-label>
                <q-item-label class="text-weight-bold text-uppercase">
                  {{ pedidoSelecionado?.nome }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>Veículo / Placa</q-item-label>
                <q-item-label class="text-weight-bold">
                  {{ pedidoSelecionado?.detalhes.placa || "SEM PLACA" }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="q-mb-md">
              <q-item-section>
                <q-item-label caption>Metragem</q-item-label>
                <q-item-label class="text-weight-bold">
                  {{ pedidoSelecionado?.detalhes.metragem }} m³
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-item-label caption>Valor m³</q-item-label>
                <q-item-label class="text-secondary text-weight-bolder">
                  R$ {{ pedidoSelecionado?.detalhes.produtoValor.toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section class="items-center">
                <q-item-label caption>Valor total da carga</q-item-label>
                <q-item-label class="text-positive text-h6 text-weight-bold">
                  R$
                  {{
                    (
                      pedidoSelecionado?.detalhes.metragem *
                      pedidoSelecionado?.detalhes.produtoValor
                    ).toFixed(2)
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-caption text-grey-7 q-mt-md text-center">
            Certifique-se de que os dados estão corretos antes de confirmar.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
            class="q-mr-sm"
          />
          <q-btn
            unelevated
            label="Confirmar Viagem"
            color="secondary"
            :loading="carregandoDetalhes"
            @click="confirmarViagem"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { api } from "src/boot/axios";
import { ref, watch, onMounted, computed, onUnmounted } from "vue";
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

const clientesFiltrados = ref(clientes.value);

let pollingTimer = null;

const filtrarClientes = (val, update) => {
  if (val === "") {
    update(() => {
      clientesFiltrados.value = clientes.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    clientesFiltrados.value = clientes.value.filter(
      (v) => v.nome.toLowerCase().indexOf(needle) > -1,
    );
  });
};

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
        }),
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
    console.log(produtoValor);

    await api.post("/pedidos", {
      clientId,
      produto_valor: produtoValor,
      produtoId,
      veiculoId,
      metragem,
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

async function carregarDadosIniciais() {
  try {
    // Executa ambas as chamadas simultaneamente (mais rápido)
    const [resClientes, resProdutos] = await Promise.all([
      api.get("/clients"),
      api.get("/produtos")
    ]);

    // Atribui os dados após o término de ambas
    clientes.value = resClientes.data;
    produtos.value = resProdutos.data;

  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);
    // Aqui você poderia adicionar um aviso ao usuário (ex: $q.notify)
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

async function refreshDados() {
  try {
    const novosDados = await getPedidos();
    pedidos.value = novosDados;
  } catch (e) {
    console.error("Erro ao atualizar dados em segundo plano");
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
carregarDadosIniciais();
onMounted(() => {
  carregarPedidos();

  // Atualiza os dados a cada 30 segundos automaticamente
  pollingTimer = setInterval(refreshDados, 30000);
});

onUnmounted(() => {
  // Limpa o timer quando o usuário sai da página
  if (pollingTimer) clearInterval(pollingTimer);
});

</script>

<style scoped>
.my-card {
  width: 480px;
}

.q-card {
  border-radius: 14px;
}
</style>
