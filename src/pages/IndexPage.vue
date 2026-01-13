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
        <q-btn label="+ Nova Venda" color="positive" @click="cardVenda = true" />
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


    <div v-if="!pedidosAgrupados.length" class="text-center text-grey-7 q-mt-xl">
      Nenhuma venda lançada no dia de hoje. Clique em <b>Nova Venda</b> para cadastrar uma.
    </div>
    <div v-else class="row justify-center q-mt-md q-gutter-md">
      <q-card v-for="cliente in pedidosAgrupados" :key="cliente.nome" class="q-pa-md col-12 col-lg-3 " flat bordered>
          <div class="text-h6 text-primary text-bold">
            {{ cliente.nome }}
          </div>

          <div class="text-caption q-mb-sm">
            {{ Object.keys(cliente.veiculos).length }} caminhão(ões)
          </div>

          <q-separator />

          <q-card-section v-for="(v, chave, index) in cliente.veiculos" :key="chave" class="q-pa-none">
            <q-separator v-if="index !== 0" />

            <div class="row justify-between items-center q-pa-md">
              <div>
                <div class="text-bold">{{ v.placa }}</div>
                <div class="text-grey-7">
                  {{ v.produto }} • {{ v.metragem }} m³
                </div>
                <div class="text-grey-7">Carga: R$ {{ (v.metragem * v.produto_valor).toFixed(2) }}</div>
              </div>

              <div class="row items-center">
                <q-badge color="blue-2" text-color="primary" class="q-mr-md">
                  {{ v.viagens }} viagem(s)
                </q-badge>
                <q-btn size="md" color="primary" unelevated label="+ VIAGEM" @click="abrirModal(v, cliente)" />
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
          <div><b>Cliente:</b> {{ pedidoSelecionado?.nome }}</div>
          <div><b>Placa:</b> {{ pedidoSelecionado?.dadosVeiculo.placa || 'SEM PLACA' }}</div>
          <div><b>Metragem:</b> {{ pedidoSelecionado?.dadosVeiculo.metragem }} m³</div>
          <div><b>Valor:</b> R$ {{ pedidoSelecionado?.dadosVeiculo.produto_valor }}</div>
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
import { ref, watch, onMounted, computed } from 'vue'
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

function abrirModal(dadosVeiculo, cliente) {
  pedidoSelecionado.value = {
    nome: cliente.nome,
    clientId: cliente.clienteId,
    dadosVeiculo
  }
  console.log(pedidoSelecionado.value);

  modalConfirmacao.value = true
}

function confirmarViagem() {
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

async function getPedidos() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data } = await api.get("/pedidos/", {
    // params: {
    //   from: hoje,
    //   to: hoje
    // }
  });
  return data;

}

async function carregarPedidos() {
  const hide = $q.loading.show({
    message: 'Carregando pedidos...'
  });

  try {
    pedidos.value = await getPedidos();
  } finally {
    hide();

  }
}

// MUDAR ISSO PARA O BACK-END
const pedidosAgrupados = computed(() => {
  const detalhes = {}

  pedidos.value.forEach(p => {
    const clienteId = p.client.id
    const placa = p.veiculo?.placa || 'SEM PLACA'
    const metragem = p.metragem

    if (!detalhes[clienteId]) {
      detalhes[clienteId] = {
        nome: p.client.nome,
        clienteId: clienteId,
        veiculos: {}
      }
    }

    const chave = `${placa}-${p.produto.nome}-${metragem}-${p.produto_valor}`;
    if (!detalhes[clienteId].veiculos[chave]) {
      detalhes[clienteId].veiculos[chave] = {
        placa: placa,
        produto: p.produto.nome,
        metragem: metragem,
        produto_valor: p.produto_valor,
        viagens: 0
      }
    }
    detalhes[clienteId].veiculos[chave].viagens++
  })
  return Object.values(detalhes)
})

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
