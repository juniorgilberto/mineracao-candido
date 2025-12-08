<template>
  <q-page padding>

    <!-- Toolbar -->
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title>Relatórios</q-toolbar-title>
      <div class="row items-center q-gutter-sm">
        <q-btn dense flat icon="download" label="Exportar CSV" @click="exportCSV" />
        <q-btn dense flat icon="print" label="Imprimir" @click="printTable" />
      </div>
    </q-toolbar>

    <!-- Filtros -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="row wrap q-gutter-md">
          <q-input dense outlined v-model="filtroBusca" label="Pesquisar (cliente, descrição)" clearable />
          <q-select dense outlined v-model="filtroStatus" :options="statusOptions" label="Status" emit-value map-options clearable />
          <q-input dense outlined v-model="filtroDataInicio" type="date" label="Data início" />
          <q-input dense outlined v-model="filtroDataFim" type="date" label="Data fim" />
          <q-btn dense color="primary" label="Aplicar" @click="page = 1" />
          <q-btn dense flat label="Limpar" @click="limparFiltros" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabela -->
    <q-card class="q-mt-md">
      <q-card-section>
        <q-table
          flat
          :columns="columns"
          :rows="paginatedRows"
          row-key="id"
          @row-click="abrirDetalhes"
          separator="horizontal"
        >
          <template v-slot:top-right>
            <div class="text-subtitle2">Total visível: {{ formatCurrency(totalVisivel) }}</div>
          </template>

          <template v-slot:body-cell-valor="props">
            <q-td :props="props" align="right">{{ formatCurrency(props.row.valor) }}</q-td>
          </template>

          <template v-slot:body-cell-data="props">
            <q-td :props="props">{{ formatDate(props.row.data) }}</q-td>
          </template>

          <template v-slot:no-data>
            <div class="q-pa-md">Nenhum registro encontrado.</div>
          </template>
        </q-table>

        <!-- Paginação custom -->
        <div class="row items-center justify-between q-mt-md">
          <div>
            <q-select dense outlined v-model="rowsPerPage" :options="rowsPerPageOptions" style="width:120px" />
          </div>
          <div>
            <q-pagination
              v-model="page"
              :max="pageCount"
              boundary-numbers
              max-pages="7"
              color="primary"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog de detalhes -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 350px; max-width: 700px;">
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
            <div><strong>Valor:</strong> {{ formatCurrency(detalhe.valor) }}</div>
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
import { ref, computed } from 'vue'
import { uid } from 'quasar'

/* Colunas da tabela */
const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', sortable: true },
  { name: 'descricao', label: 'Descrição', field: 'descricao', sortable: false },
  { name: 'data', label: 'Data', field: 'data', sortable: true },
  { name: 'status', label: 'Status', field: 'status', sortable: true },
  { name: 'valor', label: 'Valor', field: 'valor', sortable: true, align: 'right' }
]

/* Opções de status */
const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Pendente', value: 'Pendente' },
  { label: 'Concluído', value: 'Concluído' },
  { label: 'Cancelado', value: 'Cancelado' }
]

/* Dados fictícios iniciais */
function criarMock(qt = 57) {
  const arr = []
  const statuses = ['Pendente', 'Concluído', 'Cancelado']
  const nomes = ['Empresa A', 'Empresa B', 'João Silva', 'Maria Souza', 'Loja X']
  for (let i = 0; i < qt; i++) {
    const dias = Math.floor(Math.random() * 365)
    const data = new Date()
    data.setDate(data.getDate() - dias)
    arr.push({
      id: uid(),
      cliente: nomes[Math.floor(Math.random() * nomes.length)],
      descricao: 'Serviço #' + (i + 1),
      data: data.toISOString().slice(0, 10),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      valor: Number((Math.random() * 5000).toFixed(2))
    })
  }
  return arr
}

const rows = ref(criarMock())

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

/* Paginação */
const page = ref(1)
const rowsPerPage = ref(10)
const rowsPerPageOptions = [5, 10, 20, 50]

const filteredRows = computed(() => {
  return rows.value.filter(r => {
    if (filtroStatus.value && r.status !== filtroStatus.value) return false
    if (filtroBusca.value) {
      const s = filtroBusca.value.toLowerCase()
      if (!(r.cliente.toLowerCase().includes(s) || r.descricao.toLowerCase().includes(s))) {
        return false
      }
    }
    if (filtroDataInicio.value) {
      if (r.data < filtroDataInicio.value) return false
    }
    if (filtroDataFim.value) {
      if (r.data > filtroDataFim.value) return false
    }
    return true
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / rowsPerPage.value)))

const paginatedRows = computed(() => {
  const start = (page.value - 1) * rowsPerPage.value
  return filteredRows.value.slice(start, start + rowsPerPage.value)
})

/* Totais */
const totalVisivel = computed(() => paginatedRows.value.reduce((s, r) => s + r.valor, 0))
const totalGeral = computed(() => filteredRows.value.reduce((s, r) => s + r.valor, 0))

/* Dialog de detalhes */
const dialog = ref(false)
const detalhe = ref({})

const abrirDetalhes = (evt) => {
  detalhe.value = evt
  dialog.value = true
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
</script>

<style scoped>
.q-page { min-height: 100vh; }
</style>
