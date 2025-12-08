<template>
  <q-page padding>
    <q-toolbar class="q-mb-md items-center">
      <div class="text-h6">Clientes</div>

      <q-space />

      <q-input v-model="filter" dense outlined rounded placeholder="Pesquisar (nome, e‑mail, telefone)..."
        debounce="300" class="q-mr-sm" style="max-width: 360px;">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-btn color="primary" icon="add" label="Adicionar" @click="onAdd" />
    </q-toolbar>

    <q-table :rows="filtered" :columns="columns" row-key="id" class="text-center" dense flat separator="horizontal">
      <template v-slot:body-cell-actions="props">
        <q-btn flat dense color="primary" icon="edit" @click="onEdit(props.row)" />
        <q-btn flat dense color="negative" icon="delete" class="q-ml-sm" @click="confirmDelete(props.row)" />
      </template>

      <template v-slot:no-data>
        <div class="text-center q-pa-md">
          Nenhum cliente encontrado.
        </div>
      </template>
    </q-table>

    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section class="text-h6">Confirmar exclusão</q-card-section>

        <q-card-section>
          Deseja excluir o cliente
          <strong v-if="toDelete"> {{ toDelete.name }} </strong>?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup @click="deleteDialog = false" />
          <q-btn color="negative" label="Excluir" @click="deleteClient" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
const $q = useQuasar()
const router = useRouter()

// dados de exemplo — substitua por chamada à API conforme necessário
const clients = ref([])

const filter = ref('')

const columns = [
  { name: 'nome', label: 'Nome', field: row => row.nome, sortable: true },
  { name: 'email', label: 'E‑mail', field: 'email', sortable: true },
  { name: 'telefone', label: 'Telefone', field: 'telefone' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' }
]

const filtered = computed(() => {
  const q = filter.value && filter.value.toLowerCase().trim()
  if (!q) return clients.value
  return clients.value.filter(c =>
    (c.name + ' ' + c.email + ' ' + c.telefone).toLowerCase().includes(q)
  )
})

function onAdd() {
  // ajuste a rota conforme sua aplicação (ex.: '/clientes/novo')
  router.push({ name: 'ClientesCreate' }).catch(() => { })
}

function onEdit(row) {
  // ajuste a rota conforme sua aplicação (ex.: '/clientes/:id/editar')
  router.push({ name: 'ClientesEdit', params: { id: row.id } }).catch(() => { })
}

const deleteDialog = ref(false)
const toDelete = ref(null)

function confirmDelete(row) {
  toDelete.value = row
  deleteDialog.value = true
}

function deleteClient() {
  if (!toDelete.value) return
  clients.value = clients.value.filter(c => c.id !== toDelete.value.id)
  deleteDialog.value = false
  $q.notify({ type: 'positive', message: 'Cliente excluído' })
  toDelete.value = null
}

const carregaLista = (async () => {

  try {
    const response = await api.get('/clients')
    clients.value = response.data
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar clientes' })
  }

})

onMounted(() => {

  carregaLista();
  // carregar dados da API aqui, se necessário
})
</script>
