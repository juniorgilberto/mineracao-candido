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
            :active="tab === 'fechamentosAtivos'"
            @click="tab = 'fechamentosAtivos'"
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

          <q-item
            clickable
            v-ripple
            :active="tab === 'fechamentosPagos'"
            @click="tab = 'fechamentosPagos'"
            active-class="bg-blue-1 text-blue-8"
          >
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section>Fechamentos Pagos</q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="col-12 col-md-10">
        <q-tab-panels v-model="tab" animated class="bg-transparent">
          <q-tab-panel name="pedidos" class="q-pa-none">
            <q-card flat bordered class="q-mb-md">
              <q-card-section
                class="row q-col-gutter-sm items-center justify-between"
              >
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
                  >
                    <template v-slot:prepend
                      ><q-icon name="directions_car"
                    /></template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6 col-md-1">
                  <q-input
                    v-model="filtros.metragem"
                    label="M³"
                    dense
                    outlined
                    clearable
                    bg-color="white"
                  >
                    <template v-slot:prepend
                      ><q-icon name="straighten"
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
                    v-model="dataStr"
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
                            mask="YYYY/MM/DD"
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
                      style="
                        border-radius: 8px;
                        border-left: 4px solid var(--q-positive);
                      "
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

                  <div class="col-12 col-md-4">
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
                          <span class="text-caption text-grey-7"
                            >Viagens:
                          </span>
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

                  <div class="col-12 col-md-4">
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
                          <span class="text-caption text-grey-7"
                            >Viagens:
                          </span>
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
              :rows="rowsPedidos"
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
              <template v-slot:body-cell-produto_valor="props">
                <q-td :props="props">
                  {{ formatCurrency(props.value) }}
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
                    color="primary"
                    dense
                    round
                    flat
                    @click="abrirEdicao(props.row)"
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

          <q-tab-panel name="fechamentosAtivos" class="q-pa-none">
            <div class="row q-col-gutter-md">
              <div v-for="f in fechamentosPendentes" :key="f.id" class="col-12">
                <q-card flat bordered class="my-card shadow-1">
                  <q-expansion-item
                    expand-separator
                    icon="receipt_long"
                    :label="formatLabel(f)"
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

          <q-tab-panel name="fechamentosPagos" class="q-pa-none">
            <div class="row q-col-gutter-md">
              <div v-for="f in fechamentosPagos" :key="f.id" class="col-12">
                <q-card flat bordered class="my-card shadow-1">
                  <q-expansion-item
                    expand-separator
                    icon="receipt_long"
                    :label="formatLabel(f)"
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

    <!-- MODAL EDIÇÃO PEDIDO -->
    <q-dialog v-model="modalEdicaoPedido" persistent>
      <q-card
        style="min-width: 400px; max-width: 600px; border-radius: 12px shadow-5"
      >
        <q-card-section class="row items-center q-py-md bg-primary text-white">
          <q-icon name="edit_note" size="sm" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">
            Editar Pedido #{{ pedidoEdicao.id }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-lg">
          <q-form @submit="salvarAlteracoesPedido" class="q-gutter-y-sm">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="pedidoEdicao.veiculoId"
                  :options="veiculosDoCliente"
                  option-value="id"
                  option-label="placa"
                  label="Veículo / Placa"
                  filled
                  map-options
                  emit-value
                >
                  <template v-slot:prepend>
                    <q-icon name="local_shipping" color="blue" />
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.placa }}</q-item-label>
                        <q-item-label caption>{{
                          scope.opt.modelo
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12">
                <q-select
                  v-model="pedidoEdicao.produtoId"
                  :options="listaProdutos"
                  option-value="id"
                  option-label="nome"
                  label="Produto Selecionado"
                  map-options
                  emit-value
                  filled
                  bg-color="blue-1"
                  stack-label
                  icon="inventory_2"
                >
                  <template v-slot:prepend>
                    <q-icon name="shopping_cart" color="blue" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="pedidoEdicao.metragem"
                  type="number"
                  label="Metragem"
                  filled
                  stack-label
                >
                  <template v-slot:prepend>
                    <q-icon name="straighten" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="pedidoEdicao.status"
                  :options="optionsStatus"
                  map-options
                  emit-value
                  label="Status Atual"
                  filled
                  stack-label
                >
                  <template v-slot:prepend>
                    <q-icon name="info" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="pedidoEdicao.produto_valor"
                  label="Valor Unitário"
                  prefix="R$"
                  filled
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="pedidoEdicao.valor_total"
                  label="Valor Total"
                  prefix="R$"
                  filled
                  bg-color="green-1"
                  color="green-10"
                  readonly
                  label-color="green-10"
                >
                  <template v-slot:prepend>
                    <q-icon name="payments" color="green" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row justify-end q-mt-xl q-gutter-sm">
              <q-btn
                label="Cancelar"
                color="grey-7"
                flat
                v-close-popup
                class="q-px-md"
              />
              <q-btn
                :loading="loading"
                label="Salvar Alterações"
                color="secondary"
                type="submit"
                unelevated
                icon="save"
                class="q-px-lg"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

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
            @click="visualizarPDF(fechamentoSelecionado)"
          />
          <q-btn
            v-if="fechamentoSelecionado?.status === 'PENDENTE'"
            color="green"
            label="Finalizar"
            icon="check_circle"
            @click="finalizarFechamento(fechamentoSelecionado)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL PREVIEW PDF -->
    <q-dialog
      v-model="showPDFPreview"
      maximized
      transition-show="fade"
      transition-hide="fade"
    >
      <q-card class="bg-dark">
        <q-bar class="bg-primary text-white q-pa-md" style="height: 60px">
          <q-icon name="description" color="secondary" size="md" />
          <div class="text-h6 text-weight-bolder">PREVIEW DO FECHAMENTO</div>
          <q-space />
          <q-btn flat round icon="download" @click="baixarPDF" color="white">
            <q-tooltip>Baixar Arquivo</q-tooltip>
          </q-btn>
          <q-btn flat round icon="close" v-close-popup color="white" />
        </q-bar>

        <q-card-section class="q-pa-none" style="height: calc(100vh - 60px)">
          <iframe
            :src="pdfUrl"
            width="100%"
            height="100%"
            frameborder="0"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { api } from "src/boot/axios";
import { useQuasar, date, debounce } from "quasar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter, useRoute } from "vue-router";

const route = useRoute();
const router = useRouter();

const $q = useQuasar();
const carregandoPedidos = ref(false);
const tab = ref("pedidos");
const loading = ref(false);

const rowsPedidos = ref([]);
const rowsFechamentos = ref([]);

const modalEdicaoPedido = ref(false);
const pedidoEdicao = ref({});
const listaProdutos = ref([]);
const listaVeiculos = ref([]);
const showPDFPreview = ref(false);
const pdfUrl = ref("");
const fechamentoAtualParaDownload = ref(null);

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
  metragem: null,
  produto: null,
  status: null,
  periodo: null,
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
    name: "produto_valor",
    align: "center",
    label: "Valor Unit.",
    field: (row) => row.produto_valor,
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
    label: "Valor Carga",
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

const sincronizarFiltrosPelaUrl = () => {
  const q = route.query;

  filtros.value.cliente = q.searchCliente || "";
  filtros.value.placa = q.searchPlaca || "";
  filtros.value.metragem = q.searchMetragem || "";
  filtros.value.status = q.searchStatus || null;
  filtros.value.produto = q.searchProduto || null;

  // O Quasar QDate precisa de barras (/) para o range funcionar bem
  if (q.from && q.to) {
    const f = q.from.replaceAll("-", "/");
    const t = q.to.replaceAll("-", "/");
    filtros.value.periodo = f === t ? f : { from: f, to: t };
  } else {
    filtros.value.periodo = null;
  }
};

// 2. BUSCA (Lê direto da URL para garantir que o que o usuário vê é o que o banco busca)
async function carregarDados() {
  carregandoPedidos.value = true;
  try {
    const params = {
      searchCliente: route.query.searchCliente || undefined,
      searchPlaca: route.query.searchPlaca || undefined,
      searchProduto: route.query.searchProduto || undefined,
      searchStatus: route.query.searchStatus || undefined,
      searchMetragem: route.query.searchMetragem || undefined,
      from: route.query.from || undefined,
      to: route.query.to || undefined,
    };

    console.log(params);


    const [resPedidos, resFechamentos] = await Promise.all([
      api.get("/pedidos", { params }),
      api.get("/fechamentos"),
    ]);

    rowsPedidos.value = resPedidos.data;
    rowsFechamentos.value = resFechamentos.data;
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



const carregarDadosIniciais = async () => {
  try {
    // Busca produtos e veículos em paralelo
    const [resProd, resVeic] = await Promise.all([
      api.get("/produtos"),
      api.get("/veiculos"),
    ]);
    listaProdutos.value = resProd.data;
    listaVeiculos.value = resVeic.data;
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
};

const abrirEdicao = (item) => {
  // Fazemos um spread para não alterar a linha da tabela antes de salvar
  pedidoEdicao.value = { ...item };
  modalEdicaoPedido.value = true;
};

const salvarAlteracoesPedido = async () => {
  loading.value = true;
  console.log("Dados prontos para API:", pedidoEdicao.value);
  try {
    await api.put(`/pedidos/${pedidoEdicao.value.id}`, pedidoEdicao.value);
    $q.notify({ color: "positive", message: "Pedido atualizado com sucesso!" });
    carregarDados();
    modalEdicaoPedido.value = false;
  } catch (error) {
    $q.notify({ color: "negative", message: "Erro ao atualizar pedido" });
  } finally {
    loading.value = false;
  }
};

// Confirmar antes de deletar
function confirmarExclusao(id) {
  $q.dialog({
    title: "Confirmar Exclusão",
    message: `Deseja realmente apagar este pedido ${id}? Esta ação não pode ser desfeita.`,
    cancel: true,
    persistent: true,
    icon: "warning",
  }).onOk(async () => {
    try {
      await api.delete(`/pedidos/${id}`);
      $q.notify({ color: "positive", message: "Pedido excluído com sucesso!" });
      carregarDados();
    } catch (error) {
      $q.notify({ color: "negative", message: "Erro ao excluir pedido" });
    }
  });
}

function finalizarFechamento(fechamento) {
  const id = fechamento.id;
  $q.dialog({
    title: "Finalizar Fechamento",
    message:
      "Deseja realmente finalizar este fechamento? O status será alterado para PAGO.",
    cancel: true,
    persistent: true,
    ok: { label: "Finalizar", color: "green" },
    cancel: { label: "Voltar", color: "grey" },
  }).onOk(async () => {
    try {
      // O segundo argumento do PUT é o corpo (body) da requisição
      // Enviamos um objeto: { status: "PAGO" }
      await api.put(`/fechamentos/${id}/finalizar`, { status: "PAGO" });

      $q.notify({
        color: "positive",
        icon: "check",
        message: "Fechamento e todos os pedidos foram marcados como PAGOS!",
      });

      carregarDados();
      modalDetalhesFechamento.value = false;
    } catch (error) {
      $q.notify({
        color: "negative",
        message: "Erro ao finalizar fechamento",
      });
    }
  });
}

const fechamentosPendentes = computed(() => {
  return rowsFechamentos.value
    .filter((f) => f.status === "PENDENTE")
    .sort((a, b) => a.id - b.id); // Garante a ordem por ID no front
});

// Lista de Pagos ordenada por ID
const fechamentosPagos = computed(() => {
  return rowsFechamentos.value
    .filter((f) => f.status === "PAGO")
    .sort((a, b) => a.id - b.id);
});

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

function formatLabel(f) {
  const nomeCliente = f.client?.nome || "Cliente não identificado";
  return `${f.id} - ${nomeCliente}`;
}

const visualizarPDF = (fechamento) => {
  const doc = new jsPDF();
  fechamentoAtualParaDownload.value = fechamento;

  const colors = {
    primary: [26, 26, 26], // #1A1A1A
    secondary: [242, 145, 0], // #F29100
    accent: [46, 125, 50], // #2E7D32
    subtext: [100, 100, 100],
  };

  // --- CABEÇALHO ---
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, 210, 35, "F");
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 35, 210, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("RELATÓRIO DE FECHAMENTO", 15, 22);

  // --- INFO CLIENTE ---
  doc.setTextColor(...colors.primary);
  doc.setFontSize(10);
  doc.text(`CLIENTE: ${fechamento.client?.nome || "N/A"}`, 15, 50);
  doc.text(
    `DATA DE EXPEDIÇÃO: ${new Date(fechamento.createdAt).toLocaleDateString()}`,
    15,
    55,
  );
  doc.setTextColor(...colors.subtext);
  doc.setFontSize(8);
  doc.text(`${fechamento.descricao || ""}`, 15, 60);

  // --- TABELA DE PEDIDOS (COM VEÍCULO E VALOR M³) ---
  autoTable(doc, {
    startY: 65,
    // Adicionamos as novas colunas no Header
    head: [["DATA", "VEÍCULO", "PRODUTO", "VALOR M³", "METRAGEM", "TOTAL"]],
    body: fechamento.pedidos.map((p) => [
      new Date(p.createdAt).toLocaleDateString("pt-BR"),
      p.veiculo?.placa || "SEM PLACA", // Tenta pegar a placa do campo direto ou da relação
      p.produto?.nome || "-",
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(p.produto_valor || 0),
      `${Number(p.metragem).toFixed(2)} m³`,
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(p.valor_total),
    ]),
    theme: "striped",
    headStyles: { fillColor: colors.primary, halign: "center" },
    styles: { fontSize: 8 },
    // Definindo larguras para as colunas baterem com a tabela de resumo abaixo
    columnStyles: {
      0: { cellWidth: 25, halign: "center" }, // Data
      1: { cellWidth: 25, halign: "center" }, // Veículo
      2: { cellWidth: 50, halign: "center" }, // Produto (mais largo)
      3: { cellWidth: 25, halign: "center" }, // Valor M³
      4: { cellWidth: 25, halign: "center" }, // Metragem
      5: { cellWidth: 32, halign: "center", fontStyle: "bold" }, // Total
    },
  });

  // --- RESUMO POR PRODUTO ---
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.primary);

  doc.text("RESUMO POR CATEGORIA", 15, finalY);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["PRODUTO", "QTD PEDIDOS", "M³ TOTAL", "SUBTOTAL"]],
    body: gerarResumoProdutos(fechamento.pedidos).map((r) => [
      r.nome.toUpperCase(),
      r.qtd,
      `${r.metragem.toFixed(2)} m³`,
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(r.valor),
    ]),
    headStyles: { fillColor: [60, 60, 60], halign: "center" },
    styles: { fontSize: 8 },
    columnStyles: {
      // 1. Produto: Ocupa o espaço inicial (Data + Veículo + Produto da tabela de cima)
      0: { cellWidth: 100, halign: "center" },

      // 2. Qtd Pedidos: Alinhado ao centro
      1: { cellWidth: 25, halign: "center" },

      // 3. M³ Total: Largura ajustada para não "vazar"
      2: { cellWidth: 25, halign: "center" },

      // 4. Subtotal: Espaço suficiente para o símbolo de R$ e o valor
      3: {
        cellWidth: 32,
        halign: "center", // Financeiro sempre à direita
        fontStyle: "bold",
        textColor: colors.accent,
      },
    },
  });
  // --- RODAPÉ COM TOTAL ---
  const totalY = doc.lastAutoTable.finalY + 15;
  autoTable(doc, {
    startY: totalY,
    margin: { left: 120 }, // Empurra o box para a direita
    tableWidth: 76, // Largura fixa para o box
    head: [["VALOR TOTAL LÍQUIDO"]],
    body: [
      [
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(fechamento.total),
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: colors.primary,
      halign: "center",
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fillColor: colors.primary,
      textColor: [255, 255, 255],
      halign: "center",
      fontSize: 16,
      fontStyle: "bold",
      cellPadding: 6,
    },
  });
  // --- GERAÇÃO DO PREVIEW ---
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  const blob = doc.output("blob");
  pdfUrl.value = URL.createObjectURL(blob);
  showPDFPreview.value = true;
};

// Função para baixar após o preview
const baixarPDF = () => {
  const link = document.createElement("a");
  link.href = pdfUrl.value;
  link.download = `Fechamento_${fechamentoAtualParaDownload.value?.id}.pdf`;
  link.click();
};

const dataStr = computed(() => {
  if (!filtros.value.periodo) return "";

  // O Quasar pode devolver string "2026/02/01" ou objeto {from, to}
  const f = filtros.value.periodo.from || filtros.value.periodo;
  const t = filtros.value.periodo.to || filtros.value.periodo;

  const formatar = (d) => {
    if (typeof d !== 'string') return "";
    return d.split("/").reverse().join("/"); // Transforma 2026/02/01 em 01/02/2026
  };

  return f === t ? formatar(f) : `${formatar(f)} - ${formatar(t)}`;
});

const limparFiltros = () => {
  filtros.value = {
    cliente: "",
    placa: "",
    metragem: null,
    produto: null,
    status: null,
    periodo: null,
  };
  router.push(route.path);
};

// O motor que sincroniza e busca
watch(
  () => route.query,
  (novaQuery) => {
    console.log("A URL mudou! Novos parâmetros:", novaQuery);
    sincronizarFiltrosPelaUrl();
    carregarDados();
  },
  { deep: true, immediate: true }
);

// Monitora os inputs. Quando você digita, ele atualiza a URL.

const atualizarUrlComDebounce = debounce(() => {
      const queryParams = {
      searchCliente: filtros.value.cliente || undefined,
      searchPlaca: filtros.value.placa || undefined,
      searchProduto: filtros.value.produto || undefined,
      searchStatus: filtros.value.status || undefined,
      searchMetragem: filtros.value.metragem || undefined,
    };

    if (filtros.value.periodo) {
      const f = filtros.value.periodo.from || filtros.value.periodo;
      const t = filtros.value.periodo.to || filtros.value.periodo;
      queryParams.from = f.replaceAll("/", "-");
      queryParams.to = t.replaceAll("/", "-");
    } else {
      delete queryParams.from;
      delete queryParams.to;
    }

    // Atualiza a URL sem criar 1000 itens no histórico do navegador (replace: true)
    router.push({ query: queryParams, replace: true });
}, 500);

watch(
  () => filtros.value,
  () => {
    atualizarUrlComDebounce();
  },
  { deep: true } // Importante para detectar mudanças dentro do objeto
);

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
  return rowsPedidos.value.reduce((acc, row) => {
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

const veiculosDoCliente = computed(() => {
  if (!pedidoEdicao.value.clientId) return [];

  // Filtra a lista geral mantendo apenas os veículos cujo dono é o cliente do pedido
  return listaVeiculos.value.filter(
    (v) => v.clientId === pedidoEdicao.value.clientId,
  );
});

watch(
  () => pedidoEdicao.value.produtoId,
  (novoId) => {
    const produto = listaProdutos.value.find((p) => p.id === novoId);
    if (produto) {
      const valorBase = parseFloat(produto.valor_m3) || 0;
      pedidoEdicao.value.produto_valor = valorBase.toFixed(2);
    }
  },
);

watch(
  () => pedidoEdicao.value.veiculoId,
  (novoVeiculoId) => {
    // Procuramos o veículo dentro da lista filtrada
    const veiculo = veiculosDoCliente.value.find((v) => v.id === novoVeiculoId);

    if (veiculo) {
      // A metragem do pedido passa a ser a metragem/capacidade do veículo selecionado
      pedidoEdicao.value.metragem = veiculo.metragem;
    }
  },
);

watch(
  [() => pedidoEdicao.value.metragem, () => pedidoEdicao.value.produto_valor],
  ([novaMetragem, novoValorUnitario]) => {
    const m = parseFloat(novaMetragem) || 0;
    const v = parseFloat(novoValorUnitario) || 0;

    pedidoEdicao.value.valor_total = (m * v).toFixed(2);
  },
);

onMounted(async () => {
  (sincronizarFiltrosPelaUrl(),
    await carregarDados(),
    await carregarDadosIniciais());
});
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
</style>
