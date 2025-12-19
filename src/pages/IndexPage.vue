<template>
  <q-page padding>
    <q-toolbar class="row q-col-gutter-md justify-around">
      <q-input dense outlined rounded placeholder="Pesquisar (cliente / placa / material...)" debounce="300"
        class="q-mr-sm col-md-6" style="max-width: 360px;">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <div class="row col-md-6 justify-end items-center">
        <div class="text-subtitle1 text-grey q-mr-md">Hoje: {{ new Date().toLocaleDateString('pt-BR') }}</div>
        <q-btn label="+ Nova Venda" color="positive" @click="card = true" />
      </div>

    </q-toolbar>


    <q-dialog v-model="card">
      <q-card class="my-card">
        <q-form class="q-pa-lg">
          <div class="text-h6 q-pb-sm">Nova Venda</div>
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
            <q-select outlined v-model="veiculoId" :options="veiculos" option-value="id" option-label="placa" emit-value
              map-options :disable="!clientId" :loading="carregandoVeiculos" label="Placa do Veículo"
              class="q-mt-md col-5">
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Nenhum veículo cadastrado.
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input label="ou digite nova placa" outlined type="text" class="q-mt-md col-6" />

          </div>
          <div class="row q-gutter-x-md">
            <q-select outlined v-model="modelMaterial" label="Material" :options=material class="q-mt-md col-5" />
            <q-input label="M³" outlined type="number" v-model="metrosCubicos" class="q-mt-md col-6" />
          </div>
          <q-separator />

          <q-btn class="q-ma-md" style="float: right;" label="Salvar Venda" type="submit" color="primary" />
        </q-form>
      </q-card>
    </q-dialog>


    <div v-if="!pedidosAgrupados.length" class="text-center text-grey-7 q-mt-xl">
      Nenhuma venda lançada no dia de hoje. Clique em <b>Nova Venda</b> para cadastrar uma.
    </div>
    <div v-else class="row justify-center q-col-gutter-sm">
      <q-card v-for="cliente in pedidosAgrupados" :key="cliente.nome" class="q-pa-md col-12 col-md-3 q-ma-md" flat
        bordered>
        <div class="text-h6 text-primary text-bold">
          {{ cliente.nome }}
        </div>

        <div class="text-caption q-mb-sm">
          {{ Object.keys(cliente.veiculos).length }} caminhão(ões)
        </div>

        <q-separator />

        <div v-for="(v, placa) in cliente.veiculos" :key="placa" class="q-mt-md row justify-between">
          <div>
            <div class="text-bold">{{ placa }}</div>
            <div class="text-grey-7">
              {{ v.produto }} • {{ v.metragem }} m³
            </div>
          </div>

          <div class="row items-center">
            <q-badge color="blue-2" text-color="primary" class="q-mr-md">
              {{ v.viagens }} viagem(s)
            </q-badge>
            <q-btn size="sm" color="primary" unelevated label="+ Viagem" />
          </div>
          <q-separator />
        </div>
      </q-card>

    </div>



  </q-page>
</template>

<script setup>

import { api } from 'src/boot/axios'
import { ref, watch, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const clientes = ref([])
const clientId = ref(null)
const veiculos = ref([])
const veiculoId = ref(null)
const material = ref([])
const pedidos = ref([])
const metrosCubicos = ref(null)

const carregandoVeiculos = ref(false)
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


async function carregarPedidos() {
  const hide = $q.loading.show();

  try {
    pedidos.value = await getPedidos();
  } finally {
    hide();
    console.log(pedidos);

  }
}

async function getPedidos() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data } = await api.get("/pedidos", {
    params: {
      from: hoje,
      to: hoje
    }
  });
  return data;

}

const pedidosAgrupados = computed(() => {
  const clientes = {}

  pedidos.value.forEach(p => {
    const clienteId = p.client.id
    const placa = p.veiculo?.placa || 'SEM PLACA'

    if (!clientes[clienteId]) {
      clientes[clienteId] = {
        nome: p.client.nome,
        veiculos: {}
      }
    }

    if (!clientes[clienteId].veiculos[placa]) {
      clientes[clienteId].veiculos[placa] = {
        produto: p.produto.nome,
        metragem: p.metragem,
        viagens: 0
      }
    }

    clientes[clienteId].veiculos[placa].viagens++
  })
  console.log(clientes);
  return Object.values(clientes)


})

watch(clientId, (id) => {
  veiculoId.value = null
  veiculos.value = []

  if (!id) return

  carregarVeiculos(id)
})

watch(veiculoId, (id) => {
  if (!id) {
    metrosCubicos.value = null
    return
  }

  const veiculo = veiculos.value.find(v => v.id === id)
  metrosCubicos.value = veiculo?.metragem || null
})

carregarCliente(),
  carregarMaterial()

onMounted(
  carregarPedidos
);


</script>

<style scoped>
.my-card {
  width: 480px;
}

.q-card {
  border-radius: 14px;
}
</style>
