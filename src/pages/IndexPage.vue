<template>
  <q-page padding>
    <q-toolbar class="row justify-center">
      <div class="row justify-end items-center">
        <div class="text-subtitle1 text-grey text-center col-12 col-md-auto">Hoje: {{ new Date().toLocaleDateString('pt-BR') }}</div>
        <q-btn class="col-12 col-md-auto q-ml-md" label="+ Nova Venda" color="positive" @click="cardVenda = true" />
      </div>

    </q-toolbar>


    <q-dialog v-model="cardVenda">
      <q-card class="my-card">
        <q-form id="novaVenda" class="q-pa-lg" ref="formVendas" @submit.prevent="salvarVenda">
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

          <q-select outlined v-model="veiculoId" :options="veiculos" option-value="id" option-label="placa" emit-value
            map-options :disable="!clientId" :loading="carregandoVeiculos" label="Placa do Veículo" class="q-mt-md">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Nenhum veículo cadastrado.
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select outlined v-model="produtoId" label="Produto" :options=produtos option-value="id" option-label="nome"
            emit-value map-options class="q-mt-md col-5" />
          <q-input label="M³" outlined type="number" v-model="metrosCubicos" class="q-mt-md" />
          <q-input label="Valor M³" prefix="R$" outlined type="number" v-model="valorProduto" option-label="nome"
            class="q-mt-md" />

          <div class="text-center q-mt-md">Valor venda: R$ {{ (valorProduto * metrosCubicos).toFixed(2) }}</div>




          <q-btn class="q-ma-md" style="float: right;" label="Salvar Venda" type="submit" color="primary" />

        </q-form>
      </q-card>
    </q-dialog>


    <div v-if="!pedidos.length" class="text-center text-grey-7 q-mt-xl">
      Nenhuma venda lançada no dia de hoje. Clique em <b>Nova Venda</b> para cadastrar uma.
    </div>
    <div v-else class="row justify-center q-col-gutter-sm">
      <q-card v-for="cliente in pedidos" :key="cliente.nome" class="q-pa-md col-12 col-md-3 q-ma-md" flat bordered>
        <div class="text-h6 text-primary text-bold">
          {{ cliente.nome }}
        </div>

        <div class="text-caption q-mb-sm">
          {{ Object.keys(cliente.veiculos).length }} caminhão(ões)
        </div>

        <q-separator />

        <q-card-section v-for="(v, placa, index) in cliente.veiculos" :key="placa" class="q-pa-none">
          <q-separator v-if="index !== 0" />

          <div class="row justify-between items-center q-pa-md">
            <div>
              <div class="text-bold">{{ v.placa }}</div>
              <div class="text-grey-7">
                {{ v.produto }} • {{ v.metragem }} m³
              </div>
            </div>

            <div class="row items-center">
              <q-badge color="blue-2" text-color="primary" class="q-mr-md">
                {{ v.viagens }} viagem(s)
              </q-badge>
              <q-btn size="sm" color="primary" unelevated label="+ VIAGEM" @click="abrirModal(pedidos)" />
            </div>
          </div>
        </q-card-section>
      </q-card>

    </div>

    <q-dialog v-model="modalConfirmacao">
  <q-card style="min-width: 350px">
    <q-card-section class="text-h6">
      Confirmar Viagem
    </q-card-section>

    <q-card-section>
      <div><b>Cliente:</b> {{ pedidoSelecionado.nome }}</div>
      <div><b>Placa:</b> {{ pedidoSelecionado.placa || 'SEM PLACA' }}</div>
      <div><b>Metragem:</b> {{ pedidoSelecionado.metrosCubicos }} m³</div>
      <div><b>Valor:</b> R$ {{ pedidoSelecionado.valorProduto }}</div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" v-close-popup />
      <q-btn label="Confirmar" color="primary" @click="confirmarViagem" />
    </q-card-actions>
  </q-card>
</q-dialog>



  </q-page>
</template>

<script setup>

import { api } from 'src/boot/axios'
import { ref, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const clientes = ref([])
const clientId = ref(null)
const veiculos = ref([])
const veiculoId = ref(null)
const produtos = ref([])
const produtoId = ref(null)
const pedidos = ref([])
const metrosCubicos = ref(null)
const valorProduto = ref(null)
const formVendas = ref(null)

const carregandoVeiculos = ref(false)
const cardVenda = ref(false)
const modalConfirmacao = ref(false)
const pedidoSelecionado = ref({})

function abrirModal (pedidos) {
  pedidoSelecionado.value = pedidos
  console.log(pedidos);

  modalConfirmacao.value = true
}

function confirmarViagem () {
  modalConfirmacao.value = false
  // ação da viagem
}

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

async function carregarProduto() {
  try {
    const { data } = await api.get('/produtos')
    produtos.value = data
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

  }
}

async function getPedidos() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data } = await api.get("/pedidos/agrupados", {
    params: {
      from: hoje,
      to: hoje
    }
  });
  return data;

}

const salvarVenda = async () => {
  try {
    await api.post('/pedidos', {
    clientId: clientId.value,
    veiculoId: veiculoId.value,
    produtoId: produtoId.value,
    metragem: metrosCubicos.value,
    produto_valor: valorProduto.value
  })
    $q.notify({
      type: 'positive',
      message: 'Venda cadastrada com sucesso!'
    })
    cardVenda.value = false
    carregarPedidos()
  } catch (error) {
    console.error('Erro ao salvar venda:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao cadastrar venda. Tente novamente.'
    })
  }
  formVendas.value.reset()
}

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

watch(produtoId, (id) => {
  if (!id) {
    valorProduto.value = null
    return
  }

  const produto = produtos.value.find(p => p.id === id)
  valorProduto.value = produto.valor_m3 || null
  valorProduto.value = Number(valorProduto.value).toFixed(2)
})
carregarCliente(),
  carregarProduto()

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
