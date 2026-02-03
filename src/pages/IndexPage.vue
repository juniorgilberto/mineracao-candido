<template>
  <q-page padding>
    <q-toolbar class="q-py-md q-px-lg">
      <div class="row full-width items-center q-col-gutter-sm">
        <div class="col-12 col-md-7 row q-gutter-md items-center">
          <q-input
            v-model="filtro"
            placeholder="Cliente ou Placa..."
            debounce="300"
            class="col-12 col-sm-grow"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="filtroStore.produtoSelecionado"
            :options="filtroStore.listaProdutos"
            label="Material"
            emit-value
            map-options
            class="col-12 col-sm-auto"
            style="min-width: 180px"
            @update:model-value="filtroStore.setProduto"
          />
        </div>

        <div
          class="col-12 col-md-5 row items-center justify-between justify-md-end q-gutter-md"
        >
          <div class="text-subtitle2 text-grey-7">
            <q-icon name="event" size="xs" class="q-mr-xs" />
            {{ new Date().toLocaleDateString("pt-BR") }}
          </div>

          <q-btn
            label="Nova Venda"
            color="positive"
            unelevated
            icon="add"
            @click="cardVenda = true"
            class="col-grow col-md-auto"
          />
        </div>
      </div>
    </q-toolbar>

    <!-- MODAL NOVA VENDA  -->
    <q-dialog
      v-model="cardVenda"
      transition-show="scale"
      transition-hide="scale"
      @hide="resetarCampos"
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

    <!-- CARDS DOS PEDIDOS  -->
    <div
      class="row justify-center q-mt-md q-gutter-md"
      v-if="pedidosFiltrados.length > 0"
    >
      <q-card
        v-for="cliente in pedidosFiltrados"
        :key="cliente.nome"
        class="col-12 col-md-5 col-lg-4 shadow-1"
        flat
        bordered
      >
        <div
          class="bg-primary text-white q-pa-md row justify-between items-center"
        >
          <div class="text-subtitle1 text-bold">{{ cliente.nome }}</div>
          <div class="text-caption">
            {{ Object.keys(cliente.detalhes).length }} caminhão(ões)
          </div>
        </div>

        <q-card-section class="q-pa-none">
          <div
            v-for="(v, chave, index) in cliente.detalhes"
            :key="chave"
            class="q-pa-md border-bottom"
          >
            <div class="row items-center no-wrap q-gutter-md">
              <div class="col-grow">
                <div
                  class="text-weight-bolder text-uppercase text-grey-9 q-mb-sm"
                >
                  <q-badge
                    outline
                    :color="obterCorProduto(v.produto)"
                    class="text-bold q-pa-xs"
                  >
                    {{ v.produto.toUpperCase() }}
                  </q-badge>
                </div>
                <div
                  class="text-caption text-primary text-bold"
                  style="font-size: 1.1em"
                >
                  {{ v.placa }}
                </div>
                <div class="text-caption text-positive text-bold">
                  Total: R$
                  {{
                    (v.metragem * v.produtoValor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })
                  }}
                </div>
              </div>

              <div
                class="col-auto text-center q-px-md q-mr-md"
                style="
                  border-left: 1px solid #ddd;
                  border-right: 1px solid #ddd;
                "
              >
                <div class="text-h6 text-bold">{{ v.metragem }}</div>
                <div class="text-caption" style="margin-top: -8px">m³</div>
              </div>

              <div class="col-auto row items-center no-wrap">
                <div
                  @click="acessarViagens(v, cliente)"
                  class="column items-center q-mr-sm"
                >
                  <span class="text-bold" style="font-size: 20px">{{
                    v.viagens
                  }}</span>
                  <span class="text-grey-7" style="font-size: 9px uppercase"
                    >Viagem(ns)</span
                  >
                </div>
                <q-btn
                  unelevated
                  color="primary"
                  icon="add"
                  :label="$q.screen.gt.xs ? 'Viagem' : ''"
                  :round="$q.screen.lt.sm"
                  size="md"
                  class="q-ml-md"
                  @click="abrirModal(v, cliente)"
                />
              </div>
            </div>

            <q-separator
              v-if="index !== Object.keys(cliente.detalhes).length - 1"
              class="q-mt-sm"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div
      v-else-if="pedidos.length === 0"
      class="column items-center justify-center q-pa-xl text-grey-7"
    >
      <q-icon name="event_busy" size="80px" color="grey-4" />
      <div class="text-h6 q-mt-md">Nenhum pedido hoje</div>
      <div class="text-caption">Ainda não foram registradas vendas hoje.</div>

      <q-btn
        label="Iniciar Primeira Venda"
        color="positive"
        unelevated
        icon="add"
        class="q-mt-lg"
        @click="cardVenda = true"
      />
    </div>

    <div v-else class="column items-center justify-center q-pa-xl text-grey-7">
      <q-icon name="search_off" size="80px" color="grey-4" />
      <div class="text-h6 q-mt-md">Não encontramos resultados</div>
      <div class="text-caption">
        Tente ajustar os filtros ou o termo de busca.
      </div>

      <q-btn
        flat
        color="primary"
        label="Limpar Filtros"
        class="q-mt-md"
        @click="limparFiltros"
      />
    </div>

    <!-- MODAL CONFIMAR VIAGEM  -->
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

            <q-item>
              <q-item-section>
                <q-item-label caption>Produto</q-item-label>
                <q-item-label class="text-weight-bold">
                  {{ pedidoSelecionado?.detalhes.produto || "SEM PLACA" }}
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
import { useFiltroStore } from "src/stores/filtro";
import { useRouter } from "vue-router";

const router = useRouter();
const $q = useQuasar();
const filtro = ref("");
const clientes = ref([]);
const clientId = ref(null);
const veiculos = ref([]);
const veiculoId = ref(null);
const produtos = ref([]);
const produtoId = ref(null);
const pedidos = ref([]);
const filtroStore = useFiltroStore();

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
  const prodFiltro = filtroStore.produtoSelecionado;

  // 1. Se tudo estiver vazio, retorna a lista original
  if (!termo && prodFiltro === "Todos") return pedidos.value;

  return pedidos.value
    .map((cliente) => {
      // 2. Filtramos os detalhes baseados NO PRODUTO e (se houver termo) NA PLACA
      // Se o usuário digitou o nome do cliente, não queremos esconder os detalhes do produto selecionado
      const detalhesFiltrados = Object.fromEntries(
        Object.entries(cliente.detalhes || {}).filter(([_, det]) => {
          const produtoMatch =
            prodFiltro === "Todos" || det.produto === prodFiltro;

          // Se o termo bater com o nome do cliente, mostramos todos os produtos dele (que batem com o prodFiltro)
          const nomeClienteBate = cliente.nome.toLowerCase().includes(termo);

          // Se o nome não bater, verificamos se o termo bate com a placa ou o próprio nome do produto
          const termoBateNosDetalhes =
            (det.placa?.toLowerCase() || "").includes(termo) ||
            (det.produto?.toLowerCase() || "").includes(termo);

          return produtoMatch && (nomeClienteBate || termoBateNosDetalhes);
        }),
      );

      const temDetalhesFiltrados = Object.keys(detalhesFiltrados).length > 0;
      const nomeClienteBate = cliente.nome.toLowerCase().includes(termo);

      // 3. Decisão de exibição do Card
      // Se o nome do cliente bate e estamos em "Todos", mostra ele completo
      if (nomeClienteBate && prodFiltro === "Todos") {
        return cliente;
      }

      // Se houver detalhes que passaram no filtro (Produto + Placa/Texto)
      if (temDetalhesFiltrados) {
        return {
          ...cliente,
          detalhes: detalhesFiltrados,
        };
      }

      return null;
    })
    .filter((c) => c !== null);
});

const limparFiltros = () => {
  filtro.value = "";
  filtroStore.produtoSelecionado = "Todos";
};

const obterCorProduto = (produto) => {
  const p = produto?.toLowerCase();
  if (p === "cascalho") return "blue-7"; // Cor para Cascalho
  if (p === "terra") return "secondary"; // Cor para Terra

  return "secondary"; // Cor padrão para outros produtos
};

function abrirModal(detalhes, cliente) {
  if (!cliente || !detalhes) return;
  pedidoSelecionado.value = {
    nome: cliente.nome,
    clientId: cliente.clienteId,
    detalhes: { ...detalhes },
  };
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

const acessarViagens = (v, cliente) => {
  const d = new Date();
  const hoje = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");

  // Agora o push levará o dia 01/02/2026 mesmo sendo 20:30h
  router.push(
    `/relatorios?searchCliente=${cliente.nome}&searchMetragem=${v.metragem}&searchPlaca=${v.placa}&searchProduto=${v.produto}&from=${hoje}&to=${hoje}`,
  );
};

async function carregarDadosIniciais() {
  try {
    // Executa ambas as chamadas simultaneamente (mais rápido)
    const [resClientes, resProdutos] = await Promise.all([
      api.get("/clients"),
      api.get("/produtos"),
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
  const d = new Date();
  // Monta a string manualmente: YYYY-MM-DD
  const hoje = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-"); // Retorna exatamente "YYYY-MM-DD" no fuso local

  // Agora use esse 'hoje' para carregar os dados
  console.log(hoje);

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

    resetarCampos();
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

const resetarCampos = () => {
  clientId.value = null;
  veiculoId.value = null;
  produtoId.value = null;
  metrosCubicos.value = 0;
  valorProduto.value = 0;

  // Limpa o estado visual de erro do Quasar
  if (formVendas.value) {
    formVendas.value.resetValidation();
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
  filtroStore.carregarProdutos();
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
