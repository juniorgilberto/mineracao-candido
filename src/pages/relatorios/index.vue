<template>
  <q-page padding>
    <!-- Toolbar -->
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title>Relatórios</q-toolbar-title>
      <div class="row items-center q-gutter-sm">
        <q-btn
          dense
          flat
          icon="download"
          label="Exportar CSV"
          @click="exportCSV"
        />
        <q-btn dense flat icon="print" label="Imprimir" @click="printTable" />
      </div>
    </q-toolbar>

    <!-- Filtros -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="row wrap q-gutter-md">
          <q-input
            dense
            outlined
            v-model="filtroBusca"
            label="Pesquisar (cliente, descrição)"
            clearable
          />
          <q-select
            dense
            outlined
            v-model="filtroStatus"
            :options="statusOptions"
            label="Status"
            emit-value
            map-options
            clearable
          />
          <q-input
            dense
            outlined
            v-model="filtroDataInicio"
            type="date"
            label="Data início"
          />
          <q-input
            dense
            outlined
            v-model="filtroDataFim"
            type="date"
            label="Data fim"
          />
          <q-btn dense color="primary" label="Aplicar" @click="page = 1" />
          <q-btn dense flat label="Limpar" @click="limparFiltros" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabela -->
    <q-card class="q-mt-md">
      <div class="q-pa-md">
        <q-table
          title="Relatório de Pedidos"
          :rows="rows"
          :columns="columns"
          row-key="id"
          v-model:pagination="pagination"
          flat
          bordered
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="props.value === 'PENDENTE' ? 'orange' : 'green'"
                text-color="white"
                dense
                square
              >
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-valor_total="props">
            <q-td :props="props">
              {{ formatCurrency(props.value) }}
            </q-td>
          </template>
        </q-table>
      </div>
    </q-card>

    <!-- Dialog de detalhes -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 350px; max-width: 700px">
        <q-card-section>
          <div class="text-h6">Detalhes do relatório</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-sm">
            <div><strong>ID:</strong> {{ detalhe.id }}</div>
            <div><strong>Cliente:</strong> {{ detalhe.cliente }}</div>
            <div><strong>Descrição:</strong> {{ detalhe.descricao }}</div>
            <div><strong>Data:</strong> {{ formatDate(detalhe.data) }}</div>
            <div><strong>Status:</strong> {{ detalhe.status }}</div>
            <div>
              <strong>Valor:</strong> {{ formatCurrency(detalhe.valor) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { date } from 'quasar'

/* Colunas da tabela */
const columns = [
  { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
  {
    name: 'data',
    align: 'left',
    label: 'Data',
    field: 'data_do_pedido',
    format: val => date.formatDate(val, 'DD/MM/YYYY HH:mm'),
    sortable: true,
    sort: (a, b) => new Date(a) - new Date(b)
  },
  { name: 'cliente', align: 'left', label: 'Cliente', field: row => row.client.nome, sortable: true },
  { name: 'produto', align: 'left', label: 'Produto', field: row => row.produto.nome, sortable: true },
  { name: 'placa', align: 'left', label: 'Veículo', field: row => row.veiculo ? row.veiculo.placa : 'SEM PLACA' },
  { name: 'metragem', align: 'center', label: 'Metragem (m³)', field: 'metragem' },
  { name: 'valor_total', align: 'right', label: 'Total', field: 'valor_total', sortable: true },
  { name: 'status', align: 'center', label: 'Status', field: 'status' }
]

/* Opções de status */
const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Pendente', value: 'PENDENTE' },
  { label: 'Pago', value: 'PAGO' },
  { label: 'Em Fechamento', value: 'EM_FECHAMENTO' }
]
const rows = ref([])

async function getPedidos() {
  try {
    const response = await api.get('/pedidos')
    rows.value = response.data
    console.log(response.data);

  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
  }
}
const pagination = ref({
  sortBy: 'data',    // Nome da coluna definida em 'name'
  descending: true,  // 'true' para o mais recente primeiro
  rowsPerPage: 10
})


/* Filtros */
const filtroBusca = ref('')
const filtroStatus = ref(null)
const filtroDataInicio = ref('')
const filtroDataFim = ref('')

const limparFiltros = () => {
  filtroBusca.value = ''
  filtroStatus.value = null
  filtroDataInicio.value = ''
  filtroDataFim.value = ''
  page.value = 1
}


/* Utilitários */
function formatCurrency(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}
function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('pt-BR')
}

/* Exportar CSV */
function exportCSV() {
  const dados = filteredRows.value
  if (!dados.length) {
    // sem dados
    return
  }
  const cols = ['id', 'cliente', 'descricao', 'data', 'status', 'valor']
  const header = ['ID', 'Cliente', 'Descrição', 'Data', 'Status', 'Valor']
  const csv = [header.join(';')]
  dados.forEach(r => {
    const linha = cols.map(c => {
      let v = r[c]
      if (c === 'valor') v = formatCurrency(v)
      if (typeof v === 'string') v = v.replace(/"/g, '""')
      return `"${v}"`
    }).join(';')
    csv.push(linha)
  })
  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* Imprimir (abre nova janela com tabela simples) */
function printTable() {
  const dados = filteredRows.value
  const win = window.open('', '_blank')
  const styles = `
    <style>
      body{font-family: Arial, Helvetica, sans-serif; padding:20px}
      table{width:100%; border-collapse: collapse}
      th, td{border:1px solid #ccc; padding:6px; text-align:left}
      th{background:#f2f2f2}
      td.right{ text-align:right }
    </style>
  `
  const rowsHtml = dados.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.cliente}</td>
      <td>${r.descricao}</td>
      <td>${formatDate(r.data)}</td>
      <td>${r.status}</td>
      <td class="right">${formatCurrency(r.valor)}</td>
    </tr>
  `).join('')
  win.document.write(`
    <html><head><title>Relatório</title>${styles}</head><body>
    <h2>Relatório — ${new Date().toLocaleString()}</h2>
    <table>
      <thead>
        <tr><th>ID</th><th>Cliente</th><th>Descrição</th><th>Data</th><th>Status</th><th>Valor</th></tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr><td colspan="5" style="text-align:right"><strong>Total:</strong></td><td class="right"><strong>${formatCurrency(totalGeral.value)}</strong></td></tr>
      </tfoot>
    </table>
    </body></html>
  `)
  win.document.close()
  win.focus()
  win.print()
}

onMounted(() => {
  getPedidos()
})
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
</style>
