<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-2">
        <q-list bordered padding class="rounded-borders text-primary bg-white">
          <q-item-label header>Relatórios</q-item-label>

          <q-item
            clickable
            v-ripple
            :active="tab === 'pedidos'"
            @click="tab = 'pedidos'"
            active-class="bg-blue-1 text-blue-8"
          >
            <q-item-section avatar>
              <q-icon name="list" />
            </q-item-section>
            <q-item-section>Todos os Pedidos</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :active="tab === 'fechamentos'"
            @click="tab = 'fechamentos'"
            active-class="bg-blue-1 text-blue-8"
          >
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section>Fechamentos Ativos</q-item-section>
            <q-item-section side>
              <q-badge color="orange" rounded />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="col-12 col-md-10">
        <q-tab-panels v-model="tab" animated class="bg-transparent">
          <q-tab-panel name="pedidos" class="q-pa-none">
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="row q-col-gutter-sm items-center justify-between">
                <div class="col-12 col-sm-6 col-md-2">
                  <q-input
                    v-model="filtros.cliente"
                    label="Cliente"
                    dense
                    outlined
                    clearable
                    bg-color="white"
                  >
                    <template v-slot:prepend><q-icon name="person" /></template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6 col-md-2">
                  <q-input
                    v-model="filtros.placa"
                    label="Placa Veículo"
                    dense
                    outlined
                    clearable
                    bg-color="white"
                    mask="AAA-XXXX"
                    unmasked-value
                  >
                    <template v-slot:prepend
                      ><q-icon name="directions_car"
                    /></template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6 col-md-2">
                  <q-select
                    v-model="filtros.status"
                    :options="optionsStatus"
                    label="Status"
                    dense
                    outlined
                    clearable
                    emit-value
                    map-options
                  />
                </div>

                <div class="col-12 col-sm-6 col-md-2">
                  <q-select
                    v-model="filtros.produto"
                    :options="['Terra', 'Cascalho']"
                    label="Produto"
                    dense
                    outlined
                    clearable
                    bg-color="white"
                  >
                    <template v-slot:prepend
                      ><q-icon name="inventory_2"
                    /></template>
                  </q-select>
                </div>

                <div class="col-12 col-md-2">
                  <q-input
                    v-model="filtros.dataStr"
                    label="Período"
                    dense
                    outlined
                    readonly
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-date
                            v-model="filtros.periodo"
                            range
                            mask="DD/MM/YYYY"
                          >
                            <div class="row items-center justify-end">
                              <q-btn
                                v-close-popup
                                label="Fechar"
                                color="primary"
                                flat
                              />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-1 text-right">
                  <q-btn
                    flat
                    color="grey-7"
                    label="Limpar Filtros"
                    icon="filter_alt_off"
                    @click="limparFiltros"
                  />
                </div>
              </q-card-section>
              <q-card-section class="q-py-none q-my-md">
                <div class="row q-col-gutter-sm justify-between">
                  <div class="col-12 col-md-3">
                    <q-card
                      flat
                      bordered
                      class="shadow-1 full-height"
                      style="border-radius: 8px ; border-left: 4px solid var(--q-positive)"
                    >
                      <q-card-section class="q-pa-sm row items-center no-wrap">
                        <q-icon
                          name="payments"
                          size="sm"
                          class="q-mr-sm opacity-70 text-positive"
                        />
                        <div>
                          <div
                            class="text-overline"
                            style="line-height: 1; font-size: 0.6rem"
                          >
                            VALOR TOTAL
                          </div>
                          <div class="text-h6 text-weight-bolder text-positive">
                            {{ formatCurrency(resumoGeral.valorTotal) }}
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-4">
                    <q-card
                      flat
                      bordered
                      class="shadow-1 full-height"
                      style="border-radius: 8px; border-left: 4px solid #5d4037"
                    >
                      <q-card-section
                        class="q-pa-sm row items-center justify-between no-wrap"
                      >
                        <div class="row items-center">
                          <q-icon
                            name="layers"
                            color="brown-10"
                            size="xs"
                            class="q-mr-xs"
                          />
                          <div class="text-weight-bold text-brown-10">
                            Cascalho
                          </div>
                        </div>
                        <div class="text-right">
                          <span class="text-caption text-grey-7">Viagens: </span>
                          <span class="text-weight-bold">{{
                            resumoGeral.qtdCascalho
                          }}</span>
                          <q-separator vertical inset spaced class="inline" />
                          <span class="text-weight-bolder text-subtitle2"
                            >{{
                              resumoGeral.metragemCascalho.toFixed(2)
                            }}
                            m³</span
                          >
                        </div>
                        <div class="text-right q-pl-md">
                          <div
                            class="text-caption text-grey-6"
                            style="font-size: 0.7rem"
                          >
                            Subtotal
                          </div>
                          <div class="text-weight-bold text-brown">
                            {{ formatCurrency(resumoGeral.valorCascalho) }}
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-4">
                    <q-card
                      flat
                      bordered
                      class="shadow-1 full-height"
                      style="border-radius: 8px; border-left: 4px solid #388e3c"
                    >
                      <q-card-section
                        class="q-pa-sm row items-center justify-between no-wrap"
                      >
                        <div class="row items-center">
                          <q-icon
                            name="eco"
                            color="green-10"
                            size="xs"
                            class="q-mr-xs"
                          />
                          <div class="text-weight-bold text-green-10">
                            Terra
                          </div>
                        </div>
                        <div class="text-right">
                          <span class="text-caption text-grey-7">Viagens: </span>
                          <span class="text-weight-bold">{{
                            resumoGeral.qtdTerra
                          }}</span>
                          <q-separator vertical inset spaced class="inline" />
                          <span class="text-weight-bolder text-subtitle2"
                            >{{ resumoGeral.metragemTerra.toFixed(2) }} m³</span
                          >
                        </div>
                        <div class="text-right q-pl-md">
                          <div
                            class="text-caption text-grey-6"
                            style="font-size: 0.7rem"
                          >
                            Subtotal
                          </div>
                          <div class="text-weight-bold text-green-9">
                            {{ formatCurrency(resumoGeral.valorTerra) }}
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-table
              :loading="carregandoPedidos"
              title="Relatório de Pedidos"
              :rows="rowsFiltrados"
              :columns="columnsPedidos"
              row-key="id"
              selection="multiple"
              v-model:selected="selected"
              v-model:pagination="pagination"
              flat
              bordered
            >
              <template v-slot:top>
                <div class="col-2 q-table__title">Pedidos</div>
                <q-space />
                <q-transition
                  appear
                  enter-active-class="animated fadeIn"
                  leave-active-class="animated fadeOut"
                >
                  <q-btn
                    v-if="selected.length > 0"
                    color="primary"
                    label="Gerar Fechamento"
                    icon="receipt_long"
                    @click="gerarFechamento"
                    class="q-ml-sm"
                  >
                    <q-badge color="orange" floating>{{
                      selected.length
                    }}</q-badge>
                  </q-btn>
                </q-transition>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="formatStatus(props.row.status).color"
                    text-color="white"
                    dense
                    square
                    :icon="formatStatus(props.row.status).icon"
                  >
                    <span class="q-ml-xs">{{
                      formatStatus(props.row.status).label
                    }}</span>
                    <q-badge
                      v-if="props.row.fechamentoId"
                      color="grey-9"
                      floating
                      transparent
                      style="font-size: 10px; padding: 2px 4px"
                    >
                      #{{ props.row.fechamentoId }}
                    </q-badge>
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-valor_total="props">
                <q-td :props="props">
                  {{ formatCurrency(props.value) }}
                </q-td>
              </template>

              <template v-slot:body-cell-acoes="props">
                <q-td :props="props" class="q-gutter-sm">
                  <q-btn
                    icon="edit"
                    color="blue"
                    dense
                    round
                    flat
                    @click="editarPedido(props.row)"
                  />
                  <q-btn
                    icon="delete"
                    color="negative"
                    dense
                    round
                    flat
                    @click="confirmarExclusao(props.row.id)"
                  />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <q-tab-panel name="fechamentos" class="q-pa-none">
            <div class="row q-col-gutter-md">
              <div v-for="f in rowsFechamentos" :key="f.id" class="col-12">
                <q-card flat bordered class="my-card shadow-1">
                  <q-expansion-item
                    expand-separator
                    icon="receipt_long"
                    :label="f.client?.nome || 'Cliente não identificado'"
                    :caption="`Data: ${formatDate(f.createdAt)} | Total: ${formatCurrency(f.total)}`"
                    header-class="text-primary text-weight-bold"
                  >
                    <q-card-section>
                      <div class="text-weight-bold text-subtitle2">
                        Resumo do Fechamento:
                      </div>
                      <div class="text-caption text-grey-7 q-mb-md">
                        {{ f.descricao }}
                      </div>

                      <q-markup-table dense flat bordered>
                        <thead class="bg-grey-2">
                          <tr>
                            <th class="text-left">Produto</th>
                            <th class="text-center">Qtd Pedidos</th>
                            <th class="text-right">Metragem Total</th>
                            <th class="text-right">Valor Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="resumo in gerarResumoProdutos(f.pedidos)"
                            :key="resumo.nome"
                          >
                            <td class="text-left">{{ resumo.nome }}</td>
                            <td class="text-center">{{ resumo.qtd }}</td>
                            <td class="text-right">
                              {{ resumo.metragem.toFixed(2) }} m³
                            </td>
                            <td class="text-right">
                              {{ formatCurrency(resumo.valor) }}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot class="text-weight-bold bg-blue-1">
                          <tr>
                            <td class="text-left">TOTAL GERAL</td>
                            <td class="text-center">
                              {{ f.pedidos.length }}
                            </td>
                            <td class="text-right">
                              {{
                                f.pedidos
                                  .reduce((s, p) => s + Number(p.metragem), 0)
                                  .toFixed(2)
                              }}
                              m³
                            </td>
                            <td class="text-right">
                              {{ formatCurrency(f.total) }}
                            </td>
                          </tr>
                        </tfoot>
                      </q-markup-table>

                      <div class="row justify-end q-mt-md q-gutter-sm">
                        <q-btn
                          flat
                          color="primary"
                          label="Ver Detalhes"
                          icon="visibility"
                          @click="verDetalhes(f)"
                        />
                      </div>
                    </q-card-section>
                  </q-expansion-item>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- MODAL DETALHES DO FECHAMENTO -->
    <q-dialog
      v-model="modalDetalhesFechamento"
      full-width
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="max-width: 900px; margin: auto">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="col">
            <div class="text-h5 text-white text-weight-bolder">
              Detalhamento do Fechamento
            </div>
            <div class="text-subtitle1 text-grey-4">
              <q-icon name="person" /> {{ fechamentoSelecionado?.client?.nome }}
            </div>
          </div>
          <q-space />
          <div class="text-right">
            <div class="text-caption text-grey-5">
              ID Fechamento: #{{ fechamentoSelecionado?.id }}
            </div>
            <div class="text-caption text-grey-5">
              Data: {{ formatDate(fechamentoSelecionado?.createdAt) }}
            </div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup class="q-ml-md" />
        </q-card-section>

        <q-card-section v-if="fechamentoSelecionado?.descricao">
          <div class="text-weight-bold">Observações/Descrição:</div>
          <div class="text-body2 text-grey-8">
            {{ fechamentoSelecionado.descricao }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-table
            flat
            bordered
            :rows="fechamentoSelecionado?.pedidos || []"
            :columns="colunasDetalhes"
            row-key="id"
            :pagination="{ rowsPerPage: 0 }"
            hide-bottom
          >
            <template v-slot:bottom-row>
              <q-tr class="bg-blue-grey-1 text-weight-bold">
                <q-td colspan="3">TOTAIS DOS PEDIDOS</q-td>
                <q-td class="text-right"
                  >{{ totalMetragemSelecionado }} m³</q-td
                >
                <q-td class="text-right text-primary">{{
                  formatCurrency(fechamentoSelecionado?.total)
                }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>

        <q-card-section class="row q-col-gutter-md justify-end">
          <div class="col-12 col-sm-3">
            <div
              class="bg-primary text-white q-pa-sm rounded-borders text-center"
            >
              <div class="text-caption">Total de Pedidos</div>
              <div class="text-h6">
                {{ fechamentoSelecionado?.pedidos?.length }}
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-3">
            <div
              class="bg-green-7 text-white q-pa-sm rounded-borders text-center"
            >
              <div class="text-caption">Valor Total Líquido</div>
              <div class="text-h6">
                {{ formatCurrency(fechamentoSelecionado?.total) }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-my-md">
          <q-btn flat label="Fechar" color="grey-7" v-close-popup />
          <q-btn
            color="secondary"
            icon="picture_as_pdf"
            label="Exportar para PDF"
            @click="gerarPDF(fechamentoSelecionado)"
          />
          <q-btn color="green" label="Finalizar" icon="check_circle" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { api } from "src/boot/axios";
import { useQuasar, date } from "quasar";

const $q = useQuasar();
const carregandoPedidos = ref(false);
const tab = ref("pedidos"); // Controla qual visão está ativa

const rowsPedidos = ref([]);
const rowsFechamentos = ref([]);

const modalDetalhesFechamento = ref(false);
const fechamentoSelecionado = ref(null);

const statusMap = {
  PENDENTE: { label: "Pendente", color: "orange-8", icon: "warning" },
  PAGO: { label: "Pago", color: "green-7", icon: "check_circle" },
  EM_FECHAMENTO: { label: "Em Fechamento", color: "blue-7", icon: "sync" },
};

const filtros = ref({
  cliente: "",
  placa: "",
  produto: null,
  status: null,
  periodo: null,
  dataStr: "",
});
const optionsStatus = [
  { label: "Pendente", value: "PENDENTE" },
  { label: "Pago", value: "PAGO" },
  { label: "Em Fechamento", value: "EM_FECHAMENTO" },
];

/* Colunas da tabela */
const columnsPedidos = [
  { name: "id", align: "left", label: "ID", field: "id", sortable: true },
  {
    name: "data",
    align: "left",
    label: "Data",
    field: "data_do_pedido",
    format: (val) => date.formatDate(val, "DD/MM/YYYY HH:mm"),
    sortable: true,
    sort: (a, b) => new Date(a) - new Date(b),
  },
  {
    name: "cliente",
    align: "left",
    label: "Cliente",
    field: (row) => row.client.nome,
    sortable: true,
  },
  {
    name: "produto",
    align: "left",
    label: "Produto",
    field: (row) => row.produto.nome,
    sortable: true,
  },
  {
    name: "placa",
    align: "left",
    label: "Veículo",
    field: (row) => (row.veiculo ? row.veiculo.placa : "SEM PLACA"),
  },
  {
    name: "metragem",
    align: "center",
    label: "Metragem (m³)",
    field: "metragem",
  },
  {
    name: "valor_total",
    align: "right",
    label: "Total",
    field: "valor_total",
    sortable: true,
  },
  { name: "status", align: "center", label: "Status", field: "status" },
  { name: "acoes", align: "center", label: "Ações", field: "acoes" },
];

const verDetalhes = (fechamento) => {
  fechamentoSelecionado.value = fechamento;
  modalDetalhesFechamento.value = true;
};

const colunasDetalhes = [
  { name: "id", label: "ID", field: "id", align: "left", sortable: true },
  {
    name: "data",
    label: "Data Pedido",
    field: "createdAt",
    format: (val) => formatDate(val),
    align: "left",
    sortable: true,
  },
  {
    name: "produto",
    label: "Produto/Serviço",
    field: (row) => row.produto?.nome || "N/A",
    align: "left",
  },
  {
    name: "metragem",
    label: "Metragem",
    field: "metragem",
    format: (val) => `${Number(val).toFixed(2)} m³`,
    align: "right",
  },
  {
    name: "valor",
    label: "Valor Unit.",
    field: "valor_total",
    format: (val) => formatCurrency(val),
    align: "right",
  },
];

// Soma a metragem de todos os pedidos do fechamento aberto no modal
const totalMetragemSelecionado = computed(() => {
  if (!fechamentoSelecionado.value?.pedidos) return "0.00";
  return fechamentoSelecionado.value.pedidos
    .reduce((acc, p) => acc + Number(p.metragem), 0)
    .toFixed(2);
});

// Função que processa os pedidos do fechamento para criar o resumo por produto
function gerarResumoProdutos(pedidos) {
  if (!pedidos || pedidos.length === 0) return [];

  const resumo = pedidos.reduce((acc, p) => {
    // Acessando o produto que veio no include aninhado
    const nomeProd = p.produto?.nome || "Produto não informado";

    if (!acc[nomeProd]) {
      acc[nomeProd] = { nome: nomeProd, qtd: 0, metragem: 0, valor: 0 };
    }

    acc[nomeProd].qtd += 1;
    acc[nomeProd].metragem += Number(p.metragem || 0);
    acc[nomeProd].valor += Number(p.valor_total || 0);

    return acc;
  }, {});

  return Object.values(resumo);
}
const selected = ref([]);
// Sua função de fechamento
const gerarFechamento = () => {
  const pedidosBloqueados = selected.value.filter(
    (p) =>
      p.fechamentoId || p.status === "EM_FECHAMENTO" || p.status === "PAGO",
  );
  console.log(pedidosBloqueados);

  if (pedidosBloqueados.length > 0) {
    $q.notify({
      color: "negative",
      message: "Operação negada!",
      caption: `Há ${pedidosBloqueados.length} pedido(s) que já estão em um fechamento ou já foram pagos.`,
      icon: "lock",
    });
    return;
  }

  const clientIds = [...new Set(selected.value.map((item) => item.clientId))];

  if (clientIds.length > 1) {
    $q.notify({
      color: "warning",
      message:
        "Selecione apenas pedidos de um mesmo cliente para gerar o fechamento.",
      icon: "person",
    });
    return;
  }

  const clientId = clientIds[0];
  const idsParaFechar = selected.value.map((item) => item.id);

  // 2. Abre o diálogo com campo de texto (Prompt)
  $q.dialog({
    title: "Confirmar Fechamento",
    message: `Você está gerando um fechamento para ${selected.value.length} pedido(s).`,
    prompt: {
      model: "",
      type: "text",
      label: "Descrição/Observação do Fechamento",
      isValid: (val) => val.length >= 3,
    },
    cancel: true,
    persistent: true,
  }).onOk(async (descricao) => {
    // 'descricao' é o valor digitado no prompt
    try {
      $q.loading.show({ message: "Processando fechamento..." });

      const token = localStorage.getItem("token");

      await api.post(
        "/fechamentos",
        {
          pedidosIds: idsParaFechar,
          clientId: Number(clientId),
          descricao: descricao,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Inclusão do Bearer Token
          },
        },
      );
      $q.notify({
        color: "positive",
        message: "Fechamento gerado com sucesso!",
        icon: "check",
      });

      selected.value = [];
      await carregarDados(); // Recarrega a tabela
    } catch (error) {
      console.log(error);

      $q.notify({
        color: "negative",
        message: error.response?.data?.message || "Erro ao gerar fechamento",
      });
    } finally {
      $q.loading.hide();
    }
  });
};

async function carregarDados() {
  carregandoPedidos.value = true;
  // Carrega ambos ou conforme a aba ativa para economizar processamento
  try {
    const [resPedidos, resFechamentos] = await Promise.all([
      api.get("/pedidos"),
      api.get("/fechamentos"), // Filtro de ativos se houver no seu backend
    ]);
    rowsPedidos.value = resPedidos.data;
    rowsFechamentos.value = resFechamentos.data;
    console.log(rowsPedidos);
  } catch (err) {
    console.error("Erro ao carregar relatórios", err);
  } finally {
    carregandoPedidos.value = false;
  }
}
const pagination = ref({
  sortBy: "data", // Nome da coluna definida em 'name'
  descending: true, // 'true' para o mais recente primeiro
  rowsPerPage: 20,
});

async function mudarStatus(id, novoStatus) {
  try {
    await api.put(`/pedidos/${id}`, { status: novoStatus });
    $q.notify({
      color: "positive",
      message: `Status do pedido ${id} atualizado!`,
    });
  } catch (error) {
    $q.notify({ color: "negative", message: "Erro ao atualizar status" });
  }
}

// Abrir modal ou navegar para tela de edição
function editarPedido(pedido) {
  console.log("Editando pedido:", pedido);
  // Aqui você pode abrir um q-dialog com o formulário
}

// Confirmar antes de deletar
function confirmarExclusao(id) {
  $q.dialog({
    title: "Confirmar Exclusão",
    message:
      "Deseja realmente apagar este pedido? Esta ação não pode ser desfeita.",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/pedidos/${id}`);
      $q.notify({ color: "positive", message: "Pedido excluído com sucesso!" });
      // Chame sua função carregarPedidos() aqui para atualizar a lista
    } catch (error) {
      $q.notify({ color: "negative", message: "Erro ao excluir pedido" });
    }
  });
}

/* Utilitários */
function formatCurrency(v) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v || 0);
}
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("pt-BR");
}

// Função para usar no template
const formatStatus = (status) => {
  return statusMap[status] || { label: status, color: "grey", icon: "help" };
};

watch(
  () => filtros.value.periodo,
  (val) => {
    if (val && typeof val === "object") {
      filtros.value.dataStr = `${val.from} até ${val.to}`;
    } else if (typeof val === "string") {
      filtros.value.dataStr = val;
    } else {
      filtros.value.dataStr = "";
    }
  },
);

const rowsFiltrados = computed(() => {
  return rowsPedidos.value.filter((row) => {
    // --- Lógica da Placa ---
    const buscaPlaca = filtros.value.placa?.toLowerCase() || "";

    // Pegamos a placa real ou definimos como "sem placa" para a comparação
    const placaEfetiva = row.veiculo?.placa
      ? row.veiculo.placa.toLowerCase()
      : "sem placa";

    // Removemos caracteres especiais da busca e da placa real para busca flexível
    const placaLimpa = placaEfetiva.replace(/[^a-z0-9]/g, "");
    const buscaLimpa = buscaPlaca.replace(/[^a-z0-9]/g, "");

    // Se a busca for "sem placa", o matchPlaca será verdadeiro para campos null
    const matchPlaca =
      !buscaPlaca ||
      placaEfetiva.includes(buscaPlaca) ||
      placaLimpa.includes(buscaLimpa);

    // --- Outros filtros (Cliente, Produto, Status, Data) ---
    const matchCliente =
      !filtros.value.cliente ||
      row.client?.nome
        ?.toLowerCase()
        .includes(filtros.value.cliente.toLowerCase());

    const matchProduto =
      !filtros.value.produto || row.produto?.nome === filtros.value.produto;

    const matchStatus =
      !filtros.value.status || row.status === filtros.value.status;

    let matchData = true;
    if (filtros.value.periodo) {
      const dataDoc = new Date(row.createdAt).setHours(0, 0, 0, 0);
      if (typeof filtros.value.periodo === "string") {
        matchData = dataDoc === parseDate(filtros.value.periodo).getTime();
      } else {
        matchData =
          dataDoc >= parseDate(filtros.value.periodo.from).getTime() &&
          dataDoc <= parseDate(filtros.value.periodo.to).getTime();
      }
    }

    return (
      matchCliente && matchPlaca && matchProduto && matchStatus && matchData
    );
  });
});

const limparFiltros = () => {
  filtros.value = {
    busca: "",
    status: null,
    produto: "",
    periodo: null,
    dataStr: "",
  };
};

// Auxiliar para converter string DD/MM/YYYY para Date
function parseDate(dateStr) {
  const [d, m, y] = dateStr.split("/");
  return new Date(y, m - 1, d);
}

const resumoGeral = computed(() => {
  // Inicializamos o acumulador
  const inicial = {
    valorTotal: 0,
    metragemTotal: 0,
    qtdCascalho: 0,
    metragemCascalho: 0,
    valorCascalho: 0,
    qtdTerra: 0,
    metragemTerra: 0,
    valorTerra: 0,
  };

  // Percorre a lista que já está filtrada pela sua busca
  return rowsFiltrados.value.reduce((acc, row) => {
    const valor = Number(row.valor_total || 0);
    const metragem = Number(row.metragem || 0);
    const nomeProduto = row.produto?.nome?.toLowerCase() || "";

    acc.valorTotal += valor;
    acc.metragemTotal += metragem;

    if (nomeProduto.includes("cascalho")) {
      acc.qtdCascalho++;
      acc.metragemCascalho += metragem;
      acc.valorCascalho += valor;
    } else if (nomeProduto.includes("terra")) {
      acc.qtdTerra++;
      acc.metragemTerra += metragem;
      acc.valorTerra += valor;
    }

    return acc;
  }, inicial);
});

onMounted(carregarDados);
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
</style>
