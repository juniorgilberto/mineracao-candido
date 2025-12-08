<template>
  <q-page padding>
    <q-toolbar class="q-mb-md items-center">
      <q-input dense outlined rounded placeholder="Pesquisar (cliente / placa / material...)" debounce="300"
        class="q-mr-sm" style="max-width: 360px;">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-space />
      <q-text class="text-subtitle1 text-grey q-mr-md">Hoje: {{ new Date().toLocaleDateString('pt-BR') }}</q-text>
      <q-btn label="+ Nova Venda" color="positive" @click="card = true" />
    </q-toolbar>


    <q-dialog v-model="card">
      <q-card class="my-card">
        <q-form class="q-pa-lg">
          <q-text class="text-h6">Nova Venda</q-text>
          <q-select id="clienteSelect" outlined v-model="clientId" :options="clientes" option-value="id"
            option-label="nome" label="Cliente" emit-value map-options>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input id="novoClienteModal" label="Novo Cliente" outlined type="text" class="q-mt-md" />

          <div class="flex row q-gutter-x-md">
            <q-select outlined v-model="veiculoId" :options="veiculos" option-value="id" option-label="placa"
              emit-value map-options :disable="!clientId" :loading="carregandoVeiculos" label="Veículo" class="q-mt-md"
              style="width: 30%" />
            <q-input label="ou digite nova placa" outlined type="text" class="q-mt-md" style="width: 60%" />

          </div>
          <div class="row q-gutter-x-md">
            <q-select outlined v-model="modelMaterial" label="Material" :options=material class="q-mt-md"
              style="width: 60%" />
            <q-input label="M³" outlined type="number" class="q-mt-md" style="width: 30%" />
          </div>

          <q-checkbox label="Salvar cliente/caminhão (se novo)" v-model="val" class="q-mt-md" />

          <q-separator />

          <q-btn class="q-ma-md" style="float: right;" label="Salvar Venda" type="submit" color="primary" />
        </q-form>
      </q-card>
    </q-dialog>

    <div class="row q-col-gutter-sm">
      <q-card v-for="pedido in pedidos" :key="pedido.id" class="q-pa-md q-mb-md col-12 col-md-4" flat bordered>
        <div class="text-bold text-primary text-h6">
          {{ pedido.client.nome }}
        </div>

        <div class="text-caption q-mb-sm">
          1 caminhão(ões)
        </div>

        <q-separator />

        <div class="q-mt-md row justify-between">
          <div>
            <div class="text-bold">{{ pedido.veiculo ? pedido.veiculo.placa : 'SEM PLACA DEFINIDA' }}</div>

            <div class="text-grey-7">
              {{ pedido.produto.nome }} • {{ pedido.metragem }} m³
            </div>
          </div>
          <div class="row items-center justify-end ">
            <q-badge color="blue-2 q-pa-sm q-mr-md" text-color="primary">
              1 viagem(s)
            </q-badge>

            <q-btn color="primary" size="sm" unelevated label="+ Viagem" />
          </div>
        </div>

      </q-card>
    </div>



  </q-page>
</template>

<script setup>

import { api } from 'src/boot/axios'
import { ref, watch, onMounted } from 'vue'
const clientes = ref([])
const clientId = ref(null)
const veiculos = ref([])
const veiculoId = ref(null)
const material = ref([])
const pedidos = ref([])

const carregandoVeiculos = ref(false)
const val = ref(false)
const card = ref(false)
const modelMaterial = ref(null)


async function carregarCliente() {
  try {
    const { data } = await api.get('/clients')
    clientes.value = data
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

async function carregarVeiculos(clientId) {
  carregandoVeiculos.value = true
  try {
    const { data } = await api.get('/veiculos', {
      params: { clientId: clientId }
    })
    veiculos.value = Array.isArray(data) ? data : data.veiculos
  } catch (error) {
    console.error('Erro ao carregar veículos:', error)
  } finally {
    carregandoVeiculos.value = false
  }
}

async function carregarMaterial() {
  try {
    const response = await api.get('/produtos')
    material.value = response.data.map(m => m.nome)
  } catch (error) {
    console.error('Erro ao carregar materiais:', error)
  }
}

async function getPedidos() {
  const { data } = await api.get("/pedidos");
  return data;
}

watch(clientId, (id) => {
  veiculoId.value = null
  veiculos.value = []

  if (!id) return

  carregarVeiculos(id)
})

carregarCliente(),
  carregarMaterial()

onMounted(async () => {
  pedidos.value = await getPedidos();
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
